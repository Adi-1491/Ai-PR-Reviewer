require('dotenv').config();
require('./auth/github');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const reviewRoute = require('./routes/reviewRoute');
const historyRoute = require('./routes/historyRoute');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");

// ✅ ADD THIS AUTH MIDDLEWARE
const ensureAuthenticated = (req, res, next) => {
  console.log('🔐 Auth check:', { 
    isAuth: req.isAuthenticated(), 
    hasUser: !!req.user,
    username: req.user?.username 
  });

  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required. Please log in." });
};

// 1. CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// 2. JSON body parser
app.use(express.json());
app.set("trust proxy", 1);

// 3. Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      sameSite: "lax", 
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// 4. Passport
app.use(passport.initialize());
app.use(passport.session());

// Test endpoint
app.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout endpoint
app.get("/auth/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout error" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(`${process.env.CLIENT_URL}/login`);  // ✅ Fixed syntax
    });
  });
});

// 5. Routes
app.use('/auth', authRoutes);     
app.use('/api', reviewRoute);
app.use('/api', historyRoute);
app.use('/github', ensureAuthenticated, githubRoutes);  // ✅ Added auth middleware

// Server
app.listen(process.env.PORT, (error) => {
  if (!error) {
    console.log(`Server running on port ${process.env.PORT}`);  // ✅ Fixed syntax
  } else {
    console.log('Error running the server', error);
  }
});

// Database
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log('Connected to DB History');
  })
  .catch((error) => {
    console.log('Error Connecting to History DB', error);
  });