const express = require('express');
const router = express.Router();

const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getMyPosts,
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');

const { uploadPostImage } = require('../config/cloudinary');

// Routes
router.get('/', getPosts);

router.get('/my', protect, getMyPosts);

router.post(
  '/',
  protect,
  uploadPostImage.single('coverImage'),
  createPost
);

router.get('/:id', getPostById);

router.put(
  '/:id',
  protect,
  uploadPostImage.single('coverImage'),
  updatePost
);

router.put('/:id/like', protect, toggleLike);

router.delete('/:id', protect, deletePost);

module.exports = router;