import './Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Recaptcha from '../components/Recaptcha';
import MedicalLogo from './assets/MedicalLogo.png';
import { usePatient } from '../context/PatientContext'; // ✅ import context

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const navigate = useNavigate();
  const { setPatient } = usePatient(); // ✅ use context

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleLogin = async () => {
    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA verification.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        ...form,
        recaptchaToken
      });

      const { token, userId, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);

      // ✅ Fetch profile and update context
      const profileRes = await axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.status === 200) {
        setPatient(profileRes.data); // ✅ sync context
      }

      navigate(role === 'admin' ? '/admin-dashboard' : '/patient-dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left side image */}
      <div className="auth-left">
        <img
          src="https://buksu.edu.ph/wp-content/uploads/2020/11/DSC_6474.jpg"
          alt="Medical background"
        />
        <div className="image-overlay"></div>
      </div>

      {/* Right side login form */}
      <div className="auth-right">
        <div className="form-wrapper">
          <img
            src={MedicalLogo}
            alt="BukSU Medical Logo"
            style={{
              width: '200px',
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <h2 style={{
            fontSize: '2.5rem',
            color: '#0077cc',
            textAlign: 'center',
            margin: '1rem 0',
            fontWeight: '600',
            fontFamily: 'Segoe UI, sans-serif'
          }}>
            BukSU Medical Clinic
          </h2>

          <a href="http://localhost:5000/api/auth/google">
            <button className="google-button">Continue with Google</button>
          </a>

          <input
            type="text"
            id="email"
            name="email"
            placeholder="Email or phone number"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <div className="recaptcha-container">
            <Recaptcha
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
            />
            {recaptchaError && (
              <p className="recaptcha-error">{recaptchaError}</p>
            )}
          </div>

          <button onClick={handleLogin}>Continue →</button>

          <p>
            Don't have an account? <span onClick={() => navigate('/signup')}>Register here</span>
          </p>

          <p className="forgot-password">
            <span onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </p>
        </div>
      </div>
    </div>
  );
}