import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './AdminProfile.css';

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="loading-text">Loading profile...</p>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout>
        <p className="error-text">Unable to load admin profile.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <h2 className="dashboard-heading">👤 Admin Profile</h2>

        <div className="profile-card">
          {admin.profileImage ? (
            <img src={admin.profileImage} alt="Profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar initials">
              {`${admin.firstName[0] || ''}${admin.lastName[0] || ''}`.toUpperCase()}
            </div>
          )}

          <div className="profile-details">
            <p><strong>Name:</strong> {admin.firstName} {admin.lastName}</p>
            <p><strong>Email:</strong> {admin.email}</p>
            <p><strong>Role:</strong> {admin.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}