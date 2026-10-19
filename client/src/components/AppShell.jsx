import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  CalendarCheck,
  ChartColumn,
  Library,
  FlaskConical,
  Calendar,
  LogOut,
} from "lucide-react";
import { Clock } from "./ui";

// Sidebar + top bar used by the dashboard and the habit tracker.
// `tabs` are quick links in the top bar: [{ label, id }] scroll to element ids.
export default function AppShell({ active, userName: nameProp, tabs = [], bare = false, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [fetchedName, setFetchedName] = useState("");
  const userName = nameProp || fetchedName;

  // Pages that don't load the profile themselves get the name from here
  useEffect(() => {
    if (nameProp || !process.env.REACT_APP_USER_DETAILS) return;
    axios
      .get(process.env.REACT_APP_USER_DETAILS, { withCredentials: true })
      .then((res) => setFetchedName(res.data?.user?.name || ""))
      .catch(() => {});
  }, [nameProp]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  // Go to a route, then (optionally) to a section inside it.
  const go = (path, id) => {
    if (pathname !== path) {
      navigate(path);
      if (id) setTimeout(() => scrollTo(id), 450);
    } else if (id) {
      scrollTo(id);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const logout = async () => {
    try {
      if (process.env.REACT_APP_LOGOUT_USER) {
        await axios.get(process.env.REACT_APP_LOGOUT_USER, { withCredentials: true });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login");
    }
  };

  const nav = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, onClick: () => go("/dashboard") },
    { key: "habits", label: "Habits", icon: CalendarCheck, onClick: () => go("/habits") },
    { key: "mock", label: "Mock test", icon: FlaskConical, onClick: () => go("/mock-test") },
    { key: "scores", label: "Scores", icon: ChartColumn, onClick: () => go("/dashboard", "scores") },
    { key: "library", label: "Library", icon: Library, onClick: () => go("/library") },
  ];

  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long" });
  const initial = (userName || "?").trim().charAt(0).toUpperCase();

  // `bare`: the page already provides the .apple-ui theme wrapper itself
  const shell = (
    <div className="ux-shell">
      <aside className="ux-side">
        <div className="ux-brand">
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
            <defs>
              <linearGradient id="wc-logo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb15c" />
                <stop offset="100%" stopColor="#ff6fae" />
              </linearGradient>
            </defs>
            <path d="M17 3 L31 29 H3 Z" fill="url(#wc-logo)" />
            <path d="M17 13 L24 26 H10 Z" fill="#0a0706" opacity="0.55" />
          </svg>
          WeCrack
        </div>

        <nav className="ux-nav" aria-label="Main">
          {nav.map(({ key, label, icon: Icon, onClick }) => (
            <button
              key={key}
              type="button"
              className={`ux-nav-item${active === key ? " active" : ""}`}
              aria-current={active === key ? "page" : undefined}
              onClick={onClick}
            >
              <Icon size={22} strokeWidth={1.8} />
              {label}
            </button>
          ))}
          <div className="ux-nav-sep" />
          <button type="button" className="ux-nav-item" onClick={logout}>
            <LogOut size={22} strokeWidth={1.8} />
            Log out
          </button>
        </nav>

        <div className="ux-side-widget">
          <Clock />
        </div>
      </aside>

      <main className="ux-main">
        <div className="ux-top">
          <div className="ux-tabs">
            {tabs.length === 0 ? (
              <span className="ux-tab active">Me</span>
            ) : (
              tabs.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  className={`ux-tab${i === 0 ? " active" : ""}`}
                  onClick={() => (t.id ? go(t.path || pathname, t.id) : go(t.path || pathname))}
                >
                  {t.label}
                </button>
              ))
            )}
          </div>
          <div className="ux-top-right">
            <div className="ux-date">
              <Calendar size={22} strokeWidth={1.7} color="var(--label-2)" />
              {today}
            </div>
            <div className="ux-avatar" aria-label={userName ? `Signed in as ${userName}` : "Account"}>
              {initial}
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
  return bare ? shell : <div className="apple-ui">{shell}</div>;
}
