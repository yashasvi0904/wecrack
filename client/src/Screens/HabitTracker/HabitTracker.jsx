import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useHabitData, { SYNC_ENABLED, useTodayKey } from "./useHabitData";
import { computeStats, fromKey } from "./habitStats";

// WeCrack palette (same beige / black family as the dashboard).
const C = {
  ink: "#000000",
  paper: "#F2F2F2",
  sand: "#EAE4D5",
  taupe: "#B6B09F",
  surface: "#FFFFFF",
  hair: "#E4DFD1",
  muted: "#6B675C", // readable secondary text (taupe is too faint for text)
  todayBg: "#F7F4EC",
};

const ICONS = ["🎯", "🏋️", "📚", "🧠", "💻", "📝", "😴", "🏃", "💧", "🧘", "🥗", "⏰"];
const SUGGESTIONS = [
  { icon: "📚", name: "Study 2 hours" },
  { icon: "📝", name: "Solve PYQs" },
  { icon: "🧠", name: "Revise notes" },
  { icon: "🏋️", name: "Gym" },
  { icon: "😴", name: "Sleep on time" },
];
const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];
const MAX_HABITS = 20;

const STATUS_TEXT = {
  local: "Saved on this device",
  syncing: "Syncing…",
  synced: "Synced to your account",
  offline: "Offline — saved on this device",
};

const cardStyle = {
  background: C.surface,
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  marginBottom: "16px",
};
const h2Style = { fontSize: "22px", margin: 0, color: C.ink, fontWeight: 600 };
const primaryBtn = {
  background: C.ink,
  color: C.paper,
  border: "none",
  borderRadius: "8px",
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};
const ghostBtn = {
  background: C.paper,
  color: C.ink,
  border: `2px solid ${C.taupe}`,
  borderRadius: "8px",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};
const inputStyle = {
  backgroundColor: C.paper,
  border: `2px solid ${C.sand}`,
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  color: C.ink,
};
const tipStyle = {
  background: C.surface,
  border: `1px solid ${C.hair}`,
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  padding: "8px 12px",
  fontSize: "12px",
  color: C.muted,
};

// Pseudo-classes / media queries can't be written as inline styles.
const css = `
.ht-grid { border-collapse: separate; border-spacing: 0; width: 100%; }
.ht-label { min-width: 210px; }
.ht-grid th, .ht-grid td { padding: 0; text-align: center; }
.ht-sticky { position: sticky; left: 0; z-index: 2; background: ${C.surface}; text-align: left !important; }
.ht-sticky::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: ${C.hair}; }
.ht-day { min-width: 34px; padding: 6px 0 8px !important; font-weight: 500; color: ${C.muted}; }
.ht-day .ht-wd { font-size: 11px; }
.ht-day .ht-dn { font-size: 13px; color: ${C.ink}; font-weight: 600; }
.ht-today { background: ${C.todayBg}; }
.ht-today .ht-dn { text-decoration: underline; text-underline-offset: 3px; }
.ht-row td, .ht-row th { border-top: 1px solid ${C.hair}; }
.ht-cell { width: 34px; height: 40px; margin: 0 auto; display: flex; align-items: center; justify-content: center;
  background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 8px; }
.ht-box { width: 20px; height: 20px; border-radius: 6px; border: 2px solid ${C.taupe}; background: ${C.surface};
  display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  transition: background .15s ease, border-color .15s ease; }
.ht-cell:hover:not(:disabled) .ht-box { border-color: ${C.ink}; }
.ht-cell[aria-checked="true"] .ht-box { background: ${C.ink}; border-color: ${C.ink}; }
.ht-cell:focus-visible, .ht-btn:focus-visible, .ht-name:focus-visible, .ht-seg button:focus-visible {
  outline: 2px solid ${C.ink}; outline-offset: 2px; }
.ht-cell:disabled { cursor: not-allowed; }
.ht-cell:disabled .ht-box { opacity: .35; background: transparent; }
.ht-cell.ht-pre .ht-box { border-color: ${C.hair}; }
.ht-name { background: none; border: 0; padding: 4px 2px; font: inherit; font-weight: 600; color: ${C.ink};
  cursor: text; text-align: left; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ht-name:hover { text-decoration: underline; text-decoration-color: ${C.taupe}; text-underline-offset: 3px; }
.ht-del { background: none; border: 0; cursor: pointer; font-size: 14px; padding: 6px; border-radius: 6px; opacity: .5; }
.ht-del:hover, .ht-del:focus-visible { opacity: 1; background: ${C.sand}; }
.ht-seg { display: inline-flex; border: 2px solid ${C.sand}; border-radius: 8px; overflow: hidden; }
.ht-seg button { background: ${C.surface}; color: ${C.muted}; border: 0; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; }
.ht-seg button[aria-pressed="true"] { background: ${C.ink}; color: ${C.paper}; }
.ht-scroll { overflow-x: auto; }
@media (max-width: 640px) {
  .ht-label { min-width: 156px; }
  .ht-name { max-width: 86px; }
  .ht-page { padding: 12px !important; }
}
@media (prefers-reduced-motion: reduce) { .ht-box { transition: none; } }
`;

