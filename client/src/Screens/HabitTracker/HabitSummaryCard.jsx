import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useHabitData, { useTodayKey } from "./useHabitData";
import { computeStats } from "./habitStats";

// Compact card for the main dashboard: today's checklist + month % + streak,
// with a link to the full tracker at /habits.
export default function HabitSummaryCard() {
  const navigate = useNavigate();
  const { habits, log, toggle } = useHabitData();
  const todayKey = useTodayKey();
  const [y, m] = todayKey.split("-").map(Number);

  const stats = useMemo(
    () => computeStats({ habits, log, year: y, month: m - 1, todayKey }),
    [habits, log, y, m, todayKey]
  );
  const today = stats.days.find((d) => d.isToday);
  const doneToday = (log[todayKey] || []).filter((id) => habits.some((h) => h.id === id)).length;
  const shown = habits.slice(0, 6);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "16px",
      }}
    >
      <h3 style={{ fontSize: "20px", margin: "0 0 16px 0", color: "#000000", fontWeight: "600" }}>
        🔥 Daily Habits
      </h3>

      {habits.length === 0 ? (
        <div
          style={{
            color: "#6B675C",
            fontStyle: "italic",
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#EAE4D5",
            borderRadius: "12px",
            marginBottom: "12px",
          }}
        >
          Track your everyday activity and see your streaks.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {[
              { label: "Today", value: `${doneToday}/${habits.length}` },
              { label: "This month", value: stats.totals.pct == null ? "—" : `${stats.totals.pct}%` },
              { label: "Streak", value: `${stats.streak.current}d` },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  padding: "10px 4px",
                  backgroundColor: "#EAE4D5",
                  borderRadius: "12px",
                  border: "2px solid #B6B09F",
                }}
              >
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#000000" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#6B675C", fontWeight: "600" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
            {shown.map((h) => {
              const checked = (log[todayKey] || []).includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(todayKey, h.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `2px solid ${checked ? "#B6B09F" : "#EAE4D5"}`,
                    backgroundColor: checked ? "#EAE4D5" : "#F2F2F2",
                    cursor: "pointer",
                    textAlign: "left",
                    font: "inherit",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "5px",
                      border: `2px solid ${checked ? "#000" : "#B6B09F"}`,
                      background: checked ? "#000" : "#fff",
                      color: "#fff",
                      fontSize: "11px",
                      lineHeight: "14px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span style={{ fontWeight: 500, color: "#000", textDecoration: checked ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.icon} {h.name}
                  </span>
                </button>
              );
            })}
            {habits.length > shown.length && (
              <div style={{ fontSize: "12px", color: "#6B675C", textAlign: "center" }}>
                +{habits.length - shown.length} more in the full tracker
              </div>
            )}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate("/habits")}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          width: "100%",
        }}
      >
        {habits.length === 0 ? "Start tracking" : "Open Habit Tracker"}
        {today && habits.length > 0 && today.pct != null ? ` · ${today.pct}% today` : ""}
      </button>
    </div>
  );
}
