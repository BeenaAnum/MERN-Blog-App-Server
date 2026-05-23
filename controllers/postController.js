const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get all posts (with search, category filter, pagination)
// @route GET /api/posts
const getPosts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 9 } = req.query;
  const query = { isPublished: true };

  if (search) {
    query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;

  const total = await Post.countDocuments(query);
  const posts = await Post.find(query)
    .populate('author', 'name profilePic')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc  Get single post by ID
// @route GET /api/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name profilePic bio');

  if (!post) { res.status(404); throw new Error('Post not found'); }

  post.views += 1;
  await post.save();

  res.json(post);
});

// @desc  Create post
// @route POST /api/posts
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const postData = {
    title, content, category,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    author: req.user._id,
  };

  if (req.file) {
    postData.coverImage  = req.file.path;
    postData.cloudinaryId = req.file.filename;
  }

  const post = await Post.create(postData);
  await post.populate('author', 'name profilePic');
  res.status(201).json(post);
});

// @desc  Update post
// @route PUT /api/posts/:id
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) { res.status(404); throw new Error('Post not found'); }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this post');
  }

  const { title, content, category, tags } = req.body;
  post.title    = title    || post.title;
  post.content  = content  || post.content;
  post.category = category || post.category;
  if (tags) post.tags = tags.split(',').map(t => t.trim());

  if (req.file) {
    if (post.cloudinaryId) await cloudinary.uploader.destroy(post.cloudinaryId);
    post.coverImage   = req.file.path;
    post.cloudinaryId = req.file.filename;
  }

  const updated = await post.save();
  await updated.populate('author', 'name profilePic');
  res.json(updated);
});

// @desc  Delete post
// @route DELETE /api/posts/:id
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) { res.status(404); throw new Error('Post not found'); }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  if (post.cloudinaryId) await cloudinary.uploader.destroy(post.cloudinaryId);
  await post.deleteOne();
  res.json({ message: 'Post deleted successfully' });
});

// @desc  Toggle like on post
// @route PUT /api/posts/:id/like
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) { res.status(404); throw new Error('Post not found'); }

  const idx = post.likes.indexOf(req.user._id);
  if (idx === -1) {
    post.likes.push(req.user._id);
  } else {
    post.likes.splice(idx, 1);
  }
  await post.save();
  res.json({ likes: post.likes.length, liked: idx === -1 });
});

// @desc  Get posts by logged-in user
// @route GET /api/posts/my
const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
  res.json(posts);
});

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, toggleLike, getMyPosts };