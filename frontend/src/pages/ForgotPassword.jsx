import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles.css";

const ROLE_CONFIG = {
  customer: {
    signinPath: "/customer/sign-in",
    resetPath: "/customer/reset-password",
    label: "Customer",
    icon: "C",
  },
  baker: {
    signinPath: "/baker/sign-in",
    resetPath: "/baker/reset-password",
    label: "Baker",
    icon: "B",
  },
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const isCustomer = location.pathname.includes("/customer/");
  const config = isCustomer ? ROLE_CONFIG.customer : ROLE_CONFIG.baker;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetCode("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: isCustomer ? "customer" : "baker",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create reset code.");

      setMessage("Reset code created. Use it on the next screen to choose a new password.");
      setResetCode(data.resetCode || "");
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
        <h2 className="auth-title">Forgot Password?</h2>
        <p className="auth-subtitle">Get a reset code for your {config.label.toLowerCase()} account.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">Email Address</span>
            <input
              type="email"
              className="input"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && <p className="auth-error-text">{error}</p>}
          {message && <div className="info-box-blue">{message}</div>}
          {resetCode && (
            <div className="info-box-blue" style={{ marginTop: 10 }}>
              <strong>Your reset code:</strong> {resetCode}
              <div className="helper-text" style={{ marginTop: 6 }}>
                For now the code is shown here because email delivery is not set up yet.
              </div>
            </div>
          )}

          <button type="submit" className="primary-btn wide">
            {loading ? "Generating..." : "Get reset code"}
          </button>
        </form>

        <p className="auth-footer">
          Already have your code?{" "}
          <Link to={config.resetPath} className="link-accent">
            Reset password
          </Link>
        </p>

        <button className="link-button back-link" onClick={() => navigate(config.signinPath)}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}
