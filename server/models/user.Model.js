const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true , required: function () {
        return !this.isGoogleUser;
  },
  },
  refreshToken:{type: String},
  isGoogleUser: { type: Boolean, default: false },
  tasks: [
  {
    subject: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }
  ],
mockscore: [{ type: Number }],
   notes: [
  {
    title: String,
    content: String
  }
],
syllabus: [
  {
    subject: String,
    topic: String,
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' }
  }
],
activityLog: [String]


  
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
}
);
userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

// 🔑 Generate Access Token
userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE }
  );
};

// 🔑 Generate Refresh Token
userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE }
  );
};



module.exports = mongoose.models.User || mongoose.model('User', userSchema);
