import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, BookOpen, TrendingUp, FileText, Target, Heart, Settings, CheckCircle, Circle } from 'lucide-react';

const GateDashboard = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      subject: "DSA",
      title: "Complete Graph Algorithms",
      completed: false
    }
  ]);
const [user1 , setUser] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ subject: 'DSA', title: '', time: '' });
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusPDF, setSyllabusPDF] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [mockTestPDF, setMockTestPDF] = useState('');
  const [showMockTestModal, setShowMockTestModal] = useState(false);
  const [mockTestMarks, setMockTestMarks] = useState([]);
  
  
  
  const quotes = [
    "Push yourself, because no one else is going to do it for you.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The expert in anything was once a beginner."
  ];
  
  const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
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
        setUser(response.data.user.name||'');
    }
    catch (error) {
        console.error("Error fetching user details:", error);
    }
}
  useEffect(() => {
    userdetails();
    handleMarks();
    fetchTasks();
    
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
      withCredentials: true // if you're using cookies/auth
    });
    alert(response.data.message || 'Task added successfully');
    setTasks(prev => [...(prev || []), { ...newTaskItem, id: Date.now() }]); // optimistic UI
  } catch (err) {
    console.error("Error adding task:", err);
    alert("Failed to add task.");
  }
};
const toggleTask = async (taskId) => {
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  setTasks(updatedTasks);

  const toggledTask = updatedTasks.find(task => task.id === taskId);
  try {
    await axios.post('http://localhost:2000/update-task', toggledTask, {
      withCredentials: true
    });
  } catch (err) {
    console.error("Error updating task:", err);
    alert("Failed to update task status.");
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
  
  
const cardStyle = { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '16px' };
const buttonStyle = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
  
  // Toggle the completed status of a task and update backend
  

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Welcome Header */}
        <div style={cardStyle}>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: '#2d3748' }}>👋 Welcome back,{user1}!</h1>
          <p style={{ color: '#718096', margin: 0 }}>Let's crack GATE with focus and consistency!</p>
        </div>
        
        {/* Smart Planner */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', margin: '0 0 16px 0', color: '#2d3748' }}>🧠 Your Smart Planner</h2>
          {tasks.map(task => (
            <div
              key={task.id}
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
                onClick={() => toggleTask(task.id)}
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
              onChange={(e) => setBranch(e.target.value)}
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
          
          {/* Your Stats   => To be linked to the mock test the user has given and all  */}
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
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9f7aea' }}>21</div>
                <div style={{ fontSize: '12px' }}>🧾 Notes Saved</div>
              </div>
            </div>
          </div>
          
          {/* Motivation Quote */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>💬 Daily Motivation</h3>
            <p style={{ fontStyle: 'italic', margin: '0 0 12px 0', color: '#4a5568' }}>"{currentQuote}"</p>
            <button style={{...buttonStyle, fontSize: '12px'}}>
              <Heart size={14} style={{ marginRight: '4px' }} /> Save Quote
            </button>
          </div>
          
          {/* Pinned Notes */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>📌 Pinned Notes</h3>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <div style={{ background: '#fff5f5', padding: '6px', borderRadius: '4px', marginBottom: '4px' }}>
                📝 Time Complexity: O(log n) for Binary Search
              </div>
              <div style={{ background: '#f0fff4', padding: '6px', borderRadius: '4px', marginBottom: '4px' }}>
                🔄 Deadlock: Mutual Exclusion + Hold & Wait + No Preemption + Circular Wait
              </div>
            </div>
            <button style={{...buttonStyle, fontSize: '12px'}}>
              <Plus size={14} style={{ marginRight: '4px' }} /> Add Note
            </button>
          </div>
          
          {/* User Preferences */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#2d3748' }}>⚙️ Preferences</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ marginBottom: '8px' }}>
                <label>🌐 GATE Branch: </label>
                {/* TODO: Save selected branch to DB when user chooses one */}
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)} // TODO: Save this to DB
                  style={{ padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                >
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label>📆 Daily Study Hours: </label>
                <select style={{ padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <option>4-6 hours</option>
                  <option>6-8 hours</option>
                  <option>8+ hours</option>
                </select>
              </div>
              <div>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  🎵 Enable study music
                </label>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      {/* Syllabus Modal */}
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
              onClick={() => {
                setShowMockTestModal(false);
                
              }}
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
