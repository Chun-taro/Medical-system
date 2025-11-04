const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.userId }).sort({ timestamp: -1 });
  res.json(notifications);
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.userId, read: false });
  res.json({ count });
};

exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Marked as read' });
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
};