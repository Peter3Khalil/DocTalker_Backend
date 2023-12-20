const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
const User = require('../models/user');

// SHKIB WILL TELL US

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/redirect'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if a user with the same Google ID already exists in your database
          let user = await User.findOne({ googleId: profile.id });
  
          if (user) {
            // User already exists, return the user
            return done(null, user);
          } else {
            // User doesn't exist, create a new user using Google profile information
            user = new User({
              googleId: profile.id,
              Fname: profile.given_name,
              Lname: profile.family_name,
              email: profile.email,
              // You can set other default values here as needed
            });
  
            await user.save();
            return done(null, user);
          }
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