const fmtDay = (key) =>
  fromKey(key).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M2.5 6.2l2.4 2.4 4.6-5"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function HabitName({ habit, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(habit.name);
  const skipBlur = useRef(false);

  const finish = () => {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    const next = value.trim().slice(0, 40);
    setEditing(false);
    if (next && next !== habit.name) onRename(habit.id, next);
    else setValue(habit.name);
  };

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={`Rename ${habit.name}`}
        value={value}
        maxLength={40}
        onChange={(e) => setValue(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            skipBlur.current = true;
            setValue(habit.name);
            setEditing(false);
          }
        }}
        style={{ ...inputStyle, padding: "4px 8px", width: "130px", fontSize: "14px", fontWeight: 600 }}
      />
    );
  }
  return (
    <button
      type="button"
      className="ht-name"
      title="Click to rename"
      onClick={() => {
        setValue(habit.name);
        setEditing(true);
      }}
    >
      {habit.name}
    </button>
  );
}

function Tile({ label, value, hint }) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        backgroundColor: C.sand,
        border: `2px solid ${C.taupe}`,
        borderRadius: "12px",
        padding: "14px 16px",
      }}
    >
      <div style={{ fontSize: "13px", color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: C.ink, lineHeight: 1.2, marginTop: "2px" }}>{value}</div>
      <div style={{ fontSize: "12px", color: C.muted }}>{hint}</div>
    </div>
  );
}

function DonutTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div style={tipStyle}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: C.ink }}>{value}</div>
      <div>{name} check-ins</div>
    </div>
  );
}

function TrendTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  if (row.pct == null) return null;
  return (
    <div style={tipStyle}>
      <div>{fmtDay(row.key)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "2px 0" }}>
        <span style={{ width: "12px", height: "2px", background: C.ink, display: "inline-block" }} />
        <strong style={{ fontSize: "18px", color: C.ink }}>{row.pct}%</strong>
      </div>
      <div>
        {row.done} of {row.tracked} habits done
      </div>
    </div>
  );
}

