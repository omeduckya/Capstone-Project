import { NavLink, useNavigate } from "react-router-dom";
import "./styles.css";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">🍰</div>
          <div>
            <div className="logo-title">cakecraft studio</div>
            <div className="logo-subtitle">premium peach/pink</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🏠</span> Home
          </NavLink>
          <NavLink
            to="/customer/orders"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">📦</span> Orders
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">❤️</span> Favorites
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">👤</span> Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar-circle customer-avatar" />
            <div className="user-info">
              <div className="user-name">guest</div>
              <div className="user-role">coming soon</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="page">
          <header className="page-header">
            <div>
              <h1 className="page-title">coming soon</h1>
              <p className="page-subtitle">this page isn't ready yet.</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              style={{ width: "auto" }}
              onClick={() => navigate("/home")}
            >
              back to home
            </button>
          </header>

          <section className="card">
            <h3 className="card-title">what you can do</h3>
            <p className="card-subtitle">
              try exploring available pages from the sidebar.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => navigate("/customer/orders")}
              >
                go to orders
              </button>
              <button
                type="button"
                className="pill-button"
                onClick={() => navigate("/favorites")}
              >
                go to favorites
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

