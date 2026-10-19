import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ChartColumn,
  Library,
  Flame,
  NotebookPen,
  Timer,
  ListChecks,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Logo } from "../../components/ui";

// Everything below describes what WeCrack actually does today.
const features = [
  {
    icon: ListChecks,
    title: "Smart planner",
    text: "Break your prep into subject-wise tasks for DSA, OS, CN, DBMS, COA and Math. Tick them off as you go.",
  },
  {
    icon: ChartColumn,
    title: "Score analytics",
    text: "Log mock-test scores and see your trend, average and best score, with syllabus coverage in one view.",
  },
  {
    icon: Library,
    title: "Syllabus and papers",
    text: "GATE 2025 syllabus PDFs, previous-year papers from 2019 to 2023 and five mock tests, opened right in the app.",
  },
  {
    icon: CalendarCheck,
    title: "Habit tracker",
    text: "A monthly grid with streaks, a completion donut and a daily trend, so consistency becomes visible.",
  },
  {
    icon: NotebookPen,
    title: "Notes and topics",
    text: "Pin quick notes and keep a running list of the topics you have finished.",
  },
  {
    icon: Timer,
    title: "Focus tools",
    text: "A timer, a stopwatch and a study music player, always one click away on your dashboard.",
  },
];

const steps = [
  { title: "Create your account", text: "Sign up with your email or Google in a few seconds. It's free." },
  { title: "Plan and practise", text: "Add tasks, open papers and take mock tests from one dashboard." },
  { title: "Track your progress", text: "Log scores and habits, then watch your streak and consistency grow." },
];

export default function GateTrackerLanding() {
  const navigate = useNavigate();

  return (
    <div className="apple-ui">
      <div className="ux-land">
        {/* Navigation */}
        <header className="ux-land-nav">
          <div className="ux-brand">
            <Logo size={30} />
            WeCrack
          </div>
          <nav className="ux-land-links" aria-label="Sections">
            <a href="#features">Features</a>
            <a href="#preview">Preview</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="ux-land-cta">
            <button type="button" className="ux-btn ghost sm" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button type="button" className="ux-btn sm" onClick={() => navigate("/register")}>
              Get started
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="ux-hero">
          <div className="ux-pill">
            <Sparkles size={16} /> Built for GATE aspirants
          </div>
          <h1>
            Plan it. Track it. <span className="ux-grad">Crack GATE.</span>
          </h1>
          <p>
            One calm dashboard for your study plan, mock-test scores, syllabus, previous papers and daily habits, so you
            always know where you stand.
          </p>
          <div className="ux-hero-actions">
            <button type="button" className="ux-btn" onClick={() => navigate("/register")}>
              Get started free <ArrowRight size={19} />
            </button>
            <button type="button" className="ux-btn ghost" onClick={() => navigate("/login")}>
              Log in
            </button>
          </div>
        </section>

        {/* Product preview */}
        <section id="preview" className="ux-shot" style={{ scrollMarginTop: "90px" }}>
          <img
            src="/screenshots/dashboard.png"
            width="2400"
            height="1950"
            alt="The WeCrack dashboard with syllabus, mock score and streak rings, today's habits, planner and scores chart"
          />
        </section>

        {/* Features */}
        <section id="features" className="ux-land-section" style={{ scrollMarginTop: "90px" }}>
          <div className="ux-land-head">
            <h2>
              Everything for your prep, <span className="ux-grad">in one place</span>
            </h2>
            <p>No more switching between notes, PDFs and spreadsheets.</p>
          </div>
          <div className="ux-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="ux-card ux-feature">
                <div className="ux-feature-icon">
                  <Icon size={26} strokeWidth={1.7} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="ux-land-section" style={{ scrollMarginTop: "90px" }}>
          <div className="ux-land-head">
            <h2>How it works</h2>
            <p>Three steps from sign-up to a steady routine.</p>
          </div>
          <div className="ux-steps">
            {steps.map(({ title, text }) => (
              <div key={title} className="ux-card ux-step">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="ux-final">
          <h2>
            Ready to start your <span className="ux-grad">streak?</span>
          </h2>
          <p>Create a free account and set up your first study plan in under a minute.</p>
          <button type="button" className="ux-btn" style={{ padding: "15px 32px", fontSize: "17px" }} onClick={() => navigate("/register")}>
            <Flame size={19} /> Start tracking
          </button>
        </section>

        <footer className="ux-land-foot">
          <div className="ux-brand" style={{ padding: 0, fontSize: "20px" }}>
            <Logo size={24} />
            WeCrack
          </div>
          <span>
            Built by{" "}
            <a href="https://github.com/yashasvi0904" target="_blank" rel="noreferrer">
              Yashasvi
            </a>{" "}
            ·{" "}
            <a href="https://github.com/yashasvi0904/wecrack" target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
