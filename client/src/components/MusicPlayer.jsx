import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Music, Play, Pause, SkipBack, SkipForward, Search, X, LogOut, Link2 } from "lucide-react";
import {
  SPOTIFY_CONFIGURED,
  isSignedIn,
  signOut,
  startLogin,
  loadSdk,
  getAccessToken,
  transferPlayback,
  playTrack,
  searchTracks,
  parseSpotifyLink,
} from "../lib/spotify";

// Pages where the player is shown. It stays mounted (just hidden) elsewhere, so music keeps playing.
const VISIBLE_ON = ["/dashboard", "/habits", "/library"];

const SpotifyMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1DB954" />
    <path d="M5.8 8.6c4.2-1.2 8.6-.9 12.3 1.2" stroke="#0a0706" strokeWidth="1.9" strokeLinecap="round" fill="none" />
    <path d="M6.6 12c3.5-.9 7-.6 10 1" stroke="#0a0706" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    <path d="M7.4 15.1c2.8-.7 5.3-.4 7.6.9" stroke="#0a0706" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export default function MusicPlayer() {
  const { pathname } = useLocation();
  const visible = VISIBLE_ON.includes(pathname);

  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(isSignedIn);
  // "idle" | "loading" | "ready" | "premium" | "error"
  const [sdk, setSdk] = useState("idle");
  const [message, setMessage] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [track, setTrack] = useState(null);
  const [paused, setPaused] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [link, setLink] = useState("");
  const [embed, setEmbed] = useState(null);

  const playerRef = useRef(null);

  /* ---- start the in-browser Spotify player once signed in ---- */
  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    setSdk("loading");
    setMessage("");

    loadSdk()
      .then((Spotify) => {
        if (cancelled) return;
        const player = new Spotify.Player({
          name: "WeCrack",
          getOAuthToken: (cb) => getAccessToken().then(cb).catch(() => {}),
          volume: 0.7,
        });
        playerRef.current = player;

        player.addListener("ready", ({ device_id }) => {
          setDeviceId(device_id);
          setSdk("ready");
          transferPlayback(device_id).catch(() => {});
        });
        player.addListener("not_ready", () => setSdk("loading"));
        player.addListener("player_state_changed", (state) => {
          if (!state) return;
          const t = state.track_window.current_track;
          setTrack({
            name: t.name,
            artists: t.artists.map((a) => a.name).join(", "),
            image: t.album.images[0]?.url || "",
          });
          setPaused(state.paused);
        });
        player.addListener("account_error", () => {
          setSdk("premium");
          setMessage("Spotify Premium is needed to play inside WeCrack.");
        });
        player.addListener("authentication_error", () => {
          signOut();
          setSignedIn(false);
          setSdk("idle");
          setMessage("Your Spotify session expired. Please sign in again.");
        });
        player.addListener("initialization_error", () => {
          setSdk("error");
          setMessage("This browser can't play Spotify audio. Try Chrome, Edge or Firefox.");
        });
        player.addListener("playback_error", ({ message: m }) => setMessage(m || "Playback failed."));
        player.connect();
      })
      .catch((err) => {
        if (cancelled) return;
        setSdk("error");
        setMessage(err.message);
      });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [signedIn]);

  /* ---- search (debounced) ---- */
  useEffect(() => {
    const q = query.trim();
    if (!signedIn || sdk !== "ready" || q.length < 2) {
      setResults([]);
      return undefined;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        setResults(await searchTracks(q));
        setMessage("");
      } catch (err) {
        setResults([]);
        setMessage(
          err.status === 403
            ? "Spotify blocked this request. If the app is in development mode, ask the owner to add your Spotify email."
            : "Search failed. Please try again."
        );
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query, signedIn, sdk]);

  const signIn = async () => {
    setMessage("");
    try {
      await startLogin(pathname);
    } catch (err) {
      console.warn(err);
      setMessage(
        SPOTIFY_CONFIGURED ? "Couldn't start Spotify sign-in." : "Spotify sign-in isn't available right now."
      );
    }
  };

  const logOut = () => {
    signOut();
    setSignedIn(false);
    setSdk("idle");
    setTrack(null);
    setResults([]);
    setQuery("");
    setMessage("");
  };

  const play = useCallback(
    async (uri) => {
      if (!deviceId) return;
      try {
        playerRef.current?.activateElement?.(); // lets browsers with strict autoplay rules start audio
        await playTrack(deviceId, uri);
        setMessage("");
      } catch (err) {
        setMessage(err.status === 403 ? "Spotify Premium is needed to play inside WeCrack." : "Couldn't play that track.");
      }
    },
    [deviceId]
  );

  const toggle = () => {
    playerRef.current?.activateElement?.();
    playerRef.current?.togglePlay();
  };

  const openLink = (e) => {
    e.preventDefault();
    const parsed = parseSpotifyLink(link);
    if (!parsed) {
      setMessage("Paste a Spotify link, for example https://open.spotify.com/track/…");
      return;
    }
    setMessage("");
    setEmbed(parsed);
  };

  const showPlayer = signedIn && sdk === "ready";

  return (
    <div className="apple-ui ux-mp-root">
    <div className="ux-mp" style={{ display: visible ? undefined : "none" }}>
      {open && (
        <div className="ux-mp-panel" role="dialog" aria-label="Music player">
          <div className="ux-mp-head">
            <strong>
              <SpotifyMark /> Music
            </strong>
            <div style={{ display: "flex", gap: 6 }}>
              {signedIn && (
                <button type="button" className="ux-btn ghost ux-icon-btn" onClick={logOut} aria-label="Sign out of Spotify" title="Sign out of Spotify">
                  <LogOut size={16} />
                </button>
              )}
              <button type="button" className="ux-btn ghost ux-icon-btn" onClick={() => setOpen(false)} aria-label="Close music player">
                <X size={16} />
              </button>
            </div>
          </div>

          {!signedIn && (
            <>
              <p className="ux-mp-note">Sign in with Spotify to search and play any song while you study.</p>
              <button type="button" className="ux-btn ux-spotify block" onClick={signIn}>
                <SpotifyMark size={20} /> Sign in with Spotify
              </button>
            </>
          )}

          {signedIn && sdk === "loading" && <p className="ux-mp-note">Connecting to Spotify…</p>}

          {showPlayer && (
            <>
              <div className="ux-mp-search">
                <Search size={17} />
                <input
                  type="search"
                  aria-label="Search songs"
                  placeholder="Search songs or artists"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {searching && <p className="ux-mp-note">Searching…</p>}
              {results.length > 0 && (
                <ul className="ux-mp-results">
                  {results.map((r) => (
                    <li key={r.uri}>
                      <button type="button" onClick={() => play(r.uri)}>
                        {r.image ? <img src={r.image} alt="" width="40" height="40" /> : <span className="ux-mp-art" />}
                        <span className="ux-mp-meta">
                          <b>{r.name}</b>
                          <small>{r.artists}</small>
                        </span>
                        <Play size={16} fill="currentColor" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="ux-mp-now">
                {track ? (
                  <>
                    {track.image ? <img src={track.image} alt="" width="52" height="52" /> : <span className="ux-mp-art" />}
                    <span className="ux-mp-meta">
                      <b>{track.name}</b>
                      <small>{track.artists}</small>
                    </span>
                  </>
                ) : (
                  <span className="ux-mp-note" style={{ margin: 0 }}>
                    Search for a song to start playing.
                  </span>
                )}
              </div>
              <div className="ux-mp-controls">
                <button type="button" className="ux-btn ghost ux-icon-btn" onClick={() => playerRef.current?.previousTrack()} aria-label="Previous track">
                  <SkipBack size={16} fill="currentColor" />
                </button>
                <button type="button" className="ux-btn ux-icon-btn" style={{ width: 46, height: 46 }} onClick={toggle} aria-label={paused ? "Play" : "Pause"} disabled={!track}>
                  {paused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                </button>
                <button type="button" className="ux-btn ghost ux-icon-btn" onClick={() => playerRef.current?.nextTrack()} aria-label="Next track">
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>
            </>
          )}

          {message && (
            <div role="alert" className="ux-alert error" style={{ marginTop: 12, textAlign: "left" }}>
              {message}
            </div>
          )}

          {/* Works for everyone, signed in or not (and without Premium) */}
          {!showPlayer && (
            <form className="ux-mp-link" onSubmit={openLink}>
              <label htmlFor="spotify-link" className="ux-cap muted">
                <Link2 size={14} style={{ verticalAlign: "-2px" }} /> Or paste a Spotify link
              </label>
              <div className="ux-form-row">
                <input
                  id="spotify-link"
                  type="text"
                  placeholder="https://open.spotify.com/…"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
                <button type="submit" className="ux-btn ghost" style={{ flex: "0 0 auto" }}>
                  Open
                </button>
              </div>
            </form>
          )}
          {embed && !showPlayer && (
            <iframe
              title="Spotify player"
              className="ux-mp-embed"
              src={`https://open.spotify.com/embed/${embed.type}/${embed.id}?theme=0`}
              height={embed.type === "track" || embed.type === "episode" ? 152 : 352}
              allow="encrypted-media; clipboard-write"
              loading="lazy"
            />
          )}
        </div>
      )}

      <button type="button" className="ux-mp-pill" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Music">
        <Music size={18} />
        <span className="ux-mp-pill-text">{showPlayer && track ? track.name : "Music"}</span>
        {showPlayer && track && (
          <span
            role="button"
            tabIndex={0}
            className="ux-mp-pill-play"
            aria-label={paused ? "Play" : "Pause"}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                toggle();
              }
            }}
          >
            {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
          </span>
        )}
      </button>
    </div>
    </div>
  );
}
