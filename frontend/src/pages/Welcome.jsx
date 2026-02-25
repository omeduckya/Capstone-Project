// src/pages/Welcome.jsx
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="gradient-bg full-center">
      <div className="welcome-card">
        <div className="welcome-logo-circle">🎂</div>
        <h1 className="welcome-heading">
          #1 platform connecting home bakers with people who crave something
          special.
        </h1>
        <p className="welcome-subheading">
          Discover custom and ready-made cakes crafted by talented home bakers —
          all in one place.
        </p>

        <div className="welcome-actions">
          <button className="welcome-btn secondary">
            Continue as Customer
          </button>
          <Link to="/baker/sign-in" className="welcome-btn primary">
            Continue as Baker
          </Link>
        </div>

        <p className="welcome-caption">
          Join thousands of happy customers and talented bakers.
        </p>
      </div>
    </div>
  );
}