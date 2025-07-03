const express = require('express');
const router = express.Router();

const {
  registerUser,
  googleLoginUser,
  logoutUser,
  loginUser,
  userdetails,
  mockscore,
  getmockscore,
  addTask,
  getTasks,
  deleteTask,
  addNote,
  getNotes,
  deleteNote,
  topicstracker,
  getTopics
} = require('../controllers/user.controller');

const {verifyToken} = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/login', loginUser);
// Protected route to log out the user
router.get("/logout", verifyToken, logoutUser);
// Protected route to get user details
router.get('/userdetails', verifyToken, userdetails);
// Protected route to get mock score
router.post('/mockscore', verifyToken, mockscore);
router.get('/getmarks', verifyToken, getmockscore);
router.post('/add-task', verifyToken, addTask);
router.get('/tasks', verifyToken, getTasks);
router.post("/add-note", verifyToken, addNote);
router.get("/get-notes", verifyToken, getNotes);
router.post("/delete-task", verifyToken, deleteTask);
router.post('/delete-note', verifyToken, deleteNote);


router.post("/update-syllabus-progress", verifyToken, topicstracker);
router.get("/get-syllabus-progress", verifyToken, getTopics);
router.post("/auth/google", googleLoginUser);




module.exports = router;
