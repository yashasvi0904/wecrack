import { useEffect, useId, useState } from "react";

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, Number(n) || 0));

// Circular progress ring with a gradient stroke and centred content.
export function Ring({ value = 0, size = 128, stroke = 5, colors = ["#ff7a5c", "#ff4d79"], children }) {
  const id = useId();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = clamp(value);
  return (
    <div className="ring-wrap" style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--label)" }}>
        {children}
      </div>
    </div>
  );
}

// Speedometer-style gauge (240 degree arc) with a needle.
export function Gauge({ value = 0, size = 190, colors = ["#ff7a5c", "#ffb15c"] }) {
  const id = useId();
  const c = 100;
  const r = 78;
  const start = -210;
  const sweep = 240;
  const pt = (deg, rad = r) => {
    const a = (deg * Math.PI) / 180;
    return [c + rad * Math.cos(a), c + rad * Math.sin(a)];
  };
  const arc = (from, to) => {
    const [x1, y1] = pt(from);
    const [x2, y2] = pt(to);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  const pct = clamp(value);
  const end = start + (sweep * pct) / 100;
  const [nx, ny] = pt(end, 58);
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 200 164" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path d={arc(start, start + sweep)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="14" strokeLinecap="round" />
      {pct > 0 && (
        <path d={arc(start, end)} fill="none" stroke={`url(#${id})`} strokeWidth="14" strokeLinecap="round" />
      )}
      <line x1={c} y1={c} x2={nx} y2={ny} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx={c} cy={c} r="7" fill="#fff" />
    </svg>
  );
}

// Live analog clock (ticks every second) with a digital readout underneath.
export function Clock({ size = 168 }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sec = now.getSeconds();
  const min = now.getMinutes() + sec / 60;
  const hour = (now.getHours() % 12) + min / 60;
  const c = 100;
  const hand = (deg, len, width, color) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return (
      <line
        x1={c}
        y1={c}
        x2={c + len * Math.cos(a)}
        y2={c + len * Math.sin(a)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx={c} cy={c} r="94" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          const r1 = major ? 78 : 85;
          return (
            <line
              key={i}
              x1={c + r1 * Math.sin(a)}
              y1={c - r1 * Math.cos(a)}
              x2={c + 90 * Math.sin(a)}
              y2={c - 90 * Math.cos(a)}
              stroke={major ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)"}
              strokeWidth={major ? 3 : 1.2}
              strokeLinecap="round"
            />
          );
        })}
        {hand(hour * 30, 48, 6, "#f6f2ef")}
        {hand(min * 6, 72, 4, "#f6f2ef")}
        {hand(sec * 6, 80, 2, "#ff7a5c")}
        <circle cx={c} cy={c} r="6" fill="#ff7a5c" />
        <circle cx={c} cy={c} r="2.5" fill="#1b1716" />
      </svg>
      <div
        role="timer"
        aria-label="Current time"
        style={{ fontSize: "28px", fontWeight: 500, fontVariantNumeric: "tabular-nums", marginTop: 6, letterSpacing: "0.01em" }}
      >
        {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </div>
      <div className="ux-cap muted" style={{ textTransform: "uppercase", letterSpacing: ".04em", marginTop: 2 }}>
        {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}
      </div>
    </div>
  );
}

// WeCrack logo mark (gradient triangle)
export function Logo({ size = 34 }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb15c" />
          <stop offset="100%" stopColor="#ff6fae" />
        </linearGradient>
      </defs>
      <path d="M17 3 L31 29 H3 Z" fill={`url(#${id})`} />
      <path d="M17 13 L24 26 H10 Z" fill="#0a0706" opacity="0.55" />
    </svg>
  );
}

// Text input with a leading icon and optional trailing control (e.g. show/hide password).
export function Field({ icon: Icon, error, trailing, ...inputProps }) {
  return (
    <div className="ux-field-wrap">
      <div className={`ux-field${error ? " err" : ""}`}>
        {Icon && <Icon size={19} strokeWidth={1.8} />}
        <input aria-invalid={error ? "true" : undefined} {...inputProps} />
        {trailing}
      </div>
      {error && <span className="ux-field-err">{error}</span>}
    </div>
  );
}

// Google "G" mark for the sign-in / sign-up buttons
export function GoogleMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
