// src/pages/MyCakes.jsx
import { useNavigate } from "react-router-dom";

const cakes = [
  { id: "1", name: "Rose Garden", price: "$85", orders: 24, rating: 4.9, revenue: "$2,040" },
  { id: "2", name: "Chocolate Dream", price: "$95", orders: 18, rating: 4.8, revenue: "$1,710" },
  { id: "3", name: "Vanilla Elegance", price: "$110", orders: 32, rating: 4.9, revenue: "$3,520" },
  { id: "4", name: "Lemon Zest Bliss", price: "$75", orders: 16, rating: 4.7, revenue: "$1,125" },
  { id: "5", name: "Red Velvet", price: "$90", orders: 28, rating: 4.9, revenue: "$2,520" },
  { id: "6", name: "Strawberry Bliss", price: "$100", orders: 20, rating: 4.8, revenue: "$2,100" },
];

export default function MyCakes() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Cake Gallery</h1>
          <p className="page-subtitle">Manage and showcase your creations</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => navigate("/cakes/new")}
        >
          + Add New Cake
        </button>
      </header>

      <section className="stat-row">
        <div className="stat-card small">
          <span className="stat-label">Total Cakes</span>
          <span className="stat-value">6</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">138</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Avg. Rating</span>
          <span className="stat-value">4.8 ★</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">$13,015</span>
        </div>
      </section>

      <section className="grid-cards">
        {cakes.map((c) => (
          <article key={c.id} className="cake-card">
            <div className="cake-thumb" />
            <div className="cake-body">
              <div className="cake-header">
                <h3>{c.name}</h3>
                <span className="cake-price">{c.price}</span>
              </div>
              <div className="cake-metrics">
                <div className="badge"> {c.orders} orders</div>
                <div className="badge">⭐ {c.rating}</div>
              </div>
              <div className="cake-footer">
                <span className="revenue-label">Total Revenue</span>
                <span className="revenue-value">{c.revenue}</span>
              </div>
            </div>
            <button
              className="pill-button full"
              onClick={() => navigate(`/cakes/${c.id}/edit`)}
            >
              Edit Cake
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}