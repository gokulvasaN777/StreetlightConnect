import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getComplaintById } from "../api/complaintApi";

const STATUS_STEPS = ["PENDING", "IN_PROGRESS", "RESOLVED"];

function ComplaintDetails() {
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadComplaint() {
      try {
        setLoading(true);
        setError("");

        const data = await getComplaintById(complaintId);

        if (isMounted) {
          setComplaint(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Could not load complaint details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadComplaint();

    return () => {
      isMounted = false;
    };
  }, [complaintId]);

  if (loading) {
    return (
      <main className="details-page">
        <div className="card details-state">
          <p>Loading complaint details...</p>
        </div>
      </main>
    );
  }

  if (error || !complaint) {
    return (
      <main className="details-page">
        <div className="card details-state">
          <p className="error">{error || "Complaint not found."}</p>
          <Link to="/complaints" className="back-link">
            ← Back to complaints
          </Link>
        </div>
      </main>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(complaint.status);
  const progress = getProgress(complaint.status);

  return (
    <div className="dashboard details-dashboard">
      <header className="dashboard-header">
        <div>
          <h2>StreetLight Connect</h2>
          <span className="subtitle">Complaint Details</span>
        </div>

        <Link to="/complaints" className="ghost-button back-button">
          ← Back to complaints
        </Link>
      </header>

      <main className="details-page">
        <section className="card details-title-card">
          <div>
            <span className="details-reference">
              Complaint #{complaint.id}
            </span>
            <h1>{complaint.location}</h1>
            <p className="details-summary">
              {complaint.description}
            </p>
          </div>

          <span
            className="status-badge details-status"
            style={{ backgroundColor: statusColor(complaint.status) }}
          >
            {formatStatus(complaint.status)}
          </span>
        </section>

        <section className="card progress-card" aria-labelledby="progress-title">
          <div className="progress-heading">
            <div>
              <span className="details-reference">STATUS TRACKING</span>
              <h2 id="progress-title">Complaint progress</h2>
            </div>
            <span className="progress-value">{progress}% complete</span>
          </div>

          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Complaint progress: ${formatStatus(complaint.status)}`}
          >
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="progress-steps">
            {STATUS_STEPS.map((step, index) => (
              <div
                className={`progress-step ${
                  index <= currentStep ? "completed" : ""
                } ${index === currentStep ? "current" : ""}`}
                key={step}
              >
                <span className="step-dot" aria-hidden="true" />
                <span>{formatStatus(step)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="details-grid">
          <section className="card details-card">
            <div className="card-heading">
              <div>
                <span className="details-reference">REPORT INFORMATION</span>
                <h2>Full complaint details</h2>
              </div>
            </div>

            <dl className="details-list">
              <DetailRow label="Location" value={complaint.location} />
              <DetailRow
                label="Description"
                value={complaint.description}
              />
              <DetailRow
                label="Date and time noticed"
                value={formatDate(complaint.occurredAt)}
              />
              <DetailRow
                label="Submitted on"
                value={formatDate(complaint.createdAt)}
              />
              <DetailRow
                label="Last updated"
                value={formatDate(complaint.updatedAt)}
              />
              <DetailRow
                label="Admin remarks"
                value={complaint.adminRemarks || "No remarks added yet."}
              />
            </dl>

            {complaint.imagePath && (
              <div className="evidence-section">
                <h3>Attached evidence</h3>
                <img
                  src={complaint.imagePath}
                  alt={`Evidence for the complaint at ${complaint.location}`}
                  className="complaint-detail-image"
                />
              </div>
            )}
          </section>

          <section className="card technician-card">
            <div className="card-heading">
              <div>
                <span className="details-reference">FIELD TEAM</span>
                <h2>Assigned technician</h2>
              </div>
            </div>

            {complaint.assignedTechnician ? (
              <TechnicianDetails complaint={complaint} />
            ) : (
              <div className="technician-empty">
                <div className="technician-empty-icon">⌛</div>
                <h3>Not assigned yet</h3>
                <p>
                  A maintenance technician will be assigned after your
                  complaint is reviewed.
                </p>
              </div>
            )}
          </section>
        </div>

        {complaint.status === "RESOLVED" && (
          <section className="card resolution-card">
            <span className="details-reference">RESOLUTION</span>
            <h2>Has the issue been fixed?</h2>
            <p>
              Please check the streetlight and contact the municipality if
              the problem continues.
            </p>
            <button type="button" className="secondary-button">
              Report that the issue continues
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value || "Not available"}</dd>
    </div>
  );
}

function TechnicianDetails({ complaint }) {
  const technician = complaint.assignedTechnician;
  const initials = technician.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="technician-details">
      <div className="technician-profile">
        <div className="technician-avatar" aria-hidden="true">
          {initials || "T"}
        </div>
        <div>
          <h3>{technician.name}</h3>
          <p>{technician.department || "Electrical Maintenance"}</p>
        </div>
      </div>

      <dl className="details-list technician-list">
        <DetailRow
          label="Employee ID"
          value={technician.employeeId}
        />
        <DetailRow
          label="Assigned on"
          value={formatDate(complaint.assignedAt)}
        />
        <DetailRow
          label="Expected completion"
          value={formatDate(complaint.expectedCompletionDate)}
        />
      </dl>
    </div>
  );
}

function getProgress(status) {
  switch (status) {
    case "IN_PROGRESS":
      return 66;
    case "RESOLVED":
      return 100;
    case "REJECTED":
      return 100;
    case "PENDING":
    default:
      return 20;
  }
}

function statusColor(status) {
  switch (status) {
    case "PENDING":
      return "#f59e0b";
    case "IN_PROGRESS":
      return "#2563eb";
    case "RESOLVED":
      return "#16a34a";
    case "REJECTED":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN";
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default ComplaintDetails;