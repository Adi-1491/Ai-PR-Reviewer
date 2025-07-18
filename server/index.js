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
const githubRoutes = require("./routes/github")

//  1. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

//  2. JSON body parser
app.use(express.json());

//  3. Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

//  4. Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.get("/auth/logout", (req,res) => {
    req.logout(err => {
        if(err) return res.status(500).json({message:"Logout error"});
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.redirect(`${process.env.CLIENT_URL}/login`);
        });
    });
});
  
// 5. THEN routes
app.use('/auth', authRoutes);     
app.use('/api', reviewRoute);
app.use('/api', historyRoute);
app.use('/github',githubRoutes);

app.listen(process.env.PORT, (error) => {
    if(!error)
    {
        console.log(`Server running on port ${process.env.PORT}`);
    }
    else{
        console.log('Error runnig the server',error);
    }
});

mongoose.connect(process.env.MONGODB_URI,{

})
.then(() => {
    console.log('Connected to DB History');
    
})
.catch((error) => {
    console.log('Error Connecting to History DB', error);
    
})

