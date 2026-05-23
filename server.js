const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');    
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

// ─── 🛠️ FIXED: SAFE PASSWORD & ROLE FORCER SCRIPT ───────────────────────
const RESET_EMAIL = "beenaanam@gmail.com"; 
const NEW_PASSWORD = "beena123";          

mongoose.connection.once('open', async () => {
  try {
    // Vercel crash se bachne ke liye check karein ke model pehle se bana hai ya nahi
    let User;
    if (mongoose.models.User) {
      User = mongoose.models.User;
    } else {
      // Agar model pehle load nahi hua to crash hone ke bajaye skip karein
      return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    const updatedUser = await User.findOneAndUpdate(
      { email: RESET_EMAIL.toLowerCase().trim() },
      { 
        $set: {
          password: hashedPassword,
          role: 'admin' 
        }
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`✅ [SUCCESS] DATABASE ACCOUNT ELEVATED: ${RESET_EMAIL}`);
    }
  } catch (err) {
    console.error("❌ Database script error:", err.message);
  }
});
// ─────────────────────────────────────────────────────────────

const app = express();

// ─── Middleware ───────────────────────────────────────────
const frontendURL = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL || 'https://mern-blog-app-client-o1cypgric-beena-anums-projects.vercel.app'
  : 'http://localhost:5173';

app.use(cors({
  origin: frontendURL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/posts',    require('./routes/postRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Main Route taake direct URL kholne par 404 na aaye
app.get('/', (req, res) => {
  res.json({ message: '🚀 MERN Blog API is running perfectly on Vercel!' });
});

// ─── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
