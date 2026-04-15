// src/pages/CustomerOrders.jsx
import { useNavigate } from "react-router-dom";
import "./styles.css";

const activeOrders = [
  {
    id: "00001",
    name: "Custom Birthday Cake",
    baker: "Cakes By Nelia",
    status: "In Progress",
    statusClass: "yellow-pill",
    ordered: "Feb 8, 2026",
    delivery: "Feb 15, 2026",
    price: "$125",
    progress: 60,
  },
  {
    id: "00002",
    name: "Wedding Tier Cake",
    baker: "Sweet Dreams Bakery",
    status: "Pending Confirmation",
    statusClass: "blue-pill",
    ordered: "Feb 10, 2026",
    delivery: "Feb 18, 2026",
    price: "$450",
    progress: 20,
  },
];

const history = [
  {
    id: "00003",
    name: "Anniversary Special",
    baker: "The Cake Studio",
    delivered: "Feb 5, 2026",
    price: "$180",
    rated: false,
  },
  {
    id: "00004",
    name: "Chocolate Dream",
    baker: "Artisan Confections",
    delivered: "Jan 22, 2026",
    price: "$95",
    rated: true,
    stars: 5,
  },
];

export default function CustomerOrders() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">5 total orders</p>
        </div>
      </header>

      {/* Stats */}
      <div className="stat-row">
        {[
          { icon: "🕐", label: "Pending",     value: 1, color: "blue"   },
          { icon: "📦", label: "In Progress", value: 1, color: "yellow" },
          { icon: "✅", label: "Completed",   value: 2, color: "green"  },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ flex: 1 }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-meta">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active orders */}
      <h2 className="cust-section-title" style={{ marginBottom: "12px" }}>Active Orders</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
        {activeOrders.map((o) => (
          <div key={o.id} className="card">
            <div className="cust-order-row">
              <div className="cust-order-thumb" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>{o.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>by {o.baker}</div>
                    <span className={`status-pill ${o.statusClass}`}>{o.status}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--pink)", fontWeight: 700, fontSize: "16px" }}>{o.price}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Order #{o.id}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", margin: "10px 0 6px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>⚫ Ordered: {o.ordered}</span>
                  <span>🔴 Delivery: {o.delivery}</span>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    <span>Order Placed</span><span>In Progress</span><span>Ready</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", background: "#f3f4f6" }}>
                    <div style={{
                      height: "100%", width: `${o.progress}%`, borderRadius: "999px",
                      background: o.statusClass === "blue-pill" ? "#3b82f6" : "#f59e0b",
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="cust-primary-btn" style={{ flex: 1, padding: "9px" }}
                    onClick={() => navigate(`/orders/${o.id}`)}>
                    View Details
                  </button>
                  <button className="ghost-btn">💬 Message Baker</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order history */}
      <h2 className="cust-section-title" style={{ marginBottom: "12px" }}>Order History</h2>
      <div className="grid-2 gap-lg">
        {history.map((o) => (
          <div key={o.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative" }}>
              <div className="cust-history-img" />
              <span className="status-pill green-pill"
                style={{ position: "absolute", top: "10px", right: "10px" }}>
                ✅ Completed
              </span>
            </div>
            <div style={{ padding: "14px" }}>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>{o.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>by {o.baker}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Delivered</div>
                  <div>{o.delivered}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{o.price}</div>
              </div>
              {o.rated ? (
                <div className="cust-rated-box">
                  {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b" }}>{s}</span>)}
                  <span style={{ fontSize: "12px", color: "#92400e", marginLeft: "6px" }}>You rated {o.stars} stars</span>
                </div>
              ) : (
                <button className="cust-rate-btn">☆ Rate Your Experience</button>
              )}
              <button className="ghost-btn" style={{ width: "100%", marginTop: "8px" }}>Order Again</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}