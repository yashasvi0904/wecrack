import { useEffect } from "react";

// Frosted-glass sheet that shows a PDF (syllabus or previous paper). Esc or a click outside closes it.
export default function PdfModal({ open, src, title, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="apple-glass"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-solid)",
          borderRadius: "20px",
          boxShadow: "var(--shadow-float)",
          width: "min(960px, 100%)",
          height: "min(88vh, 900px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 14px 20px",
            borderBottom: "0.5px solid var(--separator)",
          }}
        >
          <strong style={{ fontSize: "17px", color: "var(--label)" }}>{title}</strong>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "999px",
              border: "none",
              background: "var(--fill-2)",
              color: "var(--label-2)",
              cursor: "pointer",
              fontSize: "15px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <iframe
          src={src}
          title={title}
          style={{ border: "none", flex: 1, width: "100%", background: "#fff" }}
        />
      </div>
    </div>
  );
}
