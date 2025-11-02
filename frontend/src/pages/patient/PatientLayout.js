import React, { useState, useRef, useEffect } from 'react';
import './PatientDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  User,
  LogOut,
} from 'lucide-react';

export default function PatientLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Load user data safely
  const user = {
    firstName: (localStorage.getItem('firstName') || 'Patient').trim(),
    lastName: (localStorage.getItem('lastName') || '').trim(),
    profileImage: (localStorage.getItem('profileImage') || '').trim(),
  };

  const handleLogout = () => {
    // Clear only user-related data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('profileImage');
    navigate('/', { replace: true });
  };

  // ✅ Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ✅ Get initials if no profile image
  const getInitials = (first, last) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="sidebar-title">Patient Menu</h3>
        <ul className="sidebar-menu">
          <li
            className={location.pathname === '/patient-dashboard' ? 'active' : ''}
            onClick={() => navigate('/patient-dashboard')}
          >
            <LayoutDashboard className="menu-icon" />
            <span>Dashboard</span>
          </li>

          <li
            className={location.pathname === '/patient-appointments' ? 'active' : ''}
            onClick={() => navigate('/patient-appointments')}
          >
            <CalendarDays className="menu-icon" />
            <span>My Appointments</span>
          </li>

          <li
            className={location.pathname === '/patient-book' ? 'active' : ''}
            onClick={() => navigate('/patient-book')}
          >
            <CalendarPlus className="menu-icon" />
            <span>Book Appointment</span>
          </li>

          <li
            className={location.pathname === '/patient-profile' ? 'active' : ''}
            onClick={() => navigate('/patient-profile')}
          >
            <User className="menu-icon" />
            <span>Profile</span>
          </li>
        </ul>

        <button onClick={handleLogout} className="logout-button">
          <LogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <nav className="navbar">
          <strong>
            Welcome, {user.firstName} {user.lastName}
          </strong>

          {/* Profile Icon Dropdown */}
          <div className="profile-menu" ref={dropdownRef}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="profile-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            ) : (
              <div
                className="profile-initials"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}

            {dropdownOpen && (
              <div className="dropdown">
                <button onClick={() => navigate('/patient-profile')}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </nav>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
