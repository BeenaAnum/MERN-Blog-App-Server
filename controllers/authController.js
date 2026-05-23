const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc  Register new user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    profilePic: user.profilePic,
    token:      generateToken(user._id),
  });
});

// @desc  Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    profilePic: user.profilePic,
    token:      generateToken(user._id),
  });
});

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});
const changePassword = asyncHandler(async (req, res) => {
  // 1. Fetch the user explicitly including the password field
  const user = await User.findById(req.user._id).select('+password');

  // 2. Assign the plain text password to the document
  user.password = req.body.newPassword;

  // 3. Save the document (.save() safely triggers your pre-save bcrypt hook!)
  await user.save();

  res.status(200).json({ message: 'Password updated successfully!' });
});
module.exports = { register, login, getMe, changePassword };
