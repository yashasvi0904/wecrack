import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeLogin } from "../../lib/spotify";

// Spotify redirects here after the consent screen. We finish the sign-in and go back.
export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Connecting to Spotify…");
  const ran = useRef(false); // the one-time code must only be used once (StrictMode runs effects twice in dev)

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    completeLogin(new URLSearchParams(window.location.search))
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch((err) => {
        console.error("Spotify sign-in error:", err);
        setMessage(err.message || "Spotify sign-in failed.");
        setTimeout(() => navigate(err.returnTo || "/dashboard", { replace: true }), 2500);
      });
  }, [navigate]);

  return (
    <div className="apple-ui">
      <div className="ux-auth">
        <div className="ux-auth-card" style={{ textAlign: "center" }}>
          <h1 className="ux-auth-title" style={{ fontSize: "26px" }}>
            Spotify
          </h1>
          <p className="ux-auth-sub" style={{ marginBottom: 0 }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
