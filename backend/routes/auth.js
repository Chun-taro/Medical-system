const express = require('express');
const passport = require('passport');
const {
  signup,
  login,
  validateToken,
  googleSignup
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ✅ Local auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google-signup', googleSignup);
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  res.json({ message: 'If your email is registered, a reset link has been sent.' });
});

// ✅ Google OAuth initiation
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);

    if (user?.isNewUser) {
      const { googleId, email, firstName, lastName } = user;
      return res.redirect(
        `http://localhost:3000/google-signup?googleId=${googleId}&email=${email}&firstName=${firstName}&lastName=${lastName}`
      );
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const token = 'mock-session-or-jwt'; // Replace with real token if using JWT
      const role = user.role;
      const userId = user._id;
      const googleId = user.googleId;

      return res.redirect(
        `http://localhost:3000/oauth-success?token=${token}&role=${role}&userId=${userId}&googleId=${googleId}`
      );
    });
  })(req, res, next);
});

// ✅ Token validation route
router.get('/validate', auth, validateToken);

module.exports = router;