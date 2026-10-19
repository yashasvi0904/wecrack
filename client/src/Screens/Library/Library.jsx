import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Download, Eye, FlaskConical, FileText } from "lucide-react";
import AppShell from "../../components/AppShell";
import PdfModal from "../../components/PdfModal";
import { PAPERS, paperUrl, BRANCHES, syllabusUrl } from "../../data/papers";

export default function Library() {
  const navigate = useNavigate();
  const [branchCode, setBranchCode] = useState("CS");
  const [viewer, setViewer] = useState({ open: false, src: "", title: "" });

  const branch = BRANCHES.find((b) => b.code === branchCode) || BRANCHES[0];
  const open = (src, title) => setViewer({ open: true, src, title });
  const close = () => setViewer((v) => ({ ...v, open: false }));

  return (
    <AppShell active="library">
      <div style={{ marginBottom: "26px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 500, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Library
        </h1>
        <p style={{ color: "var(--label-2)", margin: "8px 0 0", fontSize: "18px" }}>
          The GATE syllabus and previous-year papers, ready to read or download.
        </p>
      </div>

      <section className="ux-two" style={{ marginBottom: 0 }}>
        {/* Syllabus */}
        <div className="ux-card" id="syllabus">
          <h2 className="ux-title">syllabus</h2>
          <p className="ux-sub">Official GATE 2025 syllabus for your branch.</p>
          <label htmlFor="branch-select" className="ux-cap muted" style={{ display: "block", marginBottom: "8px" }}>
            Branch
          </label>
          <select
            id="branch-select"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            style={{ width: "100%", marginBottom: "16px" }}
          >
            {BRANCHES.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} - {b.name}
              </option>
            ))}
          </select>
          <div className="ux-actions">
            <button
              type="button"
              className="ux-btn"
              onClick={() => open(syllabusUrl(branch.code), `${branch.code} syllabus`)}
            >
              <BookOpen size={18} /> View syllabus
            </button>
            <a className="ux-btn ghost" href={syllabusUrl(branch.code)} download>
              <Download size={18} /> Download
            </a>
          </div>

          <div className="ux-nav-sep" style={{ margin: "26px 0 20px" }} />

          <h3 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 6px" }}>Practise under exam conditions</h3>
          <p className="ux-sub" style={{ margin: "0 0 14px" }}>
            Pick a paper, set a timer and take it as a timed mock test.
          </p>
          <button type="button" className="ux-btn ghost" onClick={() => navigate("/mock-test")}>
            <FlaskConical size={18} /> Take a mock test
          </button>
        </div>

        {/* Previous papers */}
        <div className="ux-card" id="papers">
          <h2 className="ux-title">previous papers</h2>
          <p className="ux-sub">Question papers from 2019 to 2023.</p>
          {PAPERS.map((paper) => (
            <div key={paper.id} className="ux-row">
              <div className="ux-row-main">
                <span className="ux-paper-icon" style={{ width: 40, height: 40 }}>
                  <FileText size={20} strokeWidth={1.7} />
                </span>
                <span className="ux-row-title">{paper.label}</span>
              </div>
              <div className="ux-actions" style={{ flexWrap: "nowrap" }}>
                <button type="button" className="ux-btn ghost sm" onClick={() => open(paperUrl(paper), paper.label)}>
                  <Eye size={15} /> View
                </button>
                <a href={paperUrl(paper)} download className="ux-btn ghost sm">
                  <Download size={15} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PdfModal open={viewer.open} src={viewer.src} title={viewer.title} onClose={close} />
    </AppShell>
  );
}
