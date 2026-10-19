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
