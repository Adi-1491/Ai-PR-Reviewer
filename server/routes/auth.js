require("dotenv").config();
const express = require("express");
const passport = require("passport");
const router = express.Router();

// GitHub Login - ✅ Added repo scope to access PRs
router.get(
  "/github", 
  passport.authenticate("github", { 
    scope: ["user:email", "repo"]  // ✅ Added "repo" to access PR data
  })
);

// Callback After Login
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    console.log('✅ Login successful:', req.user?.username);
    res.redirect("http://localhost:3000");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout error" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("http://localhost:3000/login");
    });
  });
});

module.exports = router;