const express = require('express');
const router = express.Router();
const { registerUser, logoutUser, loginUser } = require('../controllers/user.controller');
const {verifyToken} = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", verifyToken, logoutUser);


module.exports = router;
