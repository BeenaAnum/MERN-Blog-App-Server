const express = require('express');
const router  = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:postId',    getComments);
router.post('/:postId',   protect, addComment);
router.delete('/:id',     protect, deleteComment);

module.exports = router;
