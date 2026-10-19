const jwt = require("jsonwebtoken");
const User = require("../models/user.Model");

const verifyToken = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Access token not found." });
        }
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found." });
        }

        let decodedAccessToken;
        try {
            decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            // Expired or tampered token: ask the client to log in again
            return res.status(401).json({ message: "Invalid or expired access token." });
        }

        const user = await User.findById(decodedAccessToken.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }
        req.user = user;

        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({ message: "Authentication failed." });
    }
};

module.exports = { verifyToken };
