const Notification = require('../models/Notification');

// 📌 Get notifications
const getNotifications = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter.recipientType = 'admin';
    } else {
      filter = { userId: req.user.userId, recipientType: 'patient' };
    }

    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error('❌ Get notifications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// 📌 Get unread count
const getUnreadCount = async (req, res) => {
  try {
    let filter = { read: false };
    if (req.user.role === 'admin') {
      filter.recipientType = 'admin';
    } else {
      filter = { ...filter, userId: req.user.userId, recipientType: 'patient' };
    }

    const count = await Notification.countDocuments(filter);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('❌ Get unread count error:', err.message);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// 📌 Mark one as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    // Only admin or the owner can mark as read
    if (req.user.role !== 'admin' && String(notification.userId) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('❌ Mark as read error:', err.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// 📌 Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter.recipientType = 'admin';
    } else {
      filter = { userId: req.user.userId, recipientType: 'patient' };
    }

    await Notification.updateMany(filter, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('❌ Mark all as read error:', err.message);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};