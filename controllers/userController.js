const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get logged-in user's own profile + their posts
// @route GET /api/users/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  const posts = await Post.find({ author: req.user._id, isPublished: true }).sort({ createdAt: -1 });
  res.json({ user, posts });
});

// @desc  Get user public profile + their posts
// @route GET /api/users/:id
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  const posts = await Post.find({ author: req.params.id, isPublished: true }).sort({ createdAt: -1 });
  res.json({ user, posts });
});

// @desc  Update current user's profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Use hasOwnProperty so empty string ('') clears the field instead of keeping old value
  if (req.body.name !== undefined) user.name = req.body.name || user.name; // name can't be blank
  if (req.body.bio  !== undefined) user.bio  = req.body.bio;               // bio CAN be cleared

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = req.body.password;
  }

  if (req.file) {
    if (user.cloudinaryId) await cloudinary.uploader.destroy(user.cloudinaryId);
    user.profilePic   = req.file.path;
    user.cloudinaryId = req.file.filename;
  }

  const updated = await user.save();
  res.json({
    _id:        updated._id,
    name:       updated.name,
    email:      updated.email,
    bio:        updated.bio,
    role:       updated.role,
    profilePic: updated.profilePic,
    cloudinaryId: updated.cloudinaryId,
  });
});

// @desc  Delete profile picture
// @route DELETE /api/users/profile/picture
const deleteProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.cloudinaryId) {
    await cloudinary.uploader.destroy(user.cloudinaryId);
    user.profilePic   = '';
    user.cloudinaryId = '';
    await user.save();
  }
  res.json({ message: 'Profile picture removed', profilePic: '' });
});

// ─── Admin Controllers ──────────────────────────────────────

// @desc  Get all users (admin)
// @route GET /api/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc  Delete user (admin)
// @route DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.cloudinaryId) await cloudinary.uploader.destroy(user.cloudinaryId);
  await Post.deleteMany({ author: user._id });
  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
});

module.exports = { getMyProfile, getUserProfile, updateProfile, deleteProfilePicture, getAllUsers, deleteUser };
