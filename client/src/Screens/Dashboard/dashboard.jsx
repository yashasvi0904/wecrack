import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  BookOpen,
  TrendingUp,
  Flame,
  FlaskConical,
  Sparkles,
  Check,
  Minus,
  Play,
  Pause,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import HabitSummaryCard from "../HabitTracker/HabitSummaryCard";
import AppShell from "../../components/AppShell";
import { Ring } from "../../components/ui";

// Light tooltip bubble for the scores chart
const ScoreTip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const { test, score } = payload[0].payload;
  return (
    <div
      style={{
        background: "#f6f2ef",
        color: "#1b1716",
        borderRadius: "14px",
        padding: "8px 14px",
        fontWeight: 600,
        fontSize: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      Test {test}: {score}%
    </div>
  );
};

// Frosted-glass sheet that shows a PDF (syllabus, mock test or previous paper).
const PdfModal = ({ open, src, title, onClose }) => {
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
};

const GateDashboard = () => {
  const [analytics, setAnalytics] = useState({
    subjectsCompleted: 0,
    accuracy: 0,
    bestStreak: 0,
    currentStreak: 0,
    consistency: 0,
  });
  const quoteList = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "It always seems impossible until it’s done. – Nelson Mandela",
    "Hardships often prepare ordinary people for an extraordinary destiny. – C.S. Lewis",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
  ];

  const [pyqPDF, setPyqPDF] = useState("");
  const [showPYQModal, setShowPYQModal] = useState(false);

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [user1, setUser] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    subject: "DSA",
    title: "",
    time: "",
  });
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusPDF, setSyllabusPDF] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [mockTestPDF, setMockTestPDF] = useState("");
  const [showMockTestModal, setShowMockTestModal] = useState(false);
  const [mockTestMarks, setMockTestMarks] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(
    quoteList[Math.floor(Math.random() * quoteList.length)]
  );

  const fetchMotivationalQuote = () => {
    const randomIndex = Math.floor(Math.random() * quoteList.length);
    setCurrentQuote(quoteList[randomIndex]);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_GET_ANALYTICS, {
        withCredentials: true,
      });
      setAnalytics((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchInterval = useRef(null);

  // Timer state
  const [timerInput, setTimerInput] = useState("");
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerInterval = useRef(null);

  const [topicList, setTopicList] = useState([]);
  const [newTopic, setNewTopic] = useState("");

  const subjects = ["DSA", "OS", "CN", "DBMS", "COA", "Math"];

  const branches = [
    "AE - Aerospace Engineering",
    "AG - Agricultural Engineering",
    "AR - Architecture and Planning",
    "BM - Biomedical Engineering",
    "BT - Biotechnology",
    "CE - Civil Engineering",
    "CH - Chemical Engineering",
    "CS - Computer Science & Information Technology",
    "GG - Geology & Geophysics",
    "IN - Instrumentation Engineering",
    "MA - Mathematics",
    "ME - Mechanical Engineering",
    "MN - Mining Engineering",
    "MT - Metallurgical Engineering",
    "NM - Naval Architecture & Marine Engineering",
  ];

  const syllabusTopics = {
    DSA: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
    OS: [
      "Process Management",
      "Memory Management",
      "File Systems",
      "Synchronization",
    ],
    CN: ["OSI Model", "TCP/IP", "Routing", "Network Security"],
    DBMS: ["ER Model", "Normalization", "SQL", "Transactions"],
    COA: ["CPU Organization", "Memory Organization", "I/O Organization"],
    Math: ["Probability", "Statistics", "Linear Algebra", "Calculus"],
  };

  const userdetails = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_USER_DETAILS, {
        withCredentials: true,
      });
      setUser(response.data.user.name || "");
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    userdetails();
    handleMarks();
    fetchTasks();
    fetchNotes();
    fetchMotivationalQuote();

    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_GET_TASK, {
        withCredentials: true,
      });
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTask = async () => {
    const subject = newTask.subject.trim();
    const title = newTask.title.trim();

    if (!subject || !title) {
      alert("Both subject and title are required.");
      return;
    }

    try {
      const response = await axios.post(
        process.env.REACT_APP_ADD_TASK,
        { subject, title },
        { withCredentials: true }
      );
      // Use the server's list so every task has its real _id
      setTasks(response.data.tasks || []);
      setNewTask({ subject: newTask.subject, title: "", time: "" });
      fetchAnalytics();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task.");
    }
  };
  const handleDeleteTask = async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t._id);
    if (completedIds.length === 0) {
      alert("No completed tasks to delete.");
      return;
    }

    try {
      const res = await axios.post(
        process.env.REACT_APP_DELETE_TASK,
        { taskIds: completedIds },
        { withCredentials: true }
      );

      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting tasks.");
    }
  };

  const toggleTask = async (taskId) => {
    const previousTasks = tasks;
    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const toggledTask = updatedTasks.find((task) => task._id === taskId);
    try {
      await axios.post(process.env.REACT_APP_TOGGLE_TASK, toggledTask, {
        withCredentials: true,
      });
      fetchAnalytics();
    } catch (err) {
      console.error("Error updating task:", err);
      setTasks(previousTasks); // undo the optimistic update
      alert("Failed to update task status.");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_GET_NOTES, {
        withCredentials: true,
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // const handleAddNote = async () => {
  //   if (!newNote.title.trim() || !newNote.content.trim()) {
  //     alert("Both title and content are required.");
  //     return;
  //   }

  //   try {
  //     const res = await axios.post(
  //       "http://localhost:2000/add-note",
  //       { title: newNote.title, content: newNote.content },
  //       { withCredentials: true }
  //     );
  //     setNotes(res.data.notes);
  //     setNewNote({ title: "", content: "" });
  //     setShowNoteForm(false);
  //     alert("Note added!");
  //   } catch (err) {
  //     console.error("Failed to add note:", err);
  //     alert("Something went wrong.");
  //   }
  // };

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("Both title and content are required.");
      return;
    }

    const updatedNotes = [
      ...notes,
      { title: newNote.title.trim(), content: newNote.content.trim() },
    ];

    try {
      const res = await axios.post(
        process.env.REACT_APP_ADD_NOTES,
        { notes: updatedNotes },
        { withCredentials: true }
      );
      setNotes(res.data.notes);
      setNewNote({ title: "", content: "" });
      setShowNoteForm(false);
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Something went wrong.");
    }
  };
  // const handleDeleteNote = async (noteId) => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:2000/delete-note",
  //       { noteId },
  //       { withCredentials: true }
  //     );
  //     setNotes(res.data.notes);
  //     alert("Note deleted!");
  //   } catch (err) {
  //     console.error("Delete note failed:", err);
  //     alert("Failed to delete note.");
  //   }
  // };

  // Removes the most recent note (the button is labelled "Delete Last Note")
  const handleDeleteNote = async () => {
    if (notes.length === 0) return;
    const updatedNotes = notes.slice(0, -1);

    try {
      const res = await axios.post(
        process.env.REACT_APP_ADD_NOTES,
        { notes: updatedNotes },
        { withCredentials: true }
      );
      setNotes(res.data.notes);
    } catch (err) {
      console.error("Failed to save updated notes:", err);
      alert("Delete failed.");
    }
  };

  const SendScore = async () => {
    const score = prompt("Enter your score (0-100):");
    if (score === null) return; // cancelled
    const value = Number(score);
    if (score.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100) {
      alert("Please enter a number between 0 and 100.");
      return;
    }

    try {
      await axios.post(
        process.env.REACT_APP_SEND_SCORE,
        { marks: value },
        { withCredentials: true }
      );
      // Refresh the table, stats and analytics with the new score
      await handleMarks();
      fetchAnalytics();
    } catch (err) {
      console.error("Error sending score:", err.response?.data || err.message);
      alert("Failed to send score.");
    }
  };

  const handleMarks = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_HANDLE_MARKS, {
        withCredentials: true,
      });
      setMockTestMarks(
        Array.isArray(response.data)
          ? response.data.filter((n) => typeof n === "number" && isFinite(n))
          : []
      );
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  // Handles GATE branch change, fetches PDF, converts to HTML (mock), and sends to backend
  const handleBranchChange = async (e) => {
    const selected = e.target.value;
    setBranch(selected);

    const branchCode = selected.split(" - ")[0];
    const pdfPath =
      `/Gate_Syallbus/GATE_${branchCode}_2025_Syllabus.pdf`.replace(/\s+/g, "");
    setSyllabusPDF(pdfPath);
    setShowSyllabusModal(true);
  };

  // Toggle the completed status of a task and update backend
  // Toggle the completed status of a task and update backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(
          process.env.REACT_APP_SYLLABUS,
          {
            withCredentials: true,
          }
        );
        setTopicList(res.data.topics || []);
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };

    fetchTopics();
  }, []);

  const handleAddTopic = async () => {
    const topic = newTopic.trim();
    if (!topic) return;
    if (topicList.some((t) => t.toLowerCase() === topic.toLowerCase())) {
      alert("That topic is already in your list.");
      return;
    }

    const previousTopics = topicList;
    const updatedTopics = [...topicList, topic];
    setTopicList(updatedTopics);
    setNewTopic("");

    try {
      await axios.post(
        process.env.REACT_APP_ADD_TOPICS,
        {
          branch: branch.split(" - ")[0],
          completedTopics: updatedTopics,
        },
        { withCredentials: true }
      );
      fetchAnalytics();
    } catch (err) {
      console.error("Error updating topics:", err);
      setTopicList(previousTopics);
      alert("Failed to update.");
    }
  };
  const handleDeleteTopic = async (topicToDelete) => {
    const previousTopics = topicList;
    const updated = topicList.filter((topic) => topic !== topicToDelete);
    setTopicList(updated);

    try {
      await axios.post(
        process.env.REACT_APP_DELETE_TOPICS,
        {
          completedTopics: updated,
          branch: branch.split(" - ")[0],
        },
        { withCredentials: true }
      );
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to sync deleted topic:", err);
      setTopicList(previousTopics);
      alert("Failed to delete the topic.");
    }
  };

  // STopWatch
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchInterval.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(stopwatchInterval.current);
    }
    return () => clearInterval(stopwatchInterval.current);
  }, [isStopwatchRunning]);

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning && timerTime > 0) {
      timerInterval.current = setInterval(() => {
        setTimerTime((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isTimerRunning, timerTime]);

  // Stop the timer once it reaches zero
  useEffect(() => {
    if (isTimerRunning && timerTime === 0) setIsTimerRunning(false);
  }, [isTimerRunning, timerTime]);

  const startTimer = () => {
    if (timerTime > 0) {
      setIsTimerRunning(true); // resume after a pause
      return;
    }
    const seconds = Math.floor(Number(timerInput));
    if (!Number.isFinite(seconds) || seconds <= 0) {
      alert("Enter the time in seconds (greater than 0).");
      return;
    }
    setTimerTime(seconds);
    setIsTimerRunning(true);
  };

  const formatTime = (time) => {
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };
  // songs
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const songs = [
    { name: "Song 1", file: "/Music/Song1.mp3" },
  ];

  const togglePlay = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error("Audio play error:", err);
        alert("Cannot play audio. Check console.");
      });
    }

    setIsPlaying(!isPlaying);
  };

  const switchSong = (index) => {
    const wasPlaying = isPlaying;
    setCurrentSongIndex(index);
    setIsPlaying(false);

    // Delay to let the new <audio> source load, then resume if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Audio play error:", err));
      }, 100);
    }
  };

  // Mock-score numbers shared by the chart and the KPI strip
  const scoreData = mockTestMarks.map((score, i) => ({ test: i + 1, score }));
  const highest = mockTestMarks.length ? Math.max(...mockTestMarks) : 0;
  const average = mockTestMarks.length
    ? Math.round(mockTestMarks.reduce((a, b) => a + b, 0) / mockTestMarks.length)
    : 0;
  const streakRing = Math.min(
    100,
    ((analytics.currentStreak || 0) / Math.max(analytics.bestStreak || 0, 7)) * 100
  );

  const pyqs = [
    { year: "2023", file: "gate 2023.pdf" },
    { year: "2022", file: "gate 2022.pdf" },
    { year: "2021 Set 1", file: "gate 2021 set 1.pdf" },
    { year: "2021 Set 2", file: "gate 2021 set 2.pdf" },
    { year: "2020 (CSE)", file: "gate 2020 cse.pdf" },
    { year: "2019 (CSE)", file: "gate 2019 cse.pdf" },
  ];

  return (
    <div className="apple-ui">
      <audio ref={audioRef} src={songs[currentSongIndex].file} loop />

      {/* Music player */}
      <div className="ux-music">
        <select
          aria-label="Choose a song"
          value={currentSongIndex}
          onChange={(e) => switchSong(Number(e.target.value))}
        >
          {songs.map((song, index) => (
            <option key={index} value={index}>
              {song.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="ux-btn ux-icon-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>

      <AppShell
        bare
        active="dashboard"
        userName={user1}
        tabs={[
          { label: "Me", id: "overview" },
          { label: "Library", id: "library" },
        ]}
      >
        <div id="overview" style={{ marginBottom: "26px" }}>
          <h1 style={{ fontSize: "42px", fontWeight: 500, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Welcome back{user1 ? `, ${user1}` : ""}
          </h1>
          <p style={{ color: "var(--label-2)", margin: "8px 0 0", fontSize: "18px" }}>
            Let's crack GATE with focus and consistency.
          </p>
        </div>

        {/* Stat rings */}
        <section className="ux-stats" aria-label="Overview">
          <div className="ux-card ux-stat">
            <div className="ux-stat-head">
              <BookOpen size={18} color="var(--accent)" />
              <span>{topicList.length} topics logged</span>
            </div>
            <Ring value={analytics.subjectsCompleted} colors={["#ff7a5c", "#ff4d79"]}>
              <BookOpen size={34} strokeWidth={1.4} />
            </Ring>
            <div className="ux-big">
              {analytics.subjectsCompleted ?? 0}
              <small>%</small>
            </div>
            <div className="ux-cap">Syllabus covered</div>
          </div>

          <div className="ux-card ux-stat">
            <div className="ux-stat-head">
              <TrendingUp size={18} color="var(--blue)" />
              <span>{mockTestMarks.length} tests</span>
            </div>
            <Ring value={analytics.accuracy} colors={["#5ac8fa", "#8b7cff"]}>
              <TrendingUp size={34} strokeWidth={1.4} />
            </Ring>
            <div className="ux-big">
              {analytics.accuracy ?? 0}
              <small>%</small>
            </div>
            <div className="ux-cap">Avg mock score</div>
          </div>

          <div className="ux-card ux-stat">
            <div className="ux-stat-head">
              <Flame size={18} color="var(--orange)" />
              <span>Best {analytics.bestStreak ?? 0} days</span>
            </div>
            <Ring value={streakRing} colors={["#ffb15c", "#ff6fae"]}>
              <Flame size={34} strokeWidth={1.4} />
            </Ring>
            <div className="ux-big">
              {analytics.currentStreak ?? 0}
              <small>DAYS</small>
            </div>
            <div className="ux-cap">Current streak</div>
          </div>

          <HabitSummaryCard />
        </section>

        {/* Planner + scores */}
        <section className="ux-two">
          <div className="ux-card" id="planner">
            <h2 className="ux-title">planner</h2>
            {tasks.length === 0 ? (
              <div className="ux-empty">No tasks yet. Add your first one below.</div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`ux-row${task.completed ? " done" : ""}`}>
                  <div className="ux-row-main">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={!!task.completed}
                      aria-label={task.title}
                      className={`ux-check${task.completed ? " on" : ""}`}
                      onClick={() => toggleTask(task._id)}
                    >
                      {task.completed && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span className="ux-chip accent">{task.subject}</span>
                    <span className="ux-row-title">{task.title}</span>
                  </div>
                </div>
              ))
            )}

            {showTaskForm ? (
              <div className="ux-form">
                <div className="ux-form-row">
                  <select
                    aria-label="Subject"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    style={{ flex: "0 0 120px" }}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Task title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                </div>
                <div className="ux-actions">
                  <button type="button" className="ux-btn" onClick={handleAddTask}>
                    Add task
                  </button>
                  <button type="button" className="ux-btn danger" onClick={handleDeleteTask}>
                    Delete completed
                  </button>
                  <button type="button" className="ux-btn ghost" onClick={() => setShowTaskForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="ux-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="ux-btn" onClick={() => setShowTaskForm(true)}>
                  <Plus size={18} /> Add task
                </button>
              </div>
            )}
          </div>

          <div className="ux-card" id="scores">
            <h2 className="ux-title">scores</h2>
            {scoreData.length === 0 ? (
              <div className="ux-empty">No scores yet. Use "Enter score" after a mock test.</div>
            ) : (
              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreData} margin={{ top: 12, right: 14, bottom: 0, left: -14 }}>
                    <defs>
                      <linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b7cff" />
                        <stop offset="100%" stopColor="#ff6fae" />
                      </linearGradient>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6fae" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#ff6fae" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="test"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#d0c8c4", fontSize: 13 }}
                      tickFormatter={(v) => `T${v}`}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#d0c8c4", fontSize: 13 }}
                    />
                    <Tooltip content={<ScoreTip />} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="url(#scoreLine)"
                      strokeWidth={3}
                      fill="url(#scoreFill)"
                      dot={{ r: 4, fill: "#ff6fae", stroke: "#1b1716", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#fff", stroke: "#ff6fae", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="ux-kpis">
              <div className="ux-kpi">
                <div className="ux-big">{mockTestMarks.length}</div>
                <div className="ux-cap muted">Total tests</div>
              </div>
              <div className="ux-kpi">
                <div className="ux-big">{highest}</div>
                <div className="ux-cap muted">Highest score</div>
              </div>
              <div className="ux-kpi">
                <div className="ux-big">{average}</div>
                <div className="ux-cap muted">Average score</div>
              </div>
            </div>

            <div className="ux-actions" style={{ marginTop: "20px" }}>
              <button type="button" className="ux-btn" onClick={SendScore}>
                <Plus size={18} /> Enter score
              </button>
              <button
                type="button"
                className="ux-btn ghost"
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * 5) + 1;
                  setMockTestPDF(`/Gate_Mock/GATE_MockTest_${randomIndex}.pdf`);
                  setShowMockTestModal(true);
                }}
              >
                <FlaskConical size={18} /> Take mock test
              </button>
            </div>
          </div>
        </section>

        {/* Library */}
        <h2 className="ux-title" id="library" style={{ scrollMarginTop: "24px" }}>
          library
        </h2>
        <section className="ux-library">
          <div className="ux-card">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              syllabus
            </h3>
            <select
              aria-label="GATE branch"
              value={branch}
              onChange={handleBranchChange}
              style={{ width: "100%", marginBottom: "14px" }}
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ux-btn block"
              onClick={() => {
                const branchCode = branch.split(" - ")[0];
                setSyllabusPDF(`/Gate_Syallbus/GATE_${branchCode}_2025_Syllabus.pdf`.replace(/\s+/g, ""));
                setShowSyllabusModal(true);
              }}
            >
              <BookOpen size={18} /> View syllabus
            </button>
          </div>

          <div className="ux-card">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              previous papers
            </h3>
            {pyqs.map(({ year, file }) => {
              const fileUrl = `/Gate_PYQs/${file}`;
              return (
                <div key={year} className="ux-row">
                  <span className="ux-row-title">GATE {year}</span>
                  <div className="ux-actions" style={{ flexWrap: "nowrap" }}>
                    <button
                      type="button"
                      className="ux-btn ghost sm"
                      onClick={() => {
                        setPyqPDF(fileUrl);
                        setShowPYQModal(true);
                      }}
                    >
                      View
                    </button>
                    <a href={fileUrl} download className="ux-btn ghost sm">
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ux-card" id="notes">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              pinned notes
            </h3>
            {notes.length === 0 ? (
              <div className="ux-empty">No notes yet. Add your first note.</div>
            ) : (
              notes.map((note, index) => (
                <div key={note._id || index} className="ux-row" style={{ alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="ux-row-title">{note.title}</div>
                    <div style={{ color: "var(--label-2)", fontSize: "15px", marginTop: 2, whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </div>
                  </div>
                </div>
              ))
            )}

            {showNoteForm ? (
              <div className="ux-form">
                <input
                  type="text"
                  aria-label="Note title"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <textarea
                  aria-label="Note content"
                  placeholder="Note content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  style={{ resize: "vertical" }}
                />
                <div className="ux-actions">
                  <button type="button" className="ux-btn" onClick={handleAddNote}>
                    Save note
                  </button>
                  <button
                    type="button"
                    className="ux-btn ghost"
                    onClick={() => {
                      setShowNoteForm(false);
                      setNewNote({ title: "", content: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="ux-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="ux-btn" onClick={() => setShowNoteForm(true)}>
                  <Plus size={18} /> Add note
                </button>
                {notes.length > 0 && (
                  <button type="button" className="ux-btn danger" onClick={handleDeleteNote}>
                    <Minus size={18} /> Delete last
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ux-card">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              completed topics
            </h3>
            <div className="ux-form-row" style={{ marginBottom: "10px" }}>
              <input
                type="text"
                aria-label="New topic"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                placeholder="Enter a topic you finished"
              />
              <button type="button" className="ux-btn" style={{ flex: "0 0 auto" }} onClick={handleAddTopic}>
                Add
              </button>
            </div>
            {topicList.filter((t) => t.trim() !== "").length === 0 && (
              <div className="ux-empty">Topics you finish will show up here.</div>
            )}
            {topicList
              .filter((t) => t.trim() !== "")
              .map((topic) => (
                <div key={topic} className="ux-row">
                  <span className="ux-row-title">{topic}</span>
                  <button
                    type="button"
                    className="ux-btn danger ux-icon-btn"
                    aria-label={`Delete ${topic}`}
                    onClick={() => handleDeleteTopic(topic)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>

          <div className="ux-card">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              timer &amp; stopwatch
            </h3>

            <div className="ux-row" style={{ borderBottom: 0, paddingBottom: 4 }}>
              <span className="ux-cap">Stopwatch</span>
              <span style={{ fontSize: "30px", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(stopwatchTime)}
              </span>
            </div>
            <div className="ux-actions">
              <button type="button" className="ux-btn sm" onClick={() => setIsStopwatchRunning(true)}>
                Start
              </button>
              <button type="button" className="ux-btn ghost sm" onClick={() => setIsStopwatchRunning(false)}>
                Pause
              </button>
              <button
                type="button"
                className="ux-btn ghost sm"
                onClick={() => {
                  setStopwatchTime(0);
                  setIsStopwatchRunning(false);
                }}
              >
                Reset
              </button>
            </div>

            <div className="ux-nav-sep" style={{ margin: "18px 0" }} />

            <div className="ux-row" style={{ borderBottom: 0, paddingBottom: 4 }}>
              <span className="ux-cap">Timer</span>
              <span style={{ fontSize: "30px", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(timerTime)}
              </span>
            </div>
            <input
              type="number"
              min="1"
              aria-label="Timer length in seconds"
              placeholder="Time in seconds"
              value={timerInput}
              onChange={(e) => setTimerInput(e.target.value)}
              style={{ width: "100%", marginBottom: "12px" }}
            />
            <div className="ux-actions">
              <button type="button" className="ux-btn sm" onClick={startTimer}>
                Start
              </button>
              <button type="button" className="ux-btn ghost sm" onClick={() => setIsTimerRunning(false)}>
                Pause
              </button>
              <button
                type="button"
                className="ux-btn ghost sm"
                onClick={() => {
                  setTimerTime(0);
                  setTimerInput("");
                  setIsTimerRunning(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="ux-card">
            <h3 className="ux-title" style={{ fontSize: "22px" }}>
              daily motivation
            </h3>
            <p style={{ fontSize: "20px", fontWeight: 300, lineHeight: 1.5, margin: "0 0 18px", color: "var(--label)" }}>
              “{currentQuote}”
            </p>
            <button type="button" className="ux-btn ghost block" onClick={fetchMotivationalQuote}>
              <Sparkles size={18} /> New quote
            </button>
          </div>
        </section>
      </AppShell>

      <PdfModal
        open={showSyllabusModal}
        src={syllabusPDF}
        title="Syllabus"
        onClose={() => setShowSyllabusModal(false)}
      />
      <PdfModal
        open={showMockTestModal}
        src={mockTestPDF}
        title="Mock Test"
        onClose={() => setShowMockTestModal(false)}
      />
      <PdfModal
        open={showPYQModal}
        src={pyqPDF}
        title="Previous Paper"
        onClose={() => setShowPYQModal(false)}
      />
    </div>
  );
};

export default GateDashboard;
