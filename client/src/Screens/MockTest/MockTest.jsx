import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, ArrowRight, ArrowLeft, Pause, Play, Square, Check } from "lucide-react";
import AppShell from "../../components/AppShell";
import { Logo } from "../../components/ui";
import { PAPERS, paperUrl } from "../../data/papers";

const STORAGE_KEY = "wecrack.mocktest.v1";
const PRESETS = [30, 60, 90, 120, 180]; // minutes; a real GATE paper is 3 hours
const DEFAULT_MINUTES = 180;
const MAX_MINUTES = 300;

const pad = (n) => String(n).padStart(2, "0");
const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const fmtUsed = (ms) => {
  const s = Math.round(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
};

const readSaved = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (raw && PAPERS.some((p) => p.id === raw.paperId) && Number.isFinite(raw.totalMs)) return raw;
  } catch {
    /* ignore corrupt or blocked storage */
  }
  return null;
};
const writeSaved = (session) => {
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* in-memory state still works */
  }
};

const STEPS = ["Choose paper", "Set timer", "Take test"];

function Stepper({ current }) {
  return (
    <div className="ux-stepper" aria-label="Progress">
      {STEPS.map((label, i) => (
        <span key={label} style={{ display: "contents" }}>
          <span className={`ux-step-item${i === current ? " active" : ""}${i < current ? " done" : ""}`}>
            <span className="ux-step-dot">{i < current ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="ux-step-line" />}
        </span>
      ))}
    </div>
  );
}

