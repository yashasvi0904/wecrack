const User = require("../models/user.Model");


const registerUser = async(req,res) => {
    try {
        console.log("Received registration request with body:", req.body);
        const { name , email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            console.log("User already exists with email:", email);
            return res.status(400).json({ message: "User already exists" });
        }
        if (user === undefined) {
            console.log("User.findOne did not throw but returned undefined for email:", email);
        }

        const newUser = new User({ name ,email, password });
        console.log("New user object created:", newUser);

        await newUser.save();
        console.log("New user saved successfully.");

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }
    const accessToken = user.getAccessToken({ role: user.role });
    const refreshToken = user.getRefreshToken();
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    user.refreshToken = refreshToken;
    await user.save();
      


    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({ message: "Login successful.", role: user.role, id : user._id });
  }catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed." });
  }

};
const logoutUser = async(req,res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token not found" });
        const user = await User.findOne({ refreshToken });
        if (!user)
            return res.status(400).json({ message: "User not found" });
        user.refreshToken = "";
        await user.save();
        
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const userdetails = async(req,res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(user);
        return res.status(200).json({user});
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const mockscore = async (req, res) => {
  try {
    const user = req.user;
    const { correct, total } = req.body;

    user.mockscore.push({
      correct,
      total,
      date: new Date()
    });

    await user.save();
    res.status(200).json({ message: 'Mock score saved', mockscore: user.mockscore });
  } catch (err) {
    console.error('Error saving mock score:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
    };
const getmockscore = async (req, res) => {
   try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedScores = user.mockscore.map(score => {
      const percentage = score.total ? Math.round((score.correct / score.total) * 100) : 0;
      return {
        correct: score.correct,
        total: score.total,
        percentage,
        date: new Date(score.date).toLocaleDateString() // e.g., "7/7/2024"
      };
    });

    res.status(200).json(formattedScores);
  } catch (error) {
    console.error("Error fetching mock scores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const addTask = async (req, res) => {
  try {
    const user = req.user; // You already set this in verifyToken

    const { subject, title } = req.body;
    const newTask = {
      subject,
      title,
      completed: false
    };

    user.tasks.push(newTask);
    await user.save();

    res.status(201).json({ message: "Task added successfully", tasks: user.tasks });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ message: "Failed to add task" });
  }
};

const getTasks = async (req, res) => {
  try {
    const user = req.user; // From verifyToken
    res.status(200).json(user.tasks);
  } catch (err) {
    console.error("Error getting tasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
const deleteTask = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.body;

    const originalLength = user.tasks.length;
    user.tasks = user.tasks.filter(task => task._id.toString() !== taskId);

    if (user.tasks.length === originalLength) {
      return res.status(404).json({ message: "Task not found" });
    }

    await user.save();
    res.status(200).json({ message: "Task deleted", tasks: user.tasks });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
const deleteNote = async (req, res) => {
  try {
    const user = req.user;
    const { noteId } = req.body;

    const index = user.notes.findIndex(note => note._id.toString() === noteId);
    if (index === -1) {
      return res.status(404).json({ message: "Note not found" });
    }

    user.notes.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Note deleted", notes: user.notes });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ message: "Failed to delete note" });
  }
};

const addNote = async (req, res) => {
  try {
    const user = req.user;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    user.notes.push({ title, content });
    await user.save();

    res.status(201).json({ message: "Note added", notes: user.notes });
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateSyllabusTopic = async (req, res) => {
  try {
    const user = req.user;
    const { subject, topic, status } = req.body;

    const index = user.syllabus.findIndex(
      t => t.subject === subject && t.topic === topic
    );

    if (index !== -1) {
      user.syllabus[index].status = status;
    } else {
      user.syllabus.push({ subject, topic, status });
    }

    await user.save();
    res.status(200).json({ message: 'Topic updated', syllabus: user.syllabus });
  } catch (err) {
    console.error('Error updating syllabus:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Subjects Completed
    const totalTopics = user.syllabus?.length || 0;
    const completedTopics = user.syllabus?.filter(t => t.status === "Completed").length || 0;
    const subjectsCompleted = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Practice Accuracy
    const scores = user.mockscore || [];
    const totalCorrect = scores.reduce((sum, s) => sum + s.correct, 0);
    const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
    const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Best Streak
    const dates = (user.activityLog || []).map(d => new Date(d)).sort((a, b) => a - b);
    let bestStreak = 0, currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i] - dates[i - 1]) / (1000 * 3600 * 24);
      if (diff === 1) currentStreak++;
      else currentStreak = 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    // Consistency (last 30 days)
    const last30 = new Set();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last30.add(d.toISOString().slice(0, 10));
    }

    const activeDays = (user.activityLog || []).filter(date => last30.has(date)).length;
    const consistency = Math.round((activeDays / 30) * 100);

    res.status(200).json({
      subjectsCompleted,
      accuracy,
      bestStreak,
      consistency
    });
  } catch (err) {
    console.error("Error in analytics:", err);
    res.status(500).json({ message: "Failed to calculate analytics" });
  }
};






module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    userdetails,
    mockscore,
    getmockscore,
    addTask,
    getTasks,
    addNote,
    getNotes,
    deleteTask,
    deleteNote,
    updateSyllabusTopic,
    getAnalytics
  

}
