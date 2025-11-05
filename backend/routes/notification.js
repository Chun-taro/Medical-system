const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Fetch notifications (admin or patient depending on role)
router.get('/', auth, getNotifications);

// Get unread count
router.get('/unread', auth, getUnreadCount);

// Mark one notification as read
router.put('/:id/read', auth, markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, markAllAsRead);

module.exports = router;