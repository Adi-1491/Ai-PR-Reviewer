require("dotenv").config();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser((user,done) => {  //user logs in passport stores information in session
    done(null,user);
});

passport.deserializeUser((user,done) => { // fetches the user info
    done(null,user); 
});

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.CLIENT_URL}/auth/github/callback`,
            
        },
        async (accessToken, refreshToken, profile, done) => {
            //storing access token in user session
            const user = {
                id: profile.id,
                username: profile.username,
                avatar: profile.photos[0].value,
                accessToken,
            };
            return done(null, user);
        }
    )
    
);
