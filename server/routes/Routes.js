const express = require('express');
const router = express.Router();
const { registerUser, logoutUser, loginUser, userdetails, mockscore } = require('../controllers/user.controller');
const {verifyToken} = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/login', loginUser);
// Protected route to log out the user
router.get("/logout", verifyToken, logoutUser);
// Protected route to get user details
router.get('/userdetails', verifyToken, userdetails);
// Protected route to get mock score
router.post('/mockscore', verifyToken, mockscore);


module.exports = router;