export default function HabitTracker() {
  const navigate = useNavigate();
  const { habits, log, status, addHabit, renameHabit, removeHabit, toggle } = useHabitData();
  const todayKey = useTodayKey();

  const [ty, tm] = todayKey.split("-").map(Number);
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const isCurrentMonth = view.year === ty && view.month === tm - 1;
  const shiftMonth = (delta) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };
  const goToday = () => setView({ year: ty, month: tm - 1 });
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const [draft, setDraft] = useState({ icon: ICONS[0], name: "" });
  const [formError, setFormError] = useState("");
  const [trendView, setTrendView] = useState("chart");
  const gridRef = useRef(null);

  const stats = useMemo(
    () => computeStats({ habits, log, year: view.year, month: view.month, todayKey }),
    [habits, log, view, todayKey]
  );
  const { days, totals, perHabit, streak, perfectDays } = stats;

  // On narrow screens the grid scrolls sideways: bring today's column into view.
  const hasHabits = habits.length > 0;
  useEffect(() => {
    const box = gridRef.current;
    const col = box && box.querySelector("th.ht-today");
    if (!col || box.scrollWidth <= box.clientWidth) return;
    const shift = col.getBoundingClientRect().left - box.getBoundingClientRect().left - box.clientWidth / 2;
    box.scrollLeft += shift;
  }, [view, hasHabits, todayKey]);

  const submitHabit = (icon, rawName) => {
    const name = rawName.trim().slice(0, 40);
    if (!name) {
      setFormError("Give the habit a name.");
      return false;
    }
    if (habits.length >= MAX_HABITS) {
      setFormError(`You can track up to ${MAX_HABITS} habits.`);
      return false;
    }
    if (habits.some((h) => h.name.toLowerCase() === name.toLowerCase())) {
      setFormError("You already track a habit with that name.");
      return false;
    }
    setFormError("");
    addHabit({ icon, name });
    return true;
  };

  const handleDelete = (habit) => {
    if (window.confirm(`Delete “${habit.name}” and all of its history?`)) removeHabit(habit.id);
  };

  const pie = [
    { name: "Done", value: totals.done, color: C.ink },
    { name: "Not done", value: totals.notDone, color: C.taupe },
    { name: "Upcoming", value: totals.upcoming, color: C.sand },
  ].filter((s) => s.value > 0);

  const trend = days.map((d) => ({ day: d.day, key: d.key, pct: d.pct, done: d.done, tracked: d.tracked }));
  const lastPoint = [...trend].reverse().find((d) => d.pct != null);
  // 1, 5, 10 … plus the last day when it is far enough from the previous label.
  const xTicks = trend.map((d) => d.day).filter((d) => d === 1 || d % 5 === 0);
  const lastDay = trend.length;
  if (lastDay - xTicks[xTicks.length - 1] >= 3) xTicks.push(lastDay);

  const ranked = perHabit.filter((p) => p.pct != null);
  const strongest = ranked.length > 1 ? ranked.reduce((a, b) => (b.pct > a.pct ? b : a)) : null;
  const weakest = ranked.length > 1 ? ranked.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;
  const showTags = strongest && weakest && strongest.pct !== weakest.pct;

  const animate =
    typeof window === "undefined" || !window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className="ht-page"
      style={{
        background: "linear-gradient(135deg, #F2F2F2 0%, #EAE4D5 100%)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <style>{css}</style>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "32px", margin: "0 0 6px 0", color: C.ink, fontWeight: 700 }}>🔥 Daily Habit Tracker</h1>
            <p style={{ color: C.muted, margin: 0, fontSize: "16px", fontWeight: 500 }}>
              Tick off what you did today. Your stats update instantly.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span role="status" aria-live="polite" style={{ fontSize: "13px", color: C.muted, fontWeight: 600 }}>
              {STATUS_TEXT[SYNC_ENABLED ? status : "local"]}
            </span>
            <button type="button" className="ht-btn" onClick={() => navigate("/dashboard")} style={ghostBtn}>
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Filter row: month + add habit */}
        <div style={{ ...cardStyle, display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button type="button" className="ht-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)} style={{ ...ghostBtn, padding: "8px 12px" }}>
              ‹
            </button>
            <div style={{ minWidth: "150px", textAlign: "center", fontSize: "18px", fontWeight: 700, color: C.ink }} aria-live="polite">
              {monthLabel}
            </div>
            <button
              type="button"
              className="ht-btn"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              disabled={isCurrentMonth}
              style={{ ...ghostBtn, padding: "8px 12px", opacity: isCurrentMonth ? 0.4 : 1, cursor: isCurrentMonth ? "not-allowed" : "pointer" }}
            >
              ›
            </button>
            {!isCurrentMonth && (
              <button type="button" className="ht-btn" onClick={goToday} style={{ ...ghostBtn, marginLeft: "4px" }}>
                Today
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (submitHabit(draft.icon, draft.name)) setDraft((d) => ({ ...d, name: "" }));
            }}
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <select
                aria-label="Habit icon"
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                style={{ ...inputStyle, padding: "10px 8px" }}
              >
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <input
                aria-label="New habit name"
                placeholder="New habit, e.g. Revise OS notes"
                value={draft.name}
                maxLength={40}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                style={{ ...inputStyle, width: "260px", maxWidth: "100%" }}
              />
              <button type="submit" className="ht-btn" style={primaryBtn}>
                + Add habit
              </button>
            </div>
            {formError && (
              <div role="alert" style={{ fontSize: "13px", color: "#B42318" }}>
                {formError}
              </div>
            )}
          </form>
        </div>

        {/* My Habits grid */}
        <div style={cardStyle}>
          <h2 style={{ ...h2Style, marginBottom: "12px" }}>✅ My Habits</h2>
          {habits.length === 0 ? (
            <div style={{ backgroundColor: C.sand, borderRadius: "12px", padding: "24px", textAlign: "center" }}>
              <div style={{ fontWeight: 600, color: C.ink, marginBottom: "4px" }}>No habits yet</div>
              <div style={{ color: C.muted, fontSize: "14px", marginBottom: "16px" }}>
                Add your first habit above, or start with one of these:
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s.name} type="button" className="ht-btn" onClick={() => submitHabit(s.icon, s.name)} style={ghostBtn}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ht-scroll" ref={gridRef}>
              <table className="ht-grid">
                <thead>
                  <tr>
                    <th className="ht-sticky ht-label" style={{ padding: "6px 8px 8px 0", color: C.muted, fontSize: "13px", fontWeight: 600 }}>
                      Habit
                    </th>
                    {days.map((d) => (
                      <th key={d.key} className={`ht-day${d.isToday ? " ht-today" : ""}`} aria-label={fmtDay(d.key)}>
                        <div className="ht-wd">{WEEKDAY[d.weekday]}</div>
                        <div className="ht-dn">{d.day}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    return (
                      <tr key={habit.id} className="ht-row">
                        <th scope="row" className="ht-sticky ht-label" style={{ padding: "0 8px 0 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "40px" }}>
                            <span aria-hidden="true" style={{ fontSize: "18px" }}>{habit.icon}</span>
                            <HabitName habit={habit} onRename={renameHabit} />
                            <button
                              type="button"
                              className="ht-del"
                              aria-label={`Delete ${habit.name}`}
                              title="Delete habit"
                              onClick={() => handleDelete(habit)}
                              style={{ marginLeft: "auto" }}
                            >
                              🗑️
                            </button>
                          </div>
                        </th>
                        {days.map((d) => {
                          const checked = (log[d.key] || []).includes(habit.id);
                          const before = !checked && habit.createdAt && d.key < habit.createdAt;
                          return (
                            <td key={d.key} className={d.isToday ? "ht-today" : ""}>
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                aria-label={`${habit.name}, ${fmtDay(d.key)}`}
                                disabled={d.isFuture}
                                className={`ht-cell${before ? " ht-pre" : ""}`}
                                onClick={() => toggle(d.key, habit.id)}
                              >
                                <span className="ht-box">{checked && <CheckIcon />}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts */}
        {habits.length > 0 && (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "stretch" }}>
            {/* Donut */}
            <div style={{ ...cardStyle, flex: "1 1 300px", maxWidth: "420px" }}>
              <h2 style={{ ...h2Style, fontSize: "20px" }}>🍩 {monthLabel}</h2>
              {pie.length === 0 ? (
                <p style={{ color: C.muted, margin: "24px 0 8px" }}>Nothing tracked in this month.</p>
              ) : (
                <>
                  <div style={{ position: "relative", width: "100%", height: "230px", marginTop: "8px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pie}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="68%"
                          outerRadius="94%"
                          startAngle={90}
                          endAngle={-270}
                          stroke={C.surface}
                          strokeWidth={2}
                          isAnimationActive={animate}
                          animationDuration={500}
                        >
                          {pie.map((s) => (
                            <Cell key={s.name} fill={s.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{ fontSize: "52px", fontWeight: 700, color: C.ink, lineHeight: 1 }}>
                        {totals.pct == null ? "—" : `${totals.pct}%`}
                      </div>
                      <div style={{ fontSize: "13px", color: C.muted, marginTop: "6px" }}>done so far</div>
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", margin: "8px 0 0", padding: 0, fontSize: "13px", color: C.muted }}>
                    {[
                      { name: "Done", value: totals.done, color: C.ink },
                      { name: "Not done", value: totals.notDone, color: C.taupe },
                      { name: "Upcoming", value: totals.upcoming, color: C.sand },
                    ].map((s) => (
                      <li key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span aria-hidden="true" style={{ width: "10px", height: "10px", borderRadius: "3px", background: s.color, display: "inline-block", border: s.color === C.sand ? `1px solid ${C.taupe}` : "none" }} />
                        {s.name} <strong style={{ color: C.ink }}>{s.value}</strong>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Trend */}
            <div style={{ ...cardStyle, flex: "3 1 480px", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h2 style={{ ...h2Style, fontSize: "20px" }}>📈 Daily completion</h2>
                <div className="ht-seg" role="group" aria-label="Chart or table view">
                  <button type="button" aria-pressed={trendView === "chart"} onClick={() => setTrendView("chart")}>
                    Chart
                  </button>
                  <button type="button" aria-pressed={trendView === "table"} onClick={() => setTrendView("table")}>
                    Table
                  </button>
                </div>
              </div>
              <p style={{ color: C.muted, fontSize: "13px", margin: "4px 0 8px" }}>Share of your habits ticked off each day</p>

              {trendView === "chart" ? (
                <div style={{ width: "100%", height: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 12, right: 40, bottom: 0, left: 0 }}>
                      <CartesianGrid vertical={false} stroke={C.hair} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={{ stroke: C.hair }}
                        tick={{ fill: C.muted, fontSize: 12 }}
                        ticks={xTicks}
                        interval={0}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tick={{ fill: C.muted, fontSize: 12 }}
                      />
                      <Tooltip content={<TrendTip />} cursor={{ stroke: C.taupe, strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="pct"
                        stroke={C.ink}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={C.ink}
                        fillOpacity={0.08}
                        dot={false}
                        activeDot={{ r: 5, fill: C.ink, stroke: C.surface, strokeWidth: 2 }}
                        connectNulls={false}
                        isAnimationActive={animate}
                        animationDuration={500}
                      />
                      {lastPoint && (
                        <ReferenceDot
                          x={lastPoint.day}
                          y={lastPoint.pct}
                          r={5}
                          fill={C.ink}
                          stroke={C.surface}
                          strokeWidth={2}
                          ifOverflow="visible"
                          label={{ value: `${lastPoint.pct}%`, position: "right", offset: 10, fill: C.ink, fontSize: 12, fontWeight: 600 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ maxHeight: "260px", overflow: "auto", border: `1px solid ${C.hair}`, borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: C.sand, position: "sticky", top: 0 }}>
                        {["Date", "Done", "Tracked", "Completion"].map((h) => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: h === "Date" ? "left" : "right", color: C.ink }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trend
                        .filter((d) => d.pct != null)
                        .map((d) => (
                          <tr key={d.key} style={{ borderTop: `1px solid ${C.hair}` }}>
                            <td style={{ padding: "6px 12px" }}>{fmtDay(d.key)}</td>
                            <td style={{ padding: "6px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.done}</td>
                            <td style={{ padding: "6px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.tracked}</td>
                            <td style={{ padding: "6px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{d.pct}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!trend.some((d) => d.pct != null) && (
                    <p style={{ color: C.muted, padding: "12px" }}>No days tracked yet in this month.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats + breakdown */}
        {habits.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ ...h2Style, marginBottom: "16px" }}>🧑‍🎓 Your Stats</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
              <Tile label="Perfect days" value={perfectDays} hint="every habit done" />
              <Tile label="Current streak" value={streak.current} hint={streak.current === 1 ? "day in a row" : "days in a row"} />
              <Tile label="Best streak" value={streak.best} hint="longest run, any month" />
              <Tile label="Check-ins" value={totals.done} hint={`of ${totals.elapsed} so far this month`} />
            </div>

            <h3 style={{ fontSize: "16px", margin: "0 0 10px", color: C.ink, fontWeight: 600 }}>By habit</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
              {perHabit.map((p) => (
                <div key={p.id} style={{ backgroundColor: C.sand, border: `1px solid ${C.taupe}`, borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span aria-hidden="true" style={{ fontSize: "18px" }}>{p.icon}</span>
                    <strong style={{ color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</strong>
                    {showTags && p.id === strongest.id && (
                      <span style={{ fontSize: "11px", fontWeight: 700, background: C.ink, color: C.paper, borderRadius: "999px", padding: "2px 8px" }}>Strongest</span>
                    )}
                    {showTags && p.id === weakest.id && (
                      <span style={{ fontSize: "11px", fontWeight: 700, background: C.surface, color: C.ink, border: `1px solid ${C.taupe}`, borderRadius: "999px", padding: "2px 8px" }}>Needs attention</span>
                    )}
                    <span style={{ marginLeft: "auto", fontWeight: 700, color: C.ink }}>{p.pct == null ? "—" : `${p.pct}%`}</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${p.name} completion this month`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={p.pct == null ? 0 : p.pct}
                    style={{ height: "8px", background: C.surface, borderRadius: "999px", overflow: "hidden" }}
                  >
                    <div style={{ width: `${p.pct || 0}%`, height: "100%", background: C.ink, borderRadius: "999px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.muted, marginTop: "8px" }}>
                    <span>{p.done} of {p.possible} days</span>
                    <span>🔥 {p.currentStreak} now · best {p.bestStreak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
