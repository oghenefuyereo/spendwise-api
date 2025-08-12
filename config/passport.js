const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, 
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Try to find user by googleId
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Try to find by email (link accounts if needed)
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link existing user account with googleId
        user.googleId = profile.id;
        user.password = undefined; // Remove password since OAuth user won't have password
        await user.save();
      } else {
        // Create new user with info from Google profile
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          password: undefined, // no password since OAuth
        });
        await user.save();
      }
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
