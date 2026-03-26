// src/pages/BakerSignUp.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function BakerSignUp() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [formData, setFormData] = useState({
    businessName: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    description: "",
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.acceptedTerms) {
      setError("You must accept the terms to create an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: "baker",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginData.error || "Account created, but sign-in failed.");
      }

      if (loginData.role !== "baker") {
        throw new Error("This account is not a baker account.");
      }

      localStorage.setItem("id", loginData.id);            // MongoDB _id
      localStorage.setItem("bakerToken", loginData.token);
      localStorage.setItem("bakerUser", JSON.stringify(loginData));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
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
              <input
                name="businessName"
                className="input"
                placeholder="Cakes By Nelia"
                value={formData.businessName}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span className="field-label">Your Name</span>
              <input
                name="name"
                className="input"
                placeholder="Nelia Kanafani"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span className="field-label">Email Address</span>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="your@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Phone Number</span>
              <input
                name="phone"
                className="input"
                placeholder="+1 (613) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="grid-2">
            <label className="field">
              <span className="field-label">Location</span>
              <input
                name="location"
                className="input"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span className="field-label">Password</span>
              <input
                name="password"
                type="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Business Description</span>
            <textarea
              name="description"
              className="textarea"
              placeholder="Tell us about your baking experience and specialties..."
              value={formData.description}
              onChange={handleChange}
            />
          </label>

          <div className="info-banner">
            🎉 Special Launch Offer — join now and get 1 week of free premium
            membership!
          </div>

          <label className="checkbox">
            <input
              name="acceptedTerms"
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={handleChange}
            />{" "}
            <span>
              I agree to the Terms of Service, Privacy Policy, and Baker
              Guidelines
            </span>
          </label>

          {error && <p className="auth-error-text">{error}</p>}

          <button type="submit" className="primary-btn wide">
            {isSubmitting ? "Creating Account..." : "Create Baker Account"}
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
