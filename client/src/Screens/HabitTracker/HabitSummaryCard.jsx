import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import useHabitData, { useTodayKey } from "./useHabitData";
import { computeStats } from "./habitStats";

// Dashboard card: today's habit checklist with month % and streak.
// Styled with the shared ux-* classes from styles/ultra.css.
export default function HabitSummaryCard() {
  const navigate = useNavigate();
  const { habits, log, toggle } = useHabitData();
  const todayKey = useTodayKey();
  const [y, m] = todayKey.split("-").map(Number);

  const stats = useMemo(
    () => computeStats({ habits, log, year: y, month: m - 1, todayKey }),
    [habits, log, y, m, todayKey]
  );
  const doneIds = log[todayKey] || [];
  const doneToday = doneIds.filter((id) => habits.some((h) => h.id === id)).length;
  const shown = habits.slice(0, 5);

  return (
    <div className="ux-card ux-stat" style={{ alignItems: "stretch", textAlign: "left", gap: 0, padding: "22px 20px" }}>
      <div className="ux-stat-head" style={{ marginBottom: 6 }}>
        <span className="ux-cap">Today's habits</span>
        <span className="ux-chip accent">
          {doneToday}/{habits.length}
        </span>
      </div>

      {habits.length === 0 ? (
        <div className="ux-empty" style={{ marginTop: 12 }}>
          Track your everyday activity and see your streaks.
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {shown.map((h) => {
            const checked = doneIds.includes(h.id);
            return (
              <div key={h.id} className={`ux-row${checked ? " done" : ""}`} style={{ padding: "10px 2px" }}>
                <div className="ux-row-main">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={h.name}
                    className={`ux-check${checked ? " on" : ""}`}
                    onClick={() => toggle(todayKey, h.id)}
                  >
                    {checked && <Check size={14} strokeWidth={3} />}
                  </button>
                  <span className="ux-row-title">
                    {h.icon} {h.name}
                  </span>
                </div>
              </div>
            );
          })}
          {habits.length > shown.length && (
            <div className="ux-cap muted" style={{ paddingTop: 8 }}>
              +{habits.length - shown.length} more in the tracker
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 2px 12px", color: "var(--label-2)", fontSize: 14 }}>
        <span>This month {stats.totals.pct == null ? "—" : `${stats.totals.pct}%`}</span>
        <span>Streak {stats.streak.current}d</span>
      </div>
      <button type="button" className="ux-btn ghost block" onClick={() => navigate("/habits")}>
        {habits.length === 0 ? "Start tracking" : "Open tracker"}
      </button>
    </div>
  );
}
