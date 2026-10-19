// Previous-year GATE papers shipped in public/Gate_PYQs.
// Shared by the dashboard (view / download) and the mock-test page.
export const PAPERS = [
  { id: "2023", label: "GATE 2023", file: "gate 2023.pdf" },
  { id: "2022", label: "GATE 2022", file: "gate 2022.pdf" },
  { id: "2021-set-1", label: "GATE 2021 Set 1", file: "gate 2021 set 1.pdf" },
  { id: "2021-set-2", label: "GATE 2021 Set 2", file: "gate 2021 set 2.pdf" },
  { id: "2020-cse", label: "GATE 2020 (CSE)", file: "gate 2020 cse.pdf" },
  { id: "2019-cse", label: "GATE 2019 (CSE)", file: "gate 2019 cse.pdf" },
];

export const paperUrl = (paper) => `/Gate_PYQs/${encodeURIComponent(paper.file)}`;

// Branches that have a 2025 syllabus PDF in public/Gate_Syallbus.
export const BRANCHES = [
  { code: "AE", name: "Aerospace Engineering" },
  { code: "AG", name: "Agricultural Engineering" },
  { code: "BM", name: "Biomedical Engineering" },
  { code: "BT", name: "Biotechnology" },
  { code: "CE", name: "Civil Engineering" },
  { code: "CH", name: "Chemical Engineering" },
  { code: "CS", name: "Computer Science & Information Technology" },
  { code: "GG", name: "Geology & Geophysics" },
  { code: "IN", name: "Instrumentation Engineering" },
  { code: "MA", name: "Mathematics" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "MN", name: "Mining Engineering" },
  { code: "MT", name: "Metallurgical Engineering" },
  { code: "NM", name: "Naval Architecture & Marine Engineering" },
];

export const syllabusUrl = (code) => `/Gate_Syallbus/GATE_${code}_2025_Syllabus.pdf`;
