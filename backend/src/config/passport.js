import dotenv from "dotenv";
dotenv.config();
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import User from '../models/User.js';
console.log('FACEBOOK_APP_ID:', process.env.FACEBOOK_APP_ID);
passport.use(new FacebookStrategy.Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          password: '',
          provider: 'facebook',
          role: 'customer',
          active: true,
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));