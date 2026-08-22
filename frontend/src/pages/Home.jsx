import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function Home() {
  return (
    <div className="page hero-wrapper">
      <nav className="navbar">
        <h2>StreetLight Connect</h2>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero">
        <span className="eyebrow">Code for Communities · Web Security Project</span>
        <h1>Report Broken Streetlights. Track Real Fixes.</h1>
        <p>
          A secure platform for citizens to report non-functioning streetlights
          and for municipal officers to resolve them — protected end-to-end
          with JWT authentication and role-based access control.
        </p>

        <div className="button-group">
          <Link className="button" to="/register">
            Report an Issue
          </Link>
          <Link className="button secondary" to="/login">
            Login to Account
          </Link>
        </div>
      </section>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="icon">🔐</div>
          <h3>JWT Secured</h3>
          <p>Every request is authenticated with signed tokens, and roles are strictly enforced on every API.</p>
        </div>

        <div className="feature-card">
          <div className="icon">📍</div>
          <h3>Location Reporting</h3>
          <p>Citizens submit precise location and description so officers can act quickly and accurately.</p>
        </div>

        <div className="feature-card">
          <div className="icon">📊</div>
          <h3>Live Status Tracking</h3>
          <p>Track your complaint from Pending to Resolved, with remarks added by municipal staff.</p>
        </div>

        <div className="feature-card">
          <div className="icon">🧾</div>
          <h3>Audit Trail</h3>
          <p>Every login and complaint action is logged for full accountability and transparency.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;