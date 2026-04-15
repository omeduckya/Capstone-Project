import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles.css";

const ROLE_CONFIG = {
  customer: {
    signinPath: "/customer/sign-in",
    forgotPath: "/customer/forgot-password",
    label: "Customer",
    icon: "C",
  },
  baker: {
    signinPath: "/baker/sign-in",
    forgotPath: "/baker/forgot-password",
    label: "Baker",
    icon: "B",
  },
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const isCustomer = location.pathname.includes("/customer/");
  const config = isCustomer ? ROLE_CONFIG.customer : ROLE_CONFIG.baker;

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: isCustomer ? "customer" : "baker",
          code: code.trim(),
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not reset password.");

      setMessage("Password updated. You can sign in with your new password now.");
      setTimeout(() => navigate(config.signinPath), 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg full-center">
      <div className="auth-card">
        <div className="auth-logo-circle">{config.icon}</div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your reset code and choose a new password.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">Email Address</span>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Reset Code</span>
            <input
              type="text"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">New Password</span>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm New Password</span>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="auth-error-text">{error}</p>}
          {message && <div className="info-box-blue">{message}</div>}

          <button type="submit" className="primary-btn wide">
            {loading ? "Updating..." : "Set new password"}
          </button>
        </form>

        <p className="auth-footer">
          Need a code?{" "}
          <Link to={config.forgotPath} className="link-accent">
            Request one
          </Link>
        </p>

        <button className="link-button back-link" onClick={() => navigate(config.signinPath)}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}
