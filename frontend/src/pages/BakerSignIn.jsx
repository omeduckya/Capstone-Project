// src/pages/BakerSignIn.jsx
import { Link, useNavigate } from "react-router-dom";

export default function BakerSignIn() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="gradient-bg full-center">
      <div className="auth-card">
        <div className="auth-logo-circle">🎂</div>
        <h2 className="auth-title">Baker Portal</h2>
        <p className="auth-subtitle">Sign in to manage your business</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">Email Address</span>
            <input
              type="email"
              className="input"
              placeholder="your@example.com"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input type="password" className="input" required />
          </label>

          <div className="auth-row">
            <label className="checkbox">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <button type="button" className="link-button">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="primary-btn wide">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          New baker?{" "}
          <Link to="/baker/sign-up" className="link-accent">
            Create account
          </Link>
        </p>

        <button
          className="link-button back-link"
          onClick={() => navigate("/")}
        >
          ⟵ Back to welcome page
        </button>
      </div>
    </div>
  );
}