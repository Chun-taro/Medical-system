import React, { useState, useRef, useEffect } from 'react';
import './AdminDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  ClipboardList,
  Package,
  LogOut,
  Stethoscope,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Load admin data from localStorage
  const admin = {
    firstName: (localStorage.getItem('firstName') || 'Admin').trim(),
    lastName: (localStorage.getItem('lastName') || '').trim(),
    profileImage: (localStorage.getItem('profileImage') || '').trim(),
  };

  const handleLogout = () => {
    ['token', 'userId', 'firstName', 'lastName', 'profileImage'].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate('/', { replace: true });
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (first, last) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'All Appointments', path: '/admin-appointments', icon: <CalendarDays size={18} /> },
    { name: 'Manage Users', path: '/admin-users', icon: <Users size={18} /> },
    { name: 'Reports', path: '/admin-reports', icon: <BarChart3 size={18} /> },
    { name: 'Consultation', path: '/admin-consultation/preview', icon: <Stethoscope size={18} /> },
    { name: 'Inventory', path: '/admin-inventory', icon: <Package size={18} /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="sidebar-title">Admin Panel</h3>
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <nav className="navbar">
          <strong>Welcome, {admin.firstName} {admin.lastName}</strong>

          {/* Profile Icon Dropdown */}
          <div className="profile-menu" ref={dropdownRef}>
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt="Profile"
                className="profile-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            ) : (
              <div
                className="profile-initials"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {getInitials(admin.firstName, admin.lastName)}
              </div>
            )}

            {dropdownOpen && (
              <div className="dropdown">
                <button onClick={() => navigate('/admin-profile')}>
                  View Profile
                </button>
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
