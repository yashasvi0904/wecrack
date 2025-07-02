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
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const marks = req.body.marks;

        if (!Array.isArray(user.mockscore)) {
            user.mockscore = []; // initialize if not an array
        }

        user.mockscore.push(marks); // append new score
        await user.save();

        return res.status(200).json("Marks updated successfully");
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
const getmockscore = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user.mockscore);
        
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ message: "Internal server error" });
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


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    userdetails,
    mockscore,
    getmockscore,
    addTask,
    getTasks

}
