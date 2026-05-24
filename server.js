const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {
  errorHandler,
  notFound,
} = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

// ─── 🛠️ PASSWORD & ROLE FORCER SCRIPT ───────────────────────

const RESET_EMAIL = "beenaanam@gmail.com";
const NEW_PASSWORD = "beena123";

mongoose.connection.once('open', async () => {
  try {

    const User =
      mongoose.connection.model('User') ||
      mongoose.connection.model(
        'User',
        new mongoose.Schema({})
      );

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      NEW_PASSWORD,
      salt
    );

    // Update password + role
    const updatedUser = await User.findOneAndUpdate(
      {
        email: RESET_EMAIL
          .toLowerCase()
          .trim(),
      },

      {
        $set: {
          password: hashedPassword,
          role: 'admin',
        },
      },

      { new: true }
    );

    if (updatedUser) {

      console.log(`
======================================================
✅ [SUCCESS] DATABASE ACCOUNT ELEVATED
👤 User: ${RESET_EMAIL}
🛡️ Role Status: ${updatedUser.role.toUpperCase()}
🔑 Password Set To: ${NEW_PASSWORD}
======================================================
`);

    } else {

      console.log(`
============ ⚠️ USER NOT FOUND IN DATABASE ============
Could not find a user account with email:
"${RESET_EMAIL}"

Register first using this email.
========================================================
`);

    }

  } catch (err) {

    console.error(
      '❌ Database script error:',
      err.message
    );

  }
});

// ───────────────────────────────────────────────────────

const app = express();

// ─── CORS FIX ──────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:5173',

  'https://mern-blog-app-client-git-main-beena-anums-projects.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost + production frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      return callback(
        new Error('CORS Not Allowed')
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// ─── BODY PARSER ───────────────────────────────────────

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ─── ROUTES ────────────────────────────────────────────

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

app.use(
  '/api/posts',
  require('./routes/postRoutes')
);

app.use(
  '/api/users',
  require('./routes/userRoutes')
);

app.use(
  '/api/comments',
  require('./routes/commentRoutes')
);

// ─── ROOT ROUTE ────────────────────────────────────────

app.get('/', (req, res) => {

  res.json({
    message:
      '🚀 MERN Blog API is running!',
  });

});

// ─── ERROR HANDLING ────────────────────────────────────

app.use(notFound);

app.use(errorHandler);

app.use((err, req, res, next) => {

  const statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  res.status(statusCode).json({
    message: err.message,

    stack:
      process.env.NODE_ENV === 'production'
        ? null
        : err.stack,
  });

});

// ─── SERVER ────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});

module.exports = app;
