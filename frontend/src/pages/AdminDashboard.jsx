import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  uploadComplaintImage,
} from "../api/complaintApi";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { timeAgo } from "../utils/timeAgo";

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

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN";
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
  const [uploadingId, setUploadingId] = useState(null);

  async function loadComplaints() {
    try {
      setError("");
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
    } catch (err) {
      setError(err.response?.data?.message || "Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "PENDING").length,
    inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: complaints.filter((c) => c.status === "RESOLVED").length,
  }), [complaints]);

  const filteredComplaints = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return complaints.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesText = !text || [
        c.location,
        c.citizenName,
        c.citizenEmail,
        c.description,
      ].some((value) => String(value || "").toLowerCase().includes(text));

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
    if (!draft) return;

    try {
      await updateComplaintStatus(id, draft.status, draft.adminRemarks);
      showToast("Complaint updated.", "success");
      await loadComplaints();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update complaint.", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this complaint permanently?")) return;

    try {
      await deleteComplaint(id);
      showToast("Complaint deleted.", "success");
      await loadComplaints();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete complaint.", "error");
    }
  }

  async function handleImageSelect(complaintId, event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingId(complaintId);

    try {
      await uploadComplaintImage(complaintId, file);
      showToast("Image uploaded successfully.", "success");
      await loadComplaints();
    } catch (err) {
      showToast(err.response?.data?.message || "Image upload failed.", "error");
    } finally {
      setUploadingId(null);
      event.target.value = "";
    }
  }

  function openComplaint(id) {
    navigate(`/complaints/${id}`);
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function exportToCsv() {
    if (filteredComplaints.length === 0) return;

    const headers = [
      "ID", "Citizen", "Email", "Location", "Description",
      "Status", "Remarks", "Submitted",
    ];

    const rows = filteredComplaints.map((c) => [
      c.id,
      c.citizenName,
      c.citizenEmail,
      c.location,
      c.description,
      c.status,
      c.adminRemarks || "",
      new Date(c.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
          <Link to="/admin/logs" className="ghost-button">Audit Logs</Link>
          <span className="user-email">{email}</span>
          <button className="ghost-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="stats-row" style={{ marginTop: 32 }}>
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Complaints</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "#f59e0b" }}>{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "#2563eb" }}>{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: "#16a34a" }}>{stats.resolved}</div><div className="stat-label">Resolved</div></div>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" }}>
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0 }}>All Complaints</h3>
            <button className="button secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={exportToCsv} disabled={!filteredComplaints.length}>Export CSV</button>
          </div>

          <div className="admin-filters">
            <input type="text" placeholder="Search by citizen, email, location, or description..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
            </select>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && filteredComplaints.length === 0 && <p className="empty-state">No complaints match your filters.</p>}

          {!loading && filteredComplaints.length > 0 && (
            <div className="complaint-list">
              {filteredComplaints.map((c) => (
                <article className="complaint-item" key={c.id}>
                  <div className="complaint-top">
                    <button className="complaint-location-button" onClick={() => openComplaint(c.id)}>
                      {c.location}
                    </button>
                    <span className="status-badge" style={{ backgroundColor: statusColor(c.status) }}>
                      {formatStatus(c.status)}
                    </span>
                  </div>

                  <p className="complaint-desc">{c.description}</p>

                  <p className="citizen-details">
                    <strong>{c.citizenName}</strong> · {c.citizenEmail}
                  </p>

                  {c.adminRemarks && <p className="admin-remarks">Admin remarks: {c.adminRemarks}</p>}

                  <span className="complaint-date" title={new Date(c.createdAt).toLocaleString()}>
                    Submitted {timeAgo(c.createdAt)}
                  </span>

                  <div className="admin-card-controls">
                    <select value={drafts[c.id]?.status || c.status} onChange={(e) => handleDraftChange(c.id, "status", e.target.value)} style={{ borderLeft: `4px solid ${statusColor(drafts[c.id]?.status || c.status)}` }}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                    </select>

                    <input className="remarks-input" type="text" placeholder="Add remarks" value={drafts[c.id]?.adminRemarks || ""} onChange={(e) => handleDraftChange(c.id, "adminRemarks", e.target.value)} />

                    <div className="row-actions">
                      <button onClick={() => handleUpdate(c.id)}>Save</button>
                      <button className="button danger" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </div>

                  <div className="admin-card-footer">
                    {c.imagePath ? (
                      <span style={{ fontSize: 12, color: "#16a34a" }}>📷 Image attached</span>
                    ) : (
                      <label style={{ fontSize: 12.5, color: "var(--primary)", cursor: "pointer" }}>
                        {uploadingId === c.id ? "Uploading..." : "📎 Attach photo"}
                        <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(event) => handleImageSelect(c.id, event)} disabled={uploadingId === c.id} />
                      </label>
                    )}
                    <button className="view-details-button" onClick={() => openComplaint(c.id)}>View full details →</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default AdminDashboard;