export default function MockTest() {
  const navigate = useNavigate();

  // A test that is still running when the page reloads is resumed, not lost.
  const saved = useRef(readSaved()).current;
  const initialPaused = !!saved?.paused;
  const resumedExpired = !!saved && !initialPaused && saved.endAt <= Date.now();

  const [step, setStep] = useState(() => (saved ? (resumedExpired ? "done" : "test") : "paper"));
  const [paperId, setPaperId] = useState(saved ? saved.paperId : "");
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [customMinutes, setCustomMinutes] = useState("");
  const [timerError, setTimerError] = useState("");

  const [totalMs, setTotalMs] = useState(saved ? saved.totalMs : 0);
  const [endAt, setEndAt] = useState(saved && !initialPaused ? saved.endAt : 0);
  const [paused, setPaused] = useState(initialPaused);
  const [remaining, setRemaining] = useState(() => {
    if (!saved) return 0;
    if (initialPaused) return saved.remainingMs;
    return Math.max(0, saved.endAt - Date.now());
  });
  const [result, setResult] = useState(
    resumedExpired ? { usedMs: saved.totalMs, reason: "timeup" } : null
  );

  const [score, setScore] = useState("");
  const [saveState, setSaveState] = useState({ status: "idle", text: "" });

  const paper = PAPERS.find((p) => p.id === paperId);

  // Expired-on-return: nothing is left to resume
  useEffect(() => {
    if (resumedExpired) writeSaved(null);
  }, [resumedExpired]);

  const finish = useCallback(
    (reason, leftMs) => {
      writeSaved(null);
      setResult({ usedMs: Math.max(0, totalMs - Math.max(0, leftMs)), reason });
      setStep("done");
    },
    [totalMs]
  );

  // Countdown: derived from a fixed end time, so it stays accurate in background tabs
  useEffect(() => {
    if (step !== "test" || paused) return undefined;
    const tick = () => {
      const left = endAt - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) finish("timeup", 0);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [step, paused, endAt, finish]);

  // Warn before closing the tab mid-test
  useEffect(() => {
    if (step !== "test") return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [step]);

  const chosenMinutes = customMinutes !== "" ? Number(customMinutes) : minutes;

  const startTest = () => {
    if (!Number.isFinite(chosenMinutes) || chosenMinutes < 1 || chosenMinutes > MAX_MINUTES) {
      setTimerError(`Enter a time between 1 and ${MAX_MINUTES} minutes.`);
      return;
    }
    const total = Math.round(chosenMinutes * 60 * 1000);
    const end = Date.now() + total;
    setTotalMs(total);
    setEndAt(end);
    setRemaining(total);
    setPaused(false);
    setResult(null);
    setTimerError("");
    writeSaved({ paperId, totalMs: total, endAt: end, paused: false, remainingMs: total });
    setStep("test");
  };

  const pause = () => {
    const left = Math.max(0, endAt - Date.now());
    setRemaining(left);
    setPaused(true);
    writeSaved({ paperId, totalMs, endAt: 0, paused: true, remainingMs: left });
  };
  const resume = () => {
    const end = Date.now() + remaining;
    setEndAt(end);
    setPaused(false);
    writeSaved({ paperId, totalMs, endAt: end, paused: false, remainingMs: remaining });
  };
  const endTest = () => {
    if (window.confirm("End the test now? Your time so far will be recorded.")) {
      finish("ended", paused ? remaining : endAt - Date.now());
    }
  };

  const reset = () => {
    writeSaved(null);
    setStep("paper");
    setPaperId("");
    setCustomMinutes("");
    setMinutes(DEFAULT_MINUTES);
    setResult(null);
    setScore("");
    setSaveState({ status: "idle", text: "" });
  };

  const saveScore = async () => {
    const value = Number(score);
    if (score.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100) {
      setSaveState({ status: "error", text: "Enter a score between 0 and 100." });
      return;
    }
    setSaveState({ status: "saving", text: "" });
    try {
      await axios.post(process.env.REACT_APP_SEND_SCORE, { marks: value }, { withCredentials: true });
      setSaveState({ status: "saved", text: "Score saved to your dashboard." });
    } catch (err) {
      console.error("Saving score failed:", err);
      setSaveState({
        status: "error",
        text:
          err.response?.status === 401
            ? "Please log in to save your score."
            : "Couldn't save the score. Please try again.",
      });
    }
  };

  /* ------------------------------ Step 3: the test ------------------------------ */
  if (step === "test" && paper) {
    const tone = remaining <= 60 * 1000 ? "danger" : remaining <= 10 * 60 * 1000 ? "warn" : "";
    return (
      <div className="apple-ui">
        <div className="ux-test">
          <div className="ux-test-bar">
            <div className="ux-test-title">
              <Logo size={28} />
              <div>
                <strong>{paper.label}</strong>
                <small>Mock test{paused ? " · paused" : ""}</small>
              </div>
            </div>
            <div className={`ux-timer ${tone}`} role="timer" aria-label="Time remaining">
              {fmt(remaining)}
            </div>
            <div className="ux-actions">
              <button type="button" className="ux-btn ghost sm" onClick={paused ? resume : pause}>
                {paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button type="button" className="ux-btn danger sm" onClick={endTest}>
                <Square size={15} fill="currentColor" /> End test
              </button>
            </div>
          </div>

          <div className="ux-test-frame">
            {paused ? (
              <div className="ux-paused">The paper is hidden while the timer is paused. Press Resume to continue.</div>
            ) : (
              <>
                <iframe src={paperUrl(paper)} title={`${paper.label} question paper`} />
                <div className="ux-frame-note">
                  PDF not showing?{" "}
                  <a href={paperUrl(paper)} target="_blank" rel="noreferrer">
                    Open it in a new tab
                  </a>{" "}
                  (the timer keeps running).
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Result screen ------------------------------ */
  if (step === "done" && result) {
    const timeUp = result.reason === "timeup";
    return (
      <AppShell active="mock">
        <div className="ux-result">
          <div className="ux-card" style={{ padding: "36px 28px" }}>
            <div className="ux-cap muted" style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>
              {timeUp ? "Time's up" : "Test ended"}
            </div>
            <h1 style={{ fontSize: "34px", fontWeight: 500, margin: "6px 0 4px" }}>
              {paper ? paper.label : "Mock test"}
            </h1>
            <p style={{ color: "var(--label-2)", margin: "0 0 22px" }}>
              You used <strong style={{ color: "var(--label)" }}>{fmtUsed(result.usedMs)}</strong>
              {totalMs ? ` of ${fmtUsed(totalMs)}` : ""}.
            </p>

            <h2 className="ux-title" style={{ justifyContent: "center", fontSize: "22px" }}>
              save your score
            </h2>
            <p className="ux-sub" style={{ margin: "-6px 0 14px" }}>
              Check your answers against the key, then enter your score out of 100.
            </p>
            <div className="ux-form-row" style={{ maxWidth: 360, margin: "0 auto" }}>
              <input
                type="number"
                min="0"
                max="100"
                aria-label="Score out of 100"
                placeholder="Score (0-100)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveScore()}
              />
              <button
                type="button"
                className="ux-btn"
                style={{ flex: "0 0 auto" }}
                onClick={saveScore}
                disabled={saveState.status === "saving" || saveState.status === "saved"}
              >
                {saveState.status === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
            {saveState.text && (
              <div
                role="alert"
                className={`ux-alert ${saveState.status === "saved" ? "success" : "error"}`}
                style={{ maxWidth: 360, margin: "14px auto 0" }}
              >
                {saveState.text}
              </div>
            )}

            <div className="ux-actions" style={{ justifyContent: "center", marginTop: "26px" }}>
              <button type="button" className="ux-btn ghost" onClick={reset}>
                Take another test
              </button>
              <button type="button" className="ux-btn" onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ------------------------------ Steps 1 and 2 ------------------------------ */
  return (
    <AppShell active="mock">
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 500, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Mock test
        </h1>
        <p style={{ color: "var(--label-2)", margin: "8px 0 0", fontSize: "18px" }}>
          Pick a previous-year paper, set your time and start the clock.
        </p>
      </div>

      <Stepper current={step === "paper" ? 0 : 1} />

      {step === "paper" && (
        <>
          <h2 className="ux-title">choose a paper</h2>
          <div className="ux-paper-grid" role="radiogroup" aria-label="Previous-year papers">
            {PAPERS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={paperId === p.id}
                className="ux-paper"
                onClick={() => setPaperId(p.id)}
              >
                <span className="ux-paper-icon">
                  <FileText size={22} strokeWidth={1.7} />
                </span>
                <span>
                  {p.label}
                  <small>Previous-year paper</small>
                </span>
              </button>
            ))}
          </div>
          <div className="ux-actions">
            <button type="button" className="ux-btn ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={18} /> Dashboard
            </button>
            <button type="button" className="ux-btn" disabled={!paper} onClick={() => setStep("timer")}>
              Next: set timer <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      {step === "timer" && paper && (
        <>
          <h2 className="ux-title">set the timer</h2>
          <p className="ux-sub">
            Paper: <strong style={{ color: "var(--label)" }}>{paper.label}</strong>. A real GATE paper is 3 hours.
          </p>

          <div className="ux-timer-big">{fmt(chosenMinutes * 60 * 1000 || 0)}</div>
          <div className="ux-cap muted" style={{ marginBottom: "14px" }}>
            {Number.isFinite(chosenMinutes) && chosenMinutes > 0 ? `${chosenMinutes} minutes` : "Enter a valid time"}
          </div>

          <div className="ux-presets" role="group" aria-label="Duration presets">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                className="ux-preset"
                aria-pressed={customMinutes === "" && minutes === m}
                onClick={() => {
                  setMinutes(m);
                  setCustomMinutes("");
                  setTimerError("");
                }}
              >
                {m === 180 ? "3 hours" : m === 60 ? "1 hour" : m === 120 ? "2 hours" : `${m} min`}
              </button>
            ))}
          </div>

          <div className="ux-custom-time">
            <label htmlFor="custom-minutes">Or custom:</label>
            <input
              id="custom-minutes"
              type="number"
              min="1"
              max={MAX_MINUTES}
              placeholder="minutes"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
                setTimerError("");
              }}
            />
            <span>minutes</span>
          </div>
          {timerError && (
            <div role="alert" className="ux-alert error" style={{ maxWidth: 420, textAlign: "left", marginBottom: "12px" }}>
              {timerError}
            </div>
          )}

          <div className="ux-actions" style={{ marginTop: "18px" }}>
            <button type="button" className="ux-btn ghost" onClick={() => setStep("paper")}>
              <ArrowLeft size={18} /> Back
            </button>
            <button type="button" className="ux-btn" onClick={startTest}>
              Start test <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
