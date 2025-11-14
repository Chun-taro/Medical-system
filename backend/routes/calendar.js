const express = require('express');
const { auth } = require('../middleware/auth');
const { getEvents, createEvent } = require('../controllers/calendarController');

const router = express.Router();

// GET upcoming events
router.get('/events', auth, getEvents);

// POST create new event
router.post('/events', auth, createEvent);

module.exports = router;