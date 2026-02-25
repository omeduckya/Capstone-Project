// src/components/AppLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./styles.css";

export default function AppLayout() {
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">🎂</div>
          <div className="logo-text">
            <span className="logo-title">CakeCraft</span>
            <span className="logo-subtitle">Studio</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link">
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/cakes" className="nav-link">
            <span className="nav-icon">🍰</span> My Cakes
          </NavLink>
          <NavLink to="/orders" className="nav-link">
            <span className="nav-icon">📦</span> Orders
          </NavLink>
          <NavLink to="/settings" className="nav-link">
            <span className="nav-icon">⚙️</span> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar-circle" />
            <div>
              <div className="user-name">Nelia Baker</div>
              <div className="user-role">Baker</div>
            </div>
          </div>
          <button
            className="signout-link"
            onClick={() => navigate("/baker/sign-in")}
          >
            ⟵ Sign Out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}