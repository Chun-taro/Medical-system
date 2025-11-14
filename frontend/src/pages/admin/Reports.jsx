import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import "./Style/Reports.css";

function useRealTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function Reports() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("token");
        const consultRes = await axios.get(
          "http://localhost:5000/api/appointments/consultations",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sortedConsultations = consultRes.data.sort((a, b) => {
          const dateA = new Date(
            a.consultationCompletedAt || a.appointmentDate || 0
          );
          const dateB = new Date(
            b.consultationCompletedAt || b.appointmentDate || 0
          );
          return dateB - dateA;
        });

        setConsultations(sortedConsultations);
        if (sortedConsultations.length > 0) {
          setExpandedId(sortedConsultations[0]._id);
        }
      } catch (err) {
        console.error("Error fetching consultations:", err);
        setError("Failed to load consultations");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const formatDateTime = (date) => {
    try {
      return date
        ? new Date(date).toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "—";
    } catch {
      return "—";
    }
  };

  const currentTime = useRealTime();

  return (
    <AdminLayout>
      <div className="reports-container">
        <div className="header-section">
          <h2>📊 Reports Dashboard</h2>
          <p>Monitor patient consultations.</p>
        </div>

        {loading ? (
          <p className="status-msg">Loading consultations...</p>
        ) : error ? (
          <p className="status-msg error">{error}</p>
        ) : (
          <>
            {/* Consultations */}
            <h3 className="section-title">🩺 Past Consultations</h3>
            <div className="consultation-split-view">
              {/* Left list */}
              <div className="consultation-list">
                {consultations.length > 0 ? (
                  consultations.map((c) => (
                    <div
                      key={c._id}
                      className={`consultation-item ${
                        expandedId === c._id ? "active" : ""
                      }`}
                      onClick={() => toggleExpand(c._id)}
                    >
                      <p className="patient-name">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="consult-date">
                        <strong>Date:</strong>{" "}
                        {formatDateTime(c.appointmentDate)}
                      </p>
                      <p className="consult-diagnosis">{c.diagnosis}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-list">No consultations found.</p>
                )}
              </div>

              {/* Right details */}
              <div className="consultation-details">
                {(() => {
                  const selected = consultations.find(
                    (c) => c._id === expandedId
                  );
                  if (!selected)
                    return <p>Select a consultation to view details.</p>;

                  return (
                    <div key={selected._id}>
                      <h4>
                        {selected.firstName} {selected.lastName}
                      </h4>
                      <p>
                        <strong>Diagnosis:</strong> {selected.diagnosis}
                      </p>
                      <p>
                        <strong>Management:</strong> {selected.management}
                      </p>
                      <p>
                        <strong>Chief Complaint:</strong>{" "}
                        {selected.chiefComplaint}
                      </p>

                      <p>
                        <strong>Prescribed Medicines:</strong>
                      </p>
                      <ul>
                        {Array.isArray(selected.medicinesPrescribed)
                          ? selected.medicinesPrescribed.map((med, idx) => (
                              <li key={idx}>
                                {med.name} ×{med.quantity}
                              </li>
                            ))
                          : (
                            <li>{selected.medicinesPrescribed || "—"}</li>
                          )}
                      </ul>

                      <p>
                        <strong>Vitals:</strong> BP: {selected.bloodPressure},
                        Temp: {selected.temperature}, HR: {selected.heartRate},
                        O₂: {selected.oxygenSaturation}, BMI: {selected.bmi}
                      </p>
                      <p>
                        <strong>Referred:</strong>{" "}
                        {selected.referredToPhysician
                          ? `Yes (${selected.physicianName || "—"})`
                          : "No"}
                      </p>
                      <p>
                        <strong>First Aid:</strong>{" "}
                        {selected.firstAidDone === "y" ? "Yes" : "No"} (
                        {selected.firstAidWithin30Mins})
                      </p>
                      <p>
                        <strong>Completed At:</strong>{" "}
                        {formatDateTime(
                          selected.consultationCompletedAt ||
                            selected.appointmentDate
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="footer-time">
              <p>🕒 Current time: {currentTime.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}