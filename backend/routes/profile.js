const express = require('express');
const multer = require('multer');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadAvatar
} = require('../controllers/profileController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;