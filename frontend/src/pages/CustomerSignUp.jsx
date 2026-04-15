// src/pages/CustomerSignUp.jsx
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import { useState } from "react";

export default function CustomerSignUp() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    acceptedTerms: false,
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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
    setNotice("");

    if (!formData.acceptedTerms) {
      setError("You must accept the terms to create an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Register the Customer
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: "customer",
          phone: formData.phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }
      setNotice(
        data.welcomeEmailSent
          ? "Welcome email sent. Please check your inbox to learn how CakeCraft works."
          : "Account created. Welcome email is not sending yet because email delivery is not configured."
      );

      // 2. Automatically Log Them In
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

      // 3. Store Token and Redirect to Customer Home
      const sessionUser = {
        ...loginData,
        email: loginData.email || formData.email.trim(),
      };

      localStorage.setItem("customerToken", loginData.token);
      localStorage.setItem("customerUser", JSON.stringify(sessionUser));
      navigate("/home");
      
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gradient-bg full-center">
      <div className="signup-card">
        <div className="auth-logo-circle">🍰</div>
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">
          Join CakeCraft to find and order custom cakes
        </p>

        <form onSubmit={handleSubmit} className="signup-form">
          <label className="field">
            <span className="field-label">Full Name</span>
            <input
              name="name"
              className="input"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

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
                placeholder="+1 (xxx) xxx-xxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="info-banner">
            ✨ Welcome! Browse local bakers and track your orders in one place.
          </div>

          <label className="checkbox">
            <input
              name="acceptedTerms"
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={handleChange}
            />{" "}
            <span>
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          {error && <p className="auth-error-text">{error}</p>}
          {notice && <div className="info-box-blue">{notice}</div>}

          <button type="submit" className="primary-btn wide" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/customer/sign-in" className="link-accent">
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
