import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  BookOpen,
  TrendingUp,
  FileText,
  Target,
  Heart,
  Settings,
  CheckCircle,
  Circle,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GateDashboard = () => {
  const [analytics, setAnalytics] = useState({
    subjectsCompleted: 0,
    accuracy: 0,
    bestStreak: 0,
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
      const res = await axios.get("http://localhost:2000/get-analytics", {
        withCredentials: true,
      });
      setAnalytics(res.data);
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
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:2000/tasks", {
        withCredentials: true,
      });
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTask = async () => {
    const subject = prompt("Enter subject (e.g. DSA, OS, DBMS):");
    const title = prompt("Enter task title:");

    if (!subject || !title) {
      alert("Both subject and title are required.");
      return;
    }

    const newTaskItem = {
      subject,
      title,

      completed: false,
    };
    try {
      const response = await axios.post(
        "http://localhost:2000/add-task",
        newTaskItem,
        {
          withCredentials: true,
        }
      );
      alert(response.data.message || "Task added successfully");
      setTasks((prev) => [...(prev || []), { ...newTaskItem, id: Date.now() }]);
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task.");
    }
  };
  const handleDeleteTask = async () => {
    if (tasks.length === 0) {
      alert("No tasks to delete.");
      return;
    }

    const taskTitles = tasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
    const choice = prompt(
      `Enter the number of the task to delete:\n${taskTitles}`
    );

    const index = parseInt(choice) - 1;
    if (isNaN(index) || index < 0 || index >= tasks.length) {
      alert("Invalid selection.");
      return;
    }

    const taskId = tasks[index]._id;

    try {
      const res = await axios.post(
        "http://localhost:2000/delete-task",
        {
          taskId,
        },
        {
          withCredentials: true,
        }
      );

      setTasks(res.data.tasks);
      alert("Task deleted!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting task.");
    }
  };

  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const toggledTask = updatedTasks.find((task) => task._id === taskId);
    try {
      await axios.post("http://localhost:2000/update-tasks", toggledTask, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task status.");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:2000/get-notes", {
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
      {
        title: newNote.title,
        content: newNote.content,
        id: Date.now(), // Add some unique ID client-side
      },
    ];

    try {
      const res = await axios.post(
        "http://localhost:2000/save-notes",
        { notes: updatedNotes },
        { withCredentials: true }
      );
      setNotes(res.data.notes); // Optional, can skip and use `updatedNotes`
      setNewNote({ title: "", content: "" });
      setShowNoteForm(false);
      alert("Note added!");
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

  const handleDeleteNote = async (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);

    try {
      const res = await axios.post(
        "http://localhost:2000/save-notes",
        { notes: [] },
        { withCredentials: true }
      );
      setNotes(res.data.notes); // Or just setNotes(updatedNotes)
    } catch (err) {
      console.error("Failed to save updated notes:", err);
      alert("Delete failed.");
    }
  };

  const SendScore = async () => {
    const score = prompt("Enter your score:");
    if (!score || isNaN(score)) {
      alert("Please enter a valid number.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:2000/mockscore",
        { marks: Number(score) },
        { withCredentials: true }
      );
      alert(response.data.message || "Score sent successfully");
    } catch (err) {
      console.error("Error sending score:", err.response?.data || err.message);
      alert("Failed to send score.");
    }
  };

  const handleMarks = async () => {
    try {
      const response = await axios.get("http://localhost:2000/getmarks", {
        withCredentials: true,
      });
      console.log(response.data);
      setMockTestMarks(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    marginBottom: "16px",
  };
  const buttonStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
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

    try {
      const response = await fetch(pdfPath);
      const blob = await response.blob();
    } catch (err) {
      console.error("Error processing syllabus PDF:", err);
    }
  };

  // Toggle the completed status of a task and update backend
  // Toggle the completed status of a task and update backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(
          "http://localhost:2000/get-syllabus-progress",
          {
            withCredentials: true,
          }
        );
        setTopicList(res.data.topics || []);
        console.log(res.data.topics);
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };

    fetchTopics();
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;

    const updatedTopics = [...topicList, newTopic.trim()];
    setTopicList(updatedTopics);
    setNewTopic("");

    try {
      await axios.post(
        "http://localhost:2000/update-syllabus-progress",
        {
          branch: branch.split(" - ")[0],
          completedTopics: updatedTopics,
        },
        { withCredentials: true }
      );

      alert("Topic added and saved!");
    } catch (err) {
      console.error("Error updating topics:", err);
      alert("Failed to update.");
    }
  };
  const handleDeleteTopic = async (topicToDelete) => {
    const updated = topicList.filter((topic) => topic !== topicToDelete);
    setTopicList(updated);

    try {
      await axios.post(
        "http://localhost:2000/update-syllabus-progress",
        {
          completedTopics: updated,
          branch: branch.split(" - ")[0],
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to sync deleted topic:", err);
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
        setTimerTime((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isTimerRunning, timerTime]);

  const formatTime = (time) => {
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };
  const buttonStyle1 = (bgColor) => ({
    padding: "10px 16px",
    backgroundColor: bgColor,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  });
  const inputStyle = {
    backgroundColor: "#F2F2F2",
    border: "2px solid #EAE4D5",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.3s ease",
  };

  // songs
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const songs = [
    { name: "Song 1", file: "/Music/Song1.mp3" },
    { name: "Song 2", file: "/Music/Song2.mp3" },
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

  const switchSong = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    setIsPlaying(false);

    // Delay to allow state update
    setTimeout(() => {
      audioRef.current.play();
      setIsPlaying(true);
    }, 100);
  };

  // Spotify

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #F2F2F2 0%, #EAE4D5 100%)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <audio ref={audioRef} src={songs[currentSongIndex].file} loop />

      {/* Music Player */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#EAE4D5",
          padding: "16px 20px",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          border: "1px solid #B6B09F",
        }}
      >
        <select
          value={currentSongIndex}
          onChange={(e) => switchSong(Number(e.target.value))}
          style={{
            ...inputStyle,
            width: "140px",
            fontSize: "13px",
            padding: "8px 12px",
          }}
        >
          {songs.map((song, index) => (
            <option key={index} value={index}>
              {song.name}
            </option>
          ))}
        </select>
        <button
          onClick={togglePlay}
          style={{
            ...buttonStyle,
            backgroundColor: isPlaying ? "#000000" : "#B6B09F",
            color: isPlaying ? "#F2F2F2" : "#000000",
            padding: "8px 16px",
            fontSize: "13px",
          }}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={cardStyle}>
          <h1
            style={{
              fontSize: "32px",
              margin: "0 0 8px 0",
              color: "#000000",
              fontWeight: "700",
            }}
          >
            👋 Welcome back, {user1}!
          </h1>
          <p
            style={{
              color: "#B6B09F",
              margin: 0,
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Let's crack GATE with focus and consistency!
          </p>
        </div>

        {/* Smart Planner */}
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: "22px",
              margin: "0 0 20px 0",
              color: "#000000",
              fontWeight: "600",
            }}
          >
            🧠 Your Smart Planner
          </h2>
          {tasks.map((task) => (
            <div
              key={task._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                backgroundColor: task.completed ? "#EAE4D5" : "#F2F2F2",
                borderRadius: "12px",
                marginBottom: "12px",
                border: `2px solid ${task.completed ? "#B6B09F" : "#EAE4D5"}`,
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <span
                  style={{
                    backgroundColor:
                      task.subject === "DSA"
                        ? "#000000"
                        : task.subject === "OS"
                        ? "#B6B09F"
                        : "#EAE4D5",
                    color: task.subject === "DSA" ? "#F2F2F2" : "#000000",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  📘 {task.subject}
                </span>
                <span
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => toggleTask(task._id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                }}
              >
                {task.completed ? (
                  <CheckCircle color="#B6B09F" />
                ) : (
                  <Circle color="#B6B09F" />
                )}
              </button>
            </div>
          ))}

          {showTaskForm ? (
            <div
              style={{
                backgroundColor: "#EAE4D5",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "16px",
              }}
            >
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "12px" }}
              >
                <select
                  value={newTask.subject}
                  onChange={(e) =>
                    setNewTask({ ...newTask, subject: e.target.value })
                  }
                  style={{ ...inputStyle, flex: 1 }}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  style={{ ...inputStyle, flex: 2 }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleAddTask}
                  style={{ ...buttonStyle, flex: 1 }}
                >
                  Add Task
                </button>
                <button
                  onClick={handleDeleteTask}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#000000",
                    color: "#F2F2F2",
                    flex: 1,
                  }}
                >
                  🗑️ Delete Completed
                </button>
                <button
                  onClick={() => setShowTaskForm(false)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#F2F2F2",
                    color: "#000000",
                    border: "2px solid #B6B09F",
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTaskForm(true)}
              style={{ ...buttonStyle, marginTop: "16px" }}
            >
              <Plus size={18} style={{ marginRight: "8px" }} /> Add Custom Task
            </button>
          )}
        </div>

        {/* Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Syllabus Tracker */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              📚 Syllabus
            </h3>
            <select
              value={branch}
              onChange={handleBranchChange}
              style={{
                ...inputStyle,
                width: "100%",
                marginBottom: "16px",
              }}
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const branchCode = branch.split(" - ")[0];
                setSyllabusPDF(
                  `/Gate_Syallbus/GATE_${branchCode}_2025_Syllabus.pdf`.replace(
                    /\s+/g,
                    ""
                  )
                );
                setShowSyllabusModal(true);
              }}
              style={{ ...buttonStyle, width: "100%" }}
            >
              <BookOpen size={18} style={{ marginRight: "8px" }} /> View
              Syllabus
            </button>
          </div>

          {/* Performance Analytics */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              📊 Performance Analytics
            </h3>
            <div
              style={{
                backgroundColor: "#EAE4D5",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#B6B09F",
                      color: "#000000",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                        borderRadius: "8px 0 0 8px",
                        fontWeight: "600",
                      }}
                    >
                      Test #
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        borderRadius: "0 8px 8px 0",
                        fontWeight: "600",
                      }}
                    >
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTestMarks.slice(-3).map((score, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#F2F2F2" : "#EAE4D5",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {mockTestMarks.length - 4 + index + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {typeof score === "number" && !isNaN(score)
                          ? `${score}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mock Tests */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              🧪 Mock Tests
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={() => {
                  const randomIndex = Math.floor(Math.random() * 5) + 1;
                  setMockTestPDF(`/Gate_Mock/GATE_MockTest_${randomIndex}.pdf`);
                  setShowMockTestModal(true);
                }}
                style={{ ...buttonStyle, width: "100%" }}
              >
                🧪 Take Mock Test
              </button>
              <button
                onClick={SendScore}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#000000",
                  color: "#F2F2F2",
                  width: "100%",
                }}
              >
                📝 Enter Score
              </button>
            </div>
          </div>

          {/* Previous Papers */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              📂 Previous Papers
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                { year: "2023", file: "gate 2023.pdf" },
                { year: "2022", file: "gate 2022.pdf" },
                { year: "2021 Set 1", file: "gate 2021 set 1.pdf" },
                { year: "2021 Set 2", file: "gate 2021 set 2.pdf" },
                { year: "2020 (CSE)", file: "gate 2020 cse.pdf" },
                { year: "2019 (CSE)", file: "gate 2019 cse.pdf" },
              ].map(({ year, file }) => {
                const fileUrl = `/Gate_PYQs/${file}`;
                return (
                  <div
                    key={year}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#EAE4D5",
                      borderRadius: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#000000",
                      }}
                    >
                      GATE {year}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setPyqPDF(fileUrl);
                          setShowPYQModal(true);
                        }}
                        style={{
                          ...buttonStyle,
                          fontSize: "12px",
                          padding: "6px 12px",
                          backgroundColor: "#000000",
                          color: "#F2F2F2",
                        }}
                      >
                        👁️ View
                      </button>
                      <a
                        href={fileUrl}
                        download
                        style={{
                          ...buttonStyle,
                          fontSize: "12px",
                          padding: "6px 12px",
                          backgroundColor: "#B6B09F",
                          color: "#000000",
                          textDecoration: "none",
                        }}
                      >
                        📥 Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Stats */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              🧑‍🎓 Your Stats
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {[
                {
                  label: "Total Tests",
                  value: mockTestMarks.length,
                  color: "#B6B09F",
                },
                {
                  label: "Highest Score",
                  value:
                    mockTestMarks.length > 0 ? Math.max(...mockTestMarks) : 0,
                  color: "#000000",
                },
                {
                  label: "Average Score",
                  value:
                    mockTestMarks.length > 0
                      ? Math.round(
                          mockTestMarks.reduce((a, b) => a + b, 0) /
                            mockTestMarks.length
                        )
                      : 0,
                  color: "#EAE4D5",
                },
                { label: "Notes Saved", value: notes.length, color: "#B6B09F" },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "#EAE4D5",
                    borderRadius: "12px",
                    border: "2px solid #B6B09F",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#000000",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#B6B09F",
                      fontWeight: "600",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Motivation */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              💬 Daily Motivation
            </h3>
            <div
              style={{
                backgroundColor: "#EAE4D5",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "16px",
                border: "2px solid #B6B09F",
              }}
            >
              <p
                style={{
                  fontStyle: "italic",
                  color: "#000000",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                "{currentQuote}"
              </p>
            </div>
            <button
              onClick={fetchMotivationalQuote}
              style={{ ...buttonStyle, width: "100%" }}
            >
              🔄 Get New Quote
            </button>
          </div>

          {/* Pinned Notes */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              📝 Pinned Notes
            </h3>
            <div style={{ marginBottom: "16px" }}>
              {notes.length === 0 ? (
                <div
                  style={{
                    color: "#B6B09F",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: "#EAE4D5",
                    borderRadius: "12px",
                  }}
                >
                  No notes yet. Add your first note!
                </div>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#EAE4D5",
                      padding: "16px",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      border: "2px solid #B6B09F",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#000000",
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      {note.title}
                    </div>
                    <div
                      style={{
                        color: "#000000",
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    >
                      {note.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {showNoteForm ? (
              <div
                style={{
                  backgroundColor: "#EAE4D5",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    width: "100%",
                    marginBottom: "12px",
                  }}
                />
                <textarea
                  placeholder="Note content"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  rows={4}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    marginBottom: "12px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleAddNote}
                    style={{ ...buttonStyle, flex: 1 }}
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteForm(false);
                      setNewNote({ title: "", content: "" });
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#F2F2F2",
                      color: "#000000",
                      border: "2px solid #B6B09F",
                      flex: 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNoteForm(true)}
                style={{ ...buttonStyle, width: "100%", marginBottom: "12px" }}
              >
                <Plus size={16} style={{ marginRight: "8px" }} /> Add Note
              </button>
            )}
            <button
              onClick={handleDeleteNote}
              style={{
                ...buttonStyle,
                backgroundColor: "#000000",
                color: "#F2F2F2",
                width: "100%",
              }}
            >
              <Minus size={16} style={{ marginRight: "8px" }} /> Delete Last
              Note
            </button>
          </div>

          {/* Completed Topics */}
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "20px",
                margin: "0 0 16px 0",
                color: "#000000",
                fontWeight: "600",
              }}
            >
              📝 Completed Topics
            </h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Enter a new topic"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={handleAddTopic} style={buttonStyle}>
                ➕ Add
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {topicList
                .filter((t) => t.trim() !== "")
                .map((topic, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#EAE4D5",
                      borderRadius: "8px",
                      border: "1px solid #B6B09F",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#000000",
                        fontWeight: "500",
                      }}
                    >
                      {topic}
                    </span>
                    <button
                      onClick={() => handleDeleteTopic(topic)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: "#000000",
                        color: "#F2F2F2",
                        padding: "6px 12px",
                        fontSize: "12px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div
            style={{
              minHeight: "30vh",
              backgroundColor: "#F2F2F2",
              padding: "40px 20px",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingTop: "60px",
            }}
          >
            <div
              style={{
                backgroundColor: "#EAE4D5",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #B6B09F",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                maxWidth: "380px",
                width: "100%",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#000000",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⏱️ Timer & Stopwatch
              </h3>

              {/* Stopwatch */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    fontSize: "16px",
                    color: "#000000",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    🕒 Stopwatch
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#000000",
                    }}
                  >
                    {formatTime(stopwatchTime)}
                  </span>
                </h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setIsStopwatchRunning(true)}
                    style={buttonStyle1("#000000")}
                  >
                    ▶ Start
                  </button>
                  <button
                    onClick={() => setIsStopwatchRunning(false)}
                    style={buttonStyle1("#B6B09F")}
                  >
                    ⏸️ Pause
                  </button>
                  <button
                    onClick={() => {
                      setStopwatchTime(0);
                      setIsStopwatchRunning(false);
                    }}
                    style={buttonStyle1("#B6B09F")}
                  >
                    🔁 Reset
                  </button>
                </div>
              </div>

              {/* Timer */}
              <div>
                <h4
                  style={{
                    fontSize: "16px",
                    color: "#000000",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ⏳ Timer
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#000000",
                    }}
                  >
                    {formatTime(timerTime)}
                  </span>
                </h4>
                <div style={{ marginBottom: "12px" }}>
                  <input
                    type="number"
                    placeholder="Enter time in seconds"
                    value={timerInput}
                    onChange={(e) => setTimerInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid #B6B09F",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#F2F2F2",
                      color: "#000000",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setTimerTime(Number(timerInput));
                      setIsTimerRunning(true);
                    }}
                    style={buttonStyle1("#000000")}
                  >
                    🟢 Start
                  </button>
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    style={buttonStyle1("#B6B09F")}
                  >
                    ⏸️ Pause
                  </button>
                  <button
                    onClick={() => {
                      setTimerTime(0);
                      setTimerInput("");
                      setIsTimerRunning(false);
                    }}
                    style={buttonStyle1("#B6B09F")}
                  >
                    🔁 Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSyllabusModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowSyllabusModal(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
            <iframe
              src={syllabusPDF}
              width="800px"
              height="600px"
              style={{ border: "none" }}
              title="Syllabus PDF"
            />
          </div>
        </div>
      )}

      {/* Mock Test Modal */}
      {showMockTestModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowMockTestModal(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
            <iframe
              src={mockTestPDF}
              width="800px"
              height="600px"
              style={{ border: "none" }}
              title="Mock Test PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GateDashboard;
