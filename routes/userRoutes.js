const express = require('express');
const router  = express.Router();
const { getMyProfile, getUserProfile, updateProfile, deleteProfilePicture, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../config/cloudinary');

router.get('/profile',            protect, getMyProfile);
router.put('/profile',            protect, uploadProfileImage.single('profilePic'), updateProfile);
router.delete('/profile/picture', protect, deleteProfilePicture);
router.get('/',                protect, adminOnly, getAllUsers);
router.delete('/:id',          protect, adminOnly, deleteUser);
router.get('/:id',             getUserProfile);

module.exports = router;
