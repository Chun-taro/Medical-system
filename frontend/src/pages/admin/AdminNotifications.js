import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import './AdminNotifications.css';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-notifications-container">
        <h2 className="admin-notifications-heading">🔔 Admin Notifications</h2>

        {loading ? (
          <p className="loading-text">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="empty-text">No notifications yet.</p>
        ) : (
          <ul className="admin-notifications-list">
            {notifications.map((note) => (
              <li key={note._id} className={`admin-notification-item ${note.read ? 'read' : 'unread'}`}>
                <div className="admin-notification-message">{note.message}</div>
                <div className="admin-notification-meta">
                  <span className="admin-notification-type">{note.type}</span>
                  <span className="admin-notification-status">{note.status}</span>
                  <span className="admin-notification-time">{new Date(note.timestamp).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}