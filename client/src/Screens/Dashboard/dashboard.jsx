import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, TrendingUp, FileText, Target, Heart, Settings, CheckCircle, Circle } from 'lucide-react';


const GateDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [user1, setUser] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ subject: 'DSA', title: '', time: '' });
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusPDF, setSyllabusPDF] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [mockTestPDF, setMockTestPDF] = useState('');
  const [showMockTestModal, setShowMockTestModal] = useState(false);
  const [mockTestMarks, setMockTestMarks] = useState([]);

  const [currentQuote, setCurrentQuote] = useState("Loading motivation...");



const fetchMotivationalQuote = async () => {
  try {
    const res = await axios.get("https://zenquotes.io/api/random");
    const quoteObj = res.data[0];
    setCurrentQuote(`${quoteObj.q} — ${quoteObj.a}`);
  } catch (err) {
    console.error("Quote fetch failed:", err);
    setCurrentQuote("Stay consistent and believe in yourself!");
  }
};


const [topicList, setTopicList] = useState([]);
const [newTopic, setNewTopic] = useState('');

  
  
  const subjects = ['DSA', 'OS', 'CN', 'DBMS', 'COA', 'Math'];
  const branches = [
    'AE - Aerospace Engineering',
    'AG - Agricultural Engineering',
    'AR - Architecture and Planning',
    'BM - Biomedical Engineering',
    'BT - Biotechnology',
    'CE - Civil Engineering',
    'CH - Chemical Engineering',
    'CS - Computer Science & Information Technology',
    'GG - Geology & Geophysics',
    'IN - Instrumentation Engineering',
    'MA - Mathematics',
    'ME - Mechanical Engineering',
    'MN - Mining Engineering',
    'MT - Metallurgical Engineering',
    'NM - Naval Architecture & Marine Engineering'
  ];
  
  const syllabusTopics = {
    DSA: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    OS: ['Process Management', 'Memory Management', 'File Systems', 'Synchronization'],
    CN: ['OSI Model', 'TCP/IP', 'Routing', 'Network Security'],
    DBMS: ['ER Model', 'Normalization', 'SQL', 'Transactions'],
    COA: ['CPU Organization', 'Memory Organization', 'I/O Organization'],
    Math: ['Probability', 'Statistics', 'Linear Algebra', 'Calculus']
  };

  const userdetails = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_USER_DETAILS, {
        withCredentials: true
      });
      setUser(response.data.user.name || '');
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }

  useEffect(() => {
    userdetails();
    handleMarks();
    fetchTasks();
    fetchNotes();
    fetchMotivationalQuote();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:2000/tasks", {
        withCredentials: true
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
      completed: false
    };
    try {
      const response = await axios.post('http://localhost:2000/add-task', newTaskItem, {
        withCredentials: true
      });
      alert(response.data.message || 'Task added successfully');
      setTasks(prev => [...(prev || []), { ...newTaskItem, id: Date.now() }]);
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
  const choice = prompt(`Enter the number of the task to delete:\n${taskTitles}`);

  const index = parseInt(choice) - 1;
  if (isNaN(index) || index < 0 || index >= tasks.length) {
    alert("Invalid selection.");
    return;
  }

  const taskId = tasks[index]._id;

  try {
    const res = await axios.post("http://localhost:2000/delete-task", {
      taskId
    }, {
      withCredentials: true
    });

    setTasks(res.data.tasks);
    alert("Task deleted!");
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Error deleting task.");
  }
};


  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task._id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const toggledTask = updatedTasks.find(task => task._id === taskId);
    try {
      await axios.post('http://localhost:2000/update-task', toggledTask, {
        withCredentials: true
      });
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task status.");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:2000/get-notes', {
        withCredentials: true
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert("Both title and content are required.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:2000/add-note",
        { title: newNote.title, content: newNote.content },
        { withCredentials: true }
      );
      setNotes(res.data.notes);
      setNewNote({ title: '', content: '' });
      setShowNoteForm(false);
      alert("Note added!");
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Something went wrong.");
    }
  };
  const handleDeleteNote = async (noteId) => {
  try {
    const res = await axios.post(
      "http://localhost:2000/delete-note",
      { noteId },
      { withCredentials: true }
    );
    setNotes(res.data.notes);
    alert("Note deleted!");
  } catch (err) {
    console.error("Delete note failed:", err);
    alert("Failed to delete note.");
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
        'http://localhost:2000/mockscore',
        { marks: Number(score) },
        { withCredentials: true }
      );
      alert(response.data.message || 'Score sent successfully');
    } catch (err) {
      console.error("Error sending score:", err.response?.data || err.message);
      alert("Failed to send score.");
    }
  };

  const handleMarks = async () => {
    try {
      const response = await axios.get('http://localhost:2000/getmarks', {
        withCredentials: true
      });
      setMockTestMarks(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  

  // Handles GATE branch change, fetches PDF, converts to HTML (mock), and sends to backend
  const handleBranchChange = async (e) => {
    const selected = e.target.value;
    setBranch(selected);

    const branchCode = selected.split(' - ')[0];
    const pdfPath = `/Gate_Syallbus/GATE_${branchCode}_2025_Syllabus.pdf`.replace(/\s+/g, '');
    
    try {
      const response = await fetch(pdfPath);
      const blob = await response.blob();

      // Convert PDF to base64 string (mock conversion to HTML)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;

        // Send to backend (you can later parse this to real HTML in the backend)
        await axios.post('http://localhost:2000/save-syllabus', {
          branch: branchCode,
          syllabusHtml: base64data // ideally convert to HTML before sending
        }, { withCredentials: true });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error processing syllabus PDF:", err);
    }
  };
  


  const cardStyle = { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '16px' };
  const buttonStyle = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

  

  // Toggle the completed status of a task and update backend
  // Toggle the completed status of a task and update backend
useEffect(() => {
  const fetchTopics = async () => {
    try {
      const res = await axios.get('http://localhost:2000/get-syllabus-progress', {
        withCredentials: true
      });
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
  setNewTopic('');

  try {
    await axios.post('http://localhost:2000/update-syllabus-progress', {
      branch: branch.split(' - ')[0],
      completedTopics: updatedTopics
    }, { withCredentials: true });

    alert('Topic added and saved!');
  } catch (err) {
    console.error("Error updating topics:", err);
    alert("Failed to update.");
  }
  };
  const handleDeleteTopic = async (topicToDelete) => {
  const updated = topicList.filter(topic => topic !== topicToDelete);
  setTopicList(updated);

  try {
    await axios.post("http://localhost:2000/update-syllabus-progress", {
      completedTopics: updated,
      branch: branch.split(' - ')[0],
    }, { withCredentials: true });
  } catch (err) {
    console.error("Failed to sync deleted topic:", err);
  }
};



  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Welcome Header */}
        <div style={cardStyle}>

          <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#2d3748' }}>👋 Welcome back, {user1}!</h1>

          {/* <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#2d3748' }}>👋 Welcome Back {user1 }!</h1> */}
          <p style={{ color: '#718096', margin: 0 }}>Let's crack GATE with focus and consistency!</p>
        </div>
        
        {/* Smart Planner */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', margin: '0 0 16px 0', color: '#2d3748' }}>🧠 Your Smart Planner</h2>
          {tasks.map(task => (
            <div
              key={task._id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: task.completed ? '#f0fff4' : '#fafafa', borderRadius: '8px', marginBottom: '8px', border: `2px solid ${task.completed ? '#68d391' : '#e2e8f0'}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: task.subject === 'DSA' ? '#3182ce' : task.subject === 'OS' ? '#38a169' : '#ed8936', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  📘 {task.subject}
                </span>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => toggleTask(task._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              >
                {task.completed ? <CheckCircle color="#38a169" /> : <Circle color="#a0aec0" />}
              </button>
            </div>
          ))}
          
          {showTaskForm ? (
            <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
              <select
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{ padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', width: '200px' }}
              />
              <button onClick={handleAddTask} style={{ ...buttonStyle, marginRight: '8px' }}>Add</button>
              <button
  onClick={handleDeleteTask}
  style={{
    marginTop: "12px",
    padding: "10px 16px",
    background: "#e53e3e",
    color: "white",
    borderRadius: "8px",
    fontWeight: "bold"
  }}
>
  🗑️ Delete Task
</button>

              <button onClick={() => setShowTaskForm(false)} style={{ ...buttonStyle, background: '#e2e8f0', color: '#2d3748' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowTaskForm(true)} style={{ ...buttonStyle, marginTop: '12px' }}>
              <Plus size={16} style={{ marginRight: '8px' }} /> Add Custom Task
            </button>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          
          {/* Syllabus Tracker */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>📚 Syllabus</h3>
            <select 
              value={branch} 
              onChange={handleBranchChange}
              style={{ padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #e2e8f0', width: '100%' }}
            >
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button
              onClick={() => {
                const branchCode = branch.split(' - ')[0];
                setSyllabusPDF(`/Gate_Syallbus/GATE_${branchCode}_2025_Syllabus.pdf`.replace(/\s+/g, ''));
                setShowSyllabusModal(true);
              }}
              style={buttonStyle}
            >
              <BookOpen size={16} style={{ marginRight: '8px' }} /> View Syllabus
            </button>
            {/* TODO: Add checkbox and notes UI for each syllabus topic from backend */}
          </div>
          
          {/* Performance Analytics */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>📊 Performance Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subjects Completed</span>
                <span style={{ fontWeight: 'bold', color: '#38a169' }}>65%</span>
              </div>
              <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ background: '#38a169', height: '100%', width: '65%', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Practice Accuracy</span>
                <span style={{ fontWeight: 'bold', color: '#3182ce' }}>78%</span>
              </div>
              <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px' }}>
                <div style={{ background: '#3182ce', height: '100%', width: '78%', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>👑 Best Streak: <strong>12 days</strong></span>
              <span>🎯 Consistency: <strong>85%</strong></span>
            </div>
          </div>
          
          {/* Mock Tests */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>🧪 Mock Tests</h3>
            <button
              style={{...buttonStyle, width: '100%', marginBottom: '12px'}}
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * 5) + 1;
                setMockTestPDF(`/Gate_Mock/GATE_MockTest_${randomIndex}.pdf`);
                setShowMockTestModal(true);
              }}
            >
              🧪 Take Mock Test
            </button>
            
            <button
              style={{ ...buttonStyle, width: '100%', marginBottom: '12px' }}
              onClick={SendScore}
            >
              Enter Score
            </button>
          </div>
          
          {/* Previous Papers */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>📂 Previous Papers</h3>
            <button style={{...buttonStyle, width: '100%', marginBottom: '12px'}}>
              <FileText size={16} style={{ marginRight: '8px' }} /> View PYQs
            </button>
            <div style={{ fontSize: '13px' }}>
              {['2024', '2023', '2022', '2021'].map(year => (
                <div key={year} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>GATE {year}</span>
                  <div>
                    <button style={{ fontSize: '11px', padding: '2px 6px', marginRight: '4px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white' }}>📥</button>
                    <button style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white' }}>✅</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Your Stats */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>🧑‍🎓 Your Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f7fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3182ce' }}>{mockTestMarks.length}</div>
                <div style={{ fontSize: '12px' }}>Total Tests</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f7fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38a169' }}>
                  {mockTestMarks.length > 0 ? Math.max(...mockTestMarks) : 0}
                </div>
                <div style={{ fontSize: '12px' }}>Highest Marks</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f7fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ed8936' }}>
                  {mockTestMarks.length > 0 ? Math.round(mockTestMarks.reduce((a, b) => a + b, 0) / mockTestMarks.length) : 0}
                </div>
                <div style={{ fontSize: '12px' }}>Avg. Score</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f7fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9f7aea' }}>{notes.length}</div>
                <div style={{ fontSize: '12px' }}>🧾 Notes Saved</div>
              </div>
            </div>
          </div>
          
          {/* Motivation Quote */}
          <div style={cardStyle}>
  <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>💬 Daily Motivation</h3>

  <p style={{
    fontStyle: 'italic',
    color: '#4a5568',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '12px',
    background: '#f7fafc',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  }}>
    "{currentQuote}"
  </p>

  <button
    onClick={fetchMotivationalQuote}
    style={{
      ...buttonStyle,
      fontSize: '13px',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '8px',
      background: '#667eea',
      color: 'white',
      border: 'none'
    }}
  >
    🔄 Refresh Quote
  </button>
</div>


          
          {/* Pinned Notes */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>📝 Pinned Notes</h3>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              {notes.length === 0 ? (
                <div style={{ color: '#718096', fontStyle: 'italic' }}>No notes yet. Add your first note!</div>
              ) : (
                notes.map((note, index) => (
                  <div key={index} style={{ background: '#f0f4ff', padding: '8px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e6f3ff' }}>
                    <div style={{ fontWeight: 'bold', color: '#2d3748', marginBottom: '4px' }}>{note.title}</div>
                    <div style={{ color: '#4a5568', fontSize: '12px' }}>{note.content}</div>
                  </div>
                ))
              )}
            </div>
            
            {showNoteForm ? (
              <div style={{ background: '#f7fafc', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginBottom: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}
                />
                <textarea
                  placeholder="Note content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginBottom: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleAddNote} 
                    style={{ ...buttonStyle, fontSize: '12px', flex: 1 }}
                  >
                    Save Note
                  </button>
                  <button 
                    onClick={() => {
                      setShowNoteForm(false);
                      setNewNote({ title: '', content: '' });
                    }} 
                    style={{ 
                      ...buttonStyle, 
                      fontSize: '12px', 
                      background: '#e2e8f0', 
                      color: '#2d3748',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowNoteForm(true)} 
                style={{...buttonStyle, fontSize: '12px', width: '100%'}}
              >
                <Plus size={14} style={{ marginRight: '4px' }} /> Add Note
              </button>
            )}
          </div>
          
         
<div style={{
  backgroundColor: '#f7fafc',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
  marginBottom: '24px',
  maxWidth: '600px',
  width: '100%',
}}>
  <h3 style={{
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    📝 Completed Topics
  </h3>

  <div style={{ display: 'flex', marginBottom: '16px' }}>
    <input
      type="text"
      value={newTopic}
      onChange={(e) => setNewTopic(e.target.value)}
      placeholder="Enter a new topic"
      style={{
        flex: 1,
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #CBD5E0',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: '#fff'
      }}
    />
    <button
      onClick={handleAddTopic}
      style={{
        marginLeft: '8px',
        padding: '10px 16px',
        backgroundColor: '#48BB78',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
    >
      ➕ Add
    </button>
  </div>

  <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
    {topicList
      .filter(t => t.trim() !== '')
      .map((topic, idx) => (
        <li key={idx} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '15px', color: '#2d3748' }}>{topic}</span>
          <button
            onClick={() => handleDeleteTopic(topic)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#F56565',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🗑️ Delete
          </button>
        </li>
      ))}
  </ul>
</div>
            
          
</div>

          
        </div>
     

     
      {showSyllabusModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowSyllabusModal(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
            <iframe
              src={syllabusPDF}
              width="800px"
              height="600px"
              style={{ border: 'none' }}
              title="Syllabus PDF"
            />
          </div>
        </div>
      )}

      {/* Mock Test Modal */}
      {showMockTestModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowMockTestModal(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ❌
            </button>
            <iframe
              src={mockTestPDF}
              width="800px"
              height="600px"
              style={{ border: 'none' }}
              title="Mock Test PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GateDashboard;