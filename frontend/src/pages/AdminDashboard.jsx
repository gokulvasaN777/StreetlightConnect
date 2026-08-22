import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from "../api/complaintApi";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function statusColor(status) {
  switch (status) {
    case "PENDING": return "#f59e0b";
    case "IN_PROGRESS": return "#2563eb";
    case "RESOLVED": return "#16a34a";
    case "REJECTED": return "#dc2626";
    default: return "#64748b";
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const { toast, showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadComplaints() {
    try {
      const data = await getAllComplaints();
      setComplaints(data);

      const initialDrafts = {};
      data.forEach((c) => {
        initialDrafts[c.id] = {
          status: c.status,
          adminRemarks: c.adminRemarks || "",
        };
      });
      setDrafts(initialDrafts);
    } catch {
      setError("Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "PENDING").length;
    const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    return { total, pending, inProgress, resolved };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const text = searchText.toLowerCase();
      const matchesText =
        !text ||
        c.location.toLowerCase().includes(text) ||
        c.citizenName.toLowerCase().includes(text) ||
        c.citizenEmail.toLowerCase().includes(text);
      return matchesStatus && matchesText;
    });
  }, [complaints, searchText, statusFilter]);

  function handleDraftChange(id, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleUpdate(id) {
    const draft = drafts[id];
    try {
      await updateComplaintStatus(id, draft.status, draft.adminRemarks);
      showToast("Complaint updated.", "success");
      loadComplaints();
    } catch {
      showToast("Failed to update complaint.", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this complaint permanently?")) return;

    try {
      await deleteComplaint(id);
      showToast("Complaint deleted.", "success");
      loadComplaints();
    } catch {
      showToast("Failed to delete complaint.", "error");
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function exportToCsv() {
    if (filteredComplaints.length === 0) return;

    const headers = [
      "ID",
      "Citizen",
      "Email",
      "Location",
      "Description",
      "Status",
      "Remarks",
      "Submitted",
    ];

    const rows = filteredComplaints.map((c) => [
      c.id,
      c.citizenName,
      c.citizenEmail,
      c.location,
      c.description.replace(/,/g, ";"),
      c.status,
      (c.adminRemarks || "").replace(/,/g, ";"),
      new Date(c.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>StreetLight Connect</h2>
          <span className="subtitle">Admin Portal</span>
        </div>

        <div className="header-right">
          <ThemeToggle />
          <Link to="/admin/logs" className="ghost-button">
            Audit Logs
          </Link>
          <span className="user-email">{email}</span>
          <button className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="stats-row" style={{ marginTop: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {stats.pending}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#2563eb" }}>
            {stats.inProgress}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#16a34a" }}>
            {stats.resolved}
          </div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>
        <section className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0 }}>All Complaints</h3>
            <button
              className="button secondary"
              style={{ padding: "8px 16px", fontSize: 13 }}
              onClick={exportToCsv}
              disabled={filteredComplaints.length === 0}
            >
              Export CSV
            </button>
          </div>

          <div className="admin-filters">
            <input
              type="text"
              placeholder="Search by citizen, email, or location..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && filteredComplaints.length === 0 && (
            <p className="empty-state">No complaints match your filters.</p>
          )}

          {!loading && filteredComplaints.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.citizenName}</strong>
                        <br />
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {c.citizenEmail}
                        </span>
                      </td>
                      <td>{c.location}</td>
                      <td style={{ maxWidth: 220 }}>{c.description}</td>
                      <td>
                        <select
                          value={drafts[c.id]?.status || c.status}
                          onChange={(e) =>
                            handleDraftChange(c.id, "status", e.target.value)
                          }
                          style={{
                            borderLeft: `4px solid ${statusColor(
                              drafts[c.id]?.status || c.status
                            )}`,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="remarks-input"
                          type="text"
                          placeholder="Add remarks"
                          value={drafts[c.id]?.adminRemarks || ""}
                          onChange={(e) =>
                            handleDraftChange(c.id, "adminRemarks", e.target.value)
                          }
                        />
                      </td>
                      <td style={{ fontSize: 12.5, color: "#94a3b8" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => handleUpdate(c.id)}>Save</button>
                          <button
                            className="button danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default AdminDashboard;