import { useNavigate, NavLink } from "react-router-dom";
import "./styles.css";

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">📊</div>
          <div>
            <div className="logo-title">cakecraft studio</div>
            <div className="logo-subtitle">premium analytics</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-icon">📈</span> Analytics
          </NavLink>
        </nav>
      </aside>

      <main className="app-main">
        <div className="page">
          <header className="page-header">
            <div>
              <h1 className="page-title">analytics</h1>
              <p className="page-subtitle">basic shell (figma placeholder)</p>
            </div>
            <button
              type="button"
              className="primary-btn"
              style={{ width: "auto" }}
              onClick={() => navigate("/dashboard")}
            >
              back to dashboard
            </button>
          </header>

          <section className="card">
            <h3 className="card-title">coming soon</h3>
            <p className="card-subtitle">
              wire metrics and charts here when the backend endpoints land.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              <button
                type="button"
                className="ghost-btn"
                style={{ width: "100%" }}
                onClick={() => navigate("/orders")}
              >
                review orders
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
