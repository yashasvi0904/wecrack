const express = require('express');
const router = express.Router();
const { registerUser, logoutUser, loginUser, userdetails } = require('../controllers/user.controller');
const {verifyToken} = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get('/userdetails', verifyToken, userdetails);


module.exports = router;
