const express = require('express');
const {
  bookAppointment,
  getPatientAppointments,
  getAllAppointments,
  deleteAppointment,
  approveAppointment,
  getMyAppointments,
  startConsultation,
  completeConsultation,
  generateReports,
  getConsultations,
  getConsultationById
} = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/book', auth, bookAppointment);
router.get('/patient/:patientId', auth, getPatientAppointments);
router.get('/', auth, getAllAppointments);
router.delete('/:id', auth, deleteAppointment);
router.patch('/:id/approve', auth, approveAppointment);
router.get('/my', auth, getMyAppointments);
router.patch('/:id/start', auth, startConsultation);
router.patch('/:id/complete', auth, completeConsultation);
router.get('/reports', auth, generateReports);
router.get('/consultations', auth, getConsultations);
router.get('/consultations/:id', auth, getConsultationById);

module.exports = router;