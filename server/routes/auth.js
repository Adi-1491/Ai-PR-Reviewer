const express = require("express");
const passport = require("passport");
const router = express.Router();

//Github Login
router.get("/github", passport.authenticate("github", {scope:["user:email"]}));

//CallBack After Login
router.get("/github/callback",
    passport.authenticate("github",{failureRedirect:"/"}),
    (req,res)=>{
        res.redirect("http://localhost:3000"); //redirect back to FE
    }
);

//logout
router.get("/logout",(req,res)=>{
    req.logOut(()=>{
        res.redirect("/");
    });
});

module.exports = router;