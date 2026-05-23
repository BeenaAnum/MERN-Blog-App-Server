const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post    = require('../models/Post');

// @desc  Get comments for a post
// @route GET /api/comments/:postId
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('user', 'name profilePic')
    .sort({ createdAt: -1 });
  res.json(comments);
});

// @desc  Add comment
// @route POST /api/comments/:postId
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) { res.status(400); throw new Error('Comment text is required'); }

  const post = await Post.findById(req.params.postId);
  if (!post) { res.status(404); throw new Error('Post not found'); }

  const comment = await Comment.create({ post: req.params.postId, user: req.user._id, text });
  await comment.populate('user', 'name profilePic');
  res.status(201).json(comment);
});

// @desc  Delete comment
// @route DELETE /api/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

module.exports = { getComments, addComment, deleteComment };
