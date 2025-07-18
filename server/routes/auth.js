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
    res.redirect(process.env.CLIENT_URL || "http://localhost:3000"); // redirect back to FE
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
