// Spotify sign-in (Authorization Code flow with PKCE, so no client secret in the browser),
// plus the few Web API calls the music player needs.
//
// Setup (once): create an app at https://developer.spotify.com/dashboard, add the redirect
// URI(s) below, and put the app's Client ID in REACT_APP_SPOTIFY_CLIENT_ID.

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
export const SPOTIFY_CONFIGURED = Boolean(CLIENT_ID);

// Must match a Redirect URI registered in the Spotify dashboard exactly.
// (Spotify no longer accepts "localhost"; use http://127.0.0.1:3000 for local development.)
export const REDIRECT_URI =
  process.env.REACT_APP_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify/callback`;

const SCOPES = [
  "streaming", // play audio in the browser (Web Playback SDK)
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

const TOKEN_KEY = "wecrack.spotify.tokens";
const PKCE_KEY = "wecrack.spotify.pkce";
const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

/* ---------------------------------- PKCE helpers --------------------------------- */

const base64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const randomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
};

export const challengeFor = async (verifier) =>
  base64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));

/* ---------------------------------- token storage -------------------------------- */

const readTokens = () => {
  try {
    return JSON.parse(window.localStorage.getItem(TOKEN_KEY));
  } catch {
    return null;
  }
};
const writeTokens = (tokens) => {
  try {
    if (tokens) window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: the session just won't survive a reload */
  }
};

export const isSignedIn = () => Boolean(readTokens()?.refresh_token);
export const signOut = () => writeTokens(null);

const saveTokenResponse = (data, previous) => {
  const tokens = {
    access_token: data.access_token,
    // Spotify only sends a new refresh token sometimes; keep the old one otherwise
    refresh_token: data.refresh_token || previous?.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  };
  writeTokens(tokens);
  return tokens;
};

const tokenRequest = async (params) => {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.error || "Spotify token request failed");
  return data;
};

/* ------------------------------------ sign in ------------------------------------ */

// Sends the browser to Spotify's consent screen. `returnTo` is where to come back to.
export const startLogin = async (returnTo = "/dashboard") => {
  if (!SPOTIFY_CONFIGURED) throw new Error("Spotify isn't configured");
  const verifier = randomString(96);
  const state = randomString(24);
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, returnTo }));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: "S256",
    code_challenge: await challengeFor(verifier),
  });
  window.location.assign(`${AUTH_URL}?${params}`);
};

// Called on the redirect page. Exchanges the code for tokens and returns the path to go back to.
export const completeLogin = async (searchParams) => {
  const saved = JSON.parse(sessionStorage.getItem(PKCE_KEY) || "null");
  sessionStorage.removeItem(PKCE_KEY);

  if (searchParams.get("error")) {
    const e = new Error(
      searchParams.get("error") === "access_denied"
        ? "Spotify sign-in was cancelled."
        : `Spotify sign-in failed (${searchParams.get("error")}).`
    );
    e.returnTo = saved?.returnTo;
    throw e;
  }
  const code = searchParams.get("code");
  if (!saved || !code || searchParams.get("state") !== saved.state) {
    const e = new Error("Spotify sign-in couldn't be verified. Please try again.");
    e.returnTo = saved?.returnTo;
    throw e;
  }
  try {
    const data = await tokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: saved.verifier,
    });
    saveTokenResponse(data);
  } catch (err) {
    err.returnTo = saved.returnTo;
    throw err;
  }
  return saved.returnTo || "/dashboard";
};

/* ------------------------------------- API --------------------------------------- */

// A valid access token, refreshed shortly before it expires.
export const getAccessToken = async () => {
  const tokens = readTokens();
  if (!tokens?.refresh_token) throw new Error("Not signed in to Spotify");
  if (tokens.access_token && tokens.expires_at - 60 * 1000 > Date.now()) return tokens.access_token;
  try {
    const data = await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.refresh_token });
    return saveTokenResponse(data, tokens).access_token;
  } catch (err) {
    signOut(); // the grant was revoked or expired: ask the user to sign in again
    throw err;
  }
};

const api = async (path, { method = "GET", body } = {}) => {
  const token = await getAccessToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(data?.error?.message || `Spotify request failed (${res.status})`);
    e.status = res.status;
    throw e;
  }
  return data;
};

export const searchTracks = async (query) => {
  const data = await api(`/search?q=${encodeURIComponent(query)}&type=track&limit=8`);
  return (data?.tracks?.items || []).map((t) => ({
    uri: t.uri,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(", "),
    image: (t.album.images[1] || t.album.images[0])?.url || "",
  }));
};

// Make the in-browser player the active device without starting playback.
export const transferPlayback = (deviceId) =>
  api("/me/player", { method: "PUT", body: { device_ids: [deviceId], play: false } });

export const playTrack = (deviceId, uri) =>
  api(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, { method: "PUT", body: { uris: [uri] } });

/* ------------------------------ Web Playback SDK --------------------------------- */

let sdkPromise;
export const loadSdk = () => {
  if (window.Spotify) return Promise.resolve(window.Spotify);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify);
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onerror = () => {
        sdkPromise = undefined;
        reject(new Error("Couldn't load the Spotify player"));
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
};

/* --------------------------- pasted links (no sign-in) --------------------------- */

// Accepts open.spotify.com links and spotify: URIs for things the embed player can show.
export const parseSpotifyLink = (text) => {
  const value = (text || "").trim();
  const web = value.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
  if (web) return { type: web[1], id: web[2] };
  const uri = value.match(/^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)$/);
  return uri ? { type: uri[1], id: uri[2] } : null;
};
