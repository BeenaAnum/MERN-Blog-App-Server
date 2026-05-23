// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const multerStorageCloudinary = require('multer-storage-cloudinary');

// // Safe version checking (handles v2 vs v3 import differences automatically)
// const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage 
//   ? multerStorageCloudinary.CloudinaryStorage 
//   : multerStorageCloudinary;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Storage for blog cover images
// const postStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'mern-blog/posts',
//     allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 1200, height: 630, crop: 'fill' }],
//   },
// });

// // Storage for user profile pictures
// const profileStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'mern-blog/profiles',
//     allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
//   },
// });

// const uploadPostImage   = multer({ storage: postStorage });
// const uploadProfileImage = multer({ storage: profileStorage });

// module.exports = { cloudinary, uploadPostImage, uploadProfileImage };
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Storage for blog cover images
// const postStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // Extract file extension to make sure it's valid
//     const fileExt = file.mimetype.split('/')[1];
//     const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
    
//     return {
//       folder: 'mern-blog/posts',
//       format: validFormats.includes(fileExt) ? fileExt : 'jpg', // Fallback to jpg if unsure
//       transformation: [{ width: 1200, height: 630, crop: 'fill' }],
//     };
//   },
// });

// // Storage for user profile pictures
// const profileStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     const fileExt = file.mimetype.split('/')[1];
//     const validFormats = ['jpg', 'jpeg', 'png', 'webp'];

//     return {
//       folder: 'mern-blog/profiles',
//       format: validFormats.includes(fileExt) ? fileExt : 'jpg',
//       transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
//     };
//   },
// });

// const uploadPostImage   = multer({ storage: postStorage });
// const uploadProfileImage = multer({ storage: profileStorage }); // Wait, check your original code line here!

// module.exports = { cloudinary, uploadPostImage, uploadProfileImage };
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-blog/posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mern-blog/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const uploadPostImage = multer({
  storage: postStorage,
});

const uploadProfileImage = multer({
  storage: profileStorage,
});

module.exports = {
  cloudinary,
  uploadPostImage,
  uploadProfileImage,
};