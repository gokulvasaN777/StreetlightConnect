import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  submitComplaint,
  getMyComplaints,
  uploadComplaintImage,
} from "../api/complaintApi";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { timeAgo } from "../utils/timeAgo";

function statusColor(status) {
  switch (status) {
    case "PENDING": return "#f59e0b";
    case "IN_PROGRESS": return "#2563eb";
    case "RESOLVED": return "#16a34a";
    case "REJECTED": return "#dc2626";
    default: return "#64748b";
  }
}

function CitizenDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({ location: "", description: "" });
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  async function loadComplaints() {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch {
      setError("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await submitComplaint(form);
      setForm({ location: "", description: "" });
      showToast("Complaint submitted successfully.", "success");
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
      showToast("Failed to submit complaint.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageSelect(complaintId, event) {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingId(complaintId);

    try {
      await uploadComplaintImage(complaintId, file);
      showToast("Image uploaded successfully.", "success");
      loadComplaints();
    } catch (err) {
      showToast(err.response?.data?.message || "Image upload failed.", "error");
    } finally {
      setUploadingId(null);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>StreetLight Connect</h2>
          <span className="subtitle">Citizen Portal</span>
        </div>

        <div className="header-right">
          <ThemeToggle />
          {!loading && (
            <span className="user-email">
              {complaints.length} active complaint{complaints.length !== 1 ? "s" : ""}
            </span>
          )}
          <span className="user-email">{email}</span>
          <button className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="card form-section">
          <h3>Report a Streetlight Issue</h3>

          <form onSubmit={handleSubmit}>
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Anna Nagar 5th Street, near Park"
              value={form.location}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the issue (e.g. light not working since 3 days)"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>

        <section className="card list-section">
          <h3>My Complaints</h3>

          {loading && <p>Loading...</p>}

          {!loading && complaints.length === 0 && (
            <p className="empty-state">No complaints submitted yet.</p>
          )}

          <div className="complaint-list">
            {complaints.map((complaint) => (
              <div className="complaint-item" key={complaint.id}>
                <div className="complaint-top">
                  <strong>{complaint.location}</strong>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: statusColor(complaint.status) }}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>

                <p className="complaint-desc">{complaint.description}</p>

                {complaint.adminRemarks && (
                  <p className="admin-remarks">
                    Admin remarks: {complaint.adminRemarks}
                  </p>
                )}

                <span
                  className="complaint-date"
                  title={new Date(complaint.createdAt).toLocaleString()}
                >
                  Submitted {timeAgo(complaint.createdAt)}
                </span>

                <div style={{ marginTop: 10 }}>
                  {complaint.imagePath ? (
                    <span style={{ fontSize: 12, color: "#16a34a" }}>
                      📷 Image attached
                    </span>
                  ) : (
                    <label
                      style={{
                        fontSize: 12.5,
                        color: "var(--primary)",
                        cursor: "pointer",
                      }}
                    >
                      {uploadingId === complaint.id
                        ? "Uploading..."
                        : "📎 Attach photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageSelect(complaint.id, e)}
                        disabled={uploadingId === complaint.id}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default CitizenDashboard;