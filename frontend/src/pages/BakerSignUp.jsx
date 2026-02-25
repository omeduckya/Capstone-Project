// src/pages/BakerSignUp.jsx
import { Link, useNavigate } from "react-router-dom";

export default function BakerSignUp() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="gradient-bg full-center">
      <div className="signup-card">
        <div className="auth-logo-circle">🎂</div>
        <h2 className="auth-title">Start Your Baker Journey</h2>
        <p className="auth-subtitle">
          Join CakeCraft and grow your baking business
        </p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="grid-2">
            <label className="field">
              <span className="field-label">Business Name</span>
              <input className="input" placeholder="Cakes By Nelia" />
            </label>
            <label className="field">
              <span className="field-label">Your Name</span>
              <input className="input" placeholder="Nelia Kanafani" />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span className="field-label">Email Address</span>
              <input className="input" placeholder="your@example.com" />
            </label>
            <label className="field">
              <span className="field-label">Phone Number</span>
              <input className="input" placeholder="+1 (613) 123-4567" />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span className="field-label">Location</span>
              <input className="input" placeholder="City, Country" />
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <input type="password" className="input" />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Business Description</span>
            <textarea
              className="textarea"
              placeholder="Tell us about your baking experience and specialties..."
            />
          </label>

          <div className="info-banner">
            🎉 Special Launch Offer — join now and get 1 week of free premium
            membership!
          </div>

          <label className="checkbox">
            <input type="checkbox" />{" "}
            <span>
              I agree to the Terms of Service, Privacy Policy, and Baker
              Guidelines
            </span>
          </label>

          <button type="submit" className="primary-btn wide">
            Create Baker Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/baker/sign-in" className="link-accent">
            Sign in
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