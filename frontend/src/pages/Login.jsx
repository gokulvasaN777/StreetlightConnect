import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

function Login() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [activeRole, setActiveRole] = useState("CITIZEN");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      if (data.role !== activeRole) {
        setError(
          activeRole === "ADMIN"
            ? "This account is not registered as a Municipal Officer."
            : "This account is registered as an Officer. Use the Officer tab."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);

      showToast("Login successful. Redirecting...", "success");

      setTimeout(() => {
        navigate(data.role === "ADMIN" ? "/admin" : "/citizen");
      }, 600);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-brand">
        <h1>StreetLight Connect</h1>
        <p>
          Secure municipal complaint management, protected by JWT authentication
          and role-based authorization.
        </p>
        <ul>
          <li>End-to-end encrypted password storage with BCrypt</li>
          <li>Role-separated citizen and officer dashboards</li>
          <li>Real-time complaint status tracking</li>
          <li>Full security audit trail for every action</li>
        </ul>
      </div>

      <div className="form-side">
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <ThemeToggle />
          </div>

          <h1>Welcome back</h1>
          <p className="lead">Login to report or manage streetlight complaints.</p>

          <div className="role-tabs">
            <div
              className={`role-tab ${activeRole === "CITIZEN" ? "active" : ""}`}
              onClick={() => setActiveRole("CITIZEN")}
            >
              Citizen
            </div>
            <div
              className={`role-tab ${activeRole === "ADMIN" ? "active" : ""}`}
              onClick={() => setActiveRole("ADMIN")}
            >
              Municipal Officer
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "Logging in..."
                : `Login as ${activeRole === "ADMIN" ? "Officer" : "Citizen"}`}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          {activeRole === "CITIZEN" && (
            <p className="switch-link">
              New citizen? <Link to="/register">Create an account</Link>
            </p>
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default Login;