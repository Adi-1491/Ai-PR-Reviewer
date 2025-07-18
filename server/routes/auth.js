require("dotenv").config();
const express = require("express");
const passport = require("passport");
const router = express.Router();

// GitHub Login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback After Login
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("https://ai-pr-reviewer-two.vercel.app");
  }
);

// Logout (with session destroy)
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout error" });

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("https://ai-pr-reviewer-two.vercel.app/login");
    });
  });
});

module.exports = router;