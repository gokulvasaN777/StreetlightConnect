import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import ThemeToggle from "../components/ThemeToggle";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

function Register() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await registerUser(form);
      showToast("Account created successfully!", "success");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-brand">
        <h1>Join StreetLight Connect</h1>
        <p>
          Create a free citizen account to start reporting streetlight issues
          in your neighborhood.
        </p>
        <ul>
          <li>Your password is hashed and never stored in plain text</li>
          <li>Submit complaints with location and description</li>
          <li>Track resolution status in real time</li>
        </ul>
      </div>

      <div className="form-side">
        <div className="form-card">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <ThemeToggle />
          </div>

          <h1>Create your account</h1>
          <p className="lead">It only takes a minute.</p>

          <form onSubmit={handleSubmit}>
            <label>Full name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />

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
              placeholder="Minimum 8 characters"
              minLength="8"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          <p className="switch-link">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default Register;