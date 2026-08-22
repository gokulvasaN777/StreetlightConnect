import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuditLogs } from "../api/auditApi";
import ThemeToggle from "../components/ThemeToggle";

function AuditLogs() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(() => setError("Could not load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>StreetLight Connect</h2>
          <span className="subtitle">Security Audit Trail</span>
        </div>

        <div className="header-right">
          <ThemeToggle />
          <Link to="/admin" className="ghost-button">
            Back to Dashboard
          </Link>
          <span className="user-email">{email}</span>
          <button className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "36px auto", padding: "0 20px 60px" }}>
        <section className="card">
          <h3>Recorded Actions</h3>

          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && logs.length === 0 && (
            <p className="empty-state">No activity recorded yet.</p>
          )}

          {!loading && logs.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.userEmail}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AuditLogs;