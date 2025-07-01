const express = require('express');
const router = express.Router();
const {registerUser, login} = require('../controllers/user.controller');


router.post('/register', registerUser);
router.post('/login', login);
router.post("/logout", verifyToken, logoutUser);


module.exports = router;
