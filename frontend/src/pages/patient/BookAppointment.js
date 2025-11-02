import { useState } from 'react';
import axios from 'axios';
import PatientLayout from './PatientLayout';
import './book-appointment.css';

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  appointmentDate: '',
  purpose: ''
};

export default function BookAppointment() {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.appointmentDate || !form.purpose) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString()
      };

      await axios.post('http://localhost:5000/api/appointments/book', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Appointment scheduled successfully');
      setForm(initialFormState);
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientLayout>
      <div className="doctor-form-container">
        <h2>Doctor Appointment Request Form</h2>
        <p>Please fill in the form below to schedule an appointment.</p>
        <form onSubmit={handleSubmit} className="doctor-form">
          <input type="text" name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required aria-label="First name" />
          <input type="text" name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required aria-label="Last name" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required aria-label="Email address" />
          <input type="tel" name="phone" placeholder="Your phone" value={form.phone} onChange={handleChange} required aria-label="Phone number" />
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} aria-label="Address" />
          <input type="date" name="appointmentDate" placeholder="Pick the date" value={form.appointmentDate} onChange={handleChange} required aria-label="Appointment date" />
          <textarea name="purpose" placeholder="Purpose of visit" value={form.purpose} onChange={handleChange} rows={4} required aria-label="Purpose of visit" />
          <button type="submit" className="schedule-button" disabled={loading}>
            {loading ? 'Scheduling...' : 'SCHEDULE'}
          </button>
        </form>
      </div>
    </PatientLayout>
  );
}
