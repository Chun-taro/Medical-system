const express = require('express');
const { auth } = require('../middleware/auth');
const { getEvents, createEvent } = require('../controllers/calendarController');

const router = express.Router();

// GET /api/calendar/events → View upcoming events
router.get('/events', auth, getEvents);

// POST /api/calendar/events → Manually create an event
router.post('/events', auth, createEvent);

module.exports = router;