const User = require("../models/user.Model");


const registerUser = async(req,res) => {
    try {
        const { Email, Password } = req.body;
        const user = await User.findOne({ Email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser = new User({ Email, Password });
        await newUser.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
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
    user.refreshToken = refreshToken;
    await user.save();
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({ message: "Login successful.", role: user.role, id : user._id });
  }catch (error) {
    console.error(error);
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
        return res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,

}