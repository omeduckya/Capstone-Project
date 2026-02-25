// src/pages/Dashboard.jsx
export default function Dashboard() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Hello, Nelia! 👋</p>
        </div>
      </header>

      <section className="stat-row">
        <div className="stat-card">
          <div className="stat-icon blue">⏱️</div>
          <div className="stat-meta">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">8</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">📦</div>
          <div className="stat-meta">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">3</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-meta">
            <span className="stat-label">Completed This Month</span>
            <span className="stat-value">45</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">💰</div>
          <div className="stat-meta">
            <span className="stat-label">Monthly Revenue</span>
            <span className="stat-value">$2,450</span>
          </div>
        </div>
      </section>

      <section className="attention-banner">
        <div>
          <h3>3 Orders Need Your Attention</h3>
          <p>Review and respond to pending orders</p>
        </div>
        <button className="primary-btn">Review Orders</button>
      </section>

      <section className="split-row">
        <div className="card">
          <div className="card-header">
            <h3>Pending Orders</h3>
            <button className="link-button">View All ⟶</button>
          </div>
          <div className="order-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="order-item">
                <div className="order-thumb" />
                <div className="order-main">
                  <div className="order-title">Birthday Celebration</div>
                  <div className="order-meta">
                    <span>Emily Johnson</span>
                    <span>Feb 15, 2026</span>
                  </div>
                </div>
                <div className="order-price">$125</div>
                <span className="status-pill blue-pill">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>In Progress</h3>
            <button className="link-button">View All ⟶</button>
          </div>
          <div className="order-list">
            {[1, 2].map((i) => (
              <div key={i} className="order-item">
                <div className="order-thumb" />
                <div className="order-main">
                  <div className="order-title">Custom Cake</div>
                  <div className="order-meta">
                    <span>David Brown</span>
                    <span>Feb 11, 2026</span>
                  </div>
                </div>
                <div className="order-price">$95</div>
                <span className="status-pill yellow-pill">In Progress</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}