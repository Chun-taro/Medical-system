const Notification = require('../models/Notification');

const sendNotification = async ({ userId, type = 'appointment', status, message, recipientType }) => {
  try {
    await Notification.create({
      userId,
      type,
      status,
      message,
      recipientType, // 'admin' or 'patient'
      timestamp: new Date(),
      read: false
    });
  } catch (err) {
    console.error('❌ Notification error:', err.message);
  }
};

module.exports = { sendNotification };