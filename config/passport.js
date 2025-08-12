const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, 
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Create new user with info from Google profile
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        password: "", // no password since OAuth
      });
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Serialize user (optional for session-based auth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user (optional for session-based auth)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
