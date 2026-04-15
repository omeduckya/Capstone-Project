import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles.css";

const ROLE_CONFIG = {
  customer: {
    title: "Welcome Back",
    subtitle: "Sign in to your customer account",
    signupPath: "/customer/sign-up",
    redirectPath: "/home",
    tokenKey: "customerToken",
    userKey: "customerUser",
    label: "Customer"
  },
  baker: {
    title: "Baker Portal",
    subtitle: "Sign in to manage your business",
    signupPath: "/baker/sign-up",
    redirectPath: "/dashboard",
    tokenKey: "bakerToken",
    userKey: "bakerUser",
    label: "Baker"
  }
};

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // check if we are on the customer route or baker route
  const isCustomer = location.pathname.includes("/customer/");
  const config = isCustomer ? ROLE_CONFIG.customer : ROLE_CONFIG.baker;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Sign in failed.");
      }

      // verify the user role matches the page they are on
      if (data.role !== (isCustomer ? "customer" : "baker")) {
        throw new Error(`this account is not registered as a ${config.label.toLowerCase()}.`);
      }

      const sessionUser = {
        ...data,
        email: data.email || email.trim(),
      };

      localStorage.setItem(config.tokenKey, data.token);
      localStorage.setItem(config.userKey, JSON.stringify(sessionUser));
      navigate(config.redirectPath);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="gradient-bg full-center">
      <div className="auth-card">
        <div className="auth-logo-circle">{isCustomer ? "👤" : "🎂"}</div>
        <h2 className="auth-title">{config.title}</h2>
        <p className="auth-subtitle">{config.subtitle}</p>

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

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="auth-error-text">{error}</p>}

          <button type="submit" className="primary-btn wide">
            {isSubmitting ? "Signing In..." : `Sign In as ${config.label}`}
          </button>
        </form>

        <p className="auth-footer">
          New {config.label.toLowerCase()}?{" "}
          <Link to={config.signupPath} className="link-accent">
            Create account
          </Link>
        </p>

        <p className="auth-footer" style={{ marginTop: 8 }}>
          Forgot your password?{" "}
          <Link
            to={isCustomer ? "/customer/forgot-password" : "/baker/forgot-password"}
            className="link-accent"
          >
            Reset it
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
