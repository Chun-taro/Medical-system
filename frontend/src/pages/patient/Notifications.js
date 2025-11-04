import React, { useEffect, useState } from 'react';
import PatientLayout from './PatientLayout';
import './Notifications.css'; // ✅ Import the new CSS

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    };

    fetchNotifications();
  }, []);

  return (
    <PatientLayout>
      <div className="notifications-page">
        <h2 className="notifications-title">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="notifications-empty">You have no notifications.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li key={n.id} className={`notification-item ${n.status}`}>
                <div className="notification-message">
                  <strong>{n.status.toUpperCase()}</strong>: {n.message}
                </div>
                <div className="notification-timestamp">
                  {new Date(n.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PatientLayout>
  );
}