// src/pages/AllOrders.jsx
import { useNavigate } from "react-router-dom";

const orders = [
  {
    id: "00001",
    name: "Birthday Celebration",
    customer: "Emily Johnson",
    date: "Feb 15, 2026",
    status: "Pending",
    price: "$125",
  },
  {
    id: "00002",
    name: "Wedding Tier Cake",
    customer: "Michael Chen",
    date: "Feb 18, 2026",
    status: "Pending",
    price: "$450",
  },
  {
    id: "00003",
    name: "Anniversary Special",
    customer: "Sarah Miller",
    date: "Feb 12, 2026",
    status: "Pending",
    price: "$180",
  },
  {
    id: "00004",
    name: "Custom Chocolate Cake",
    customer: "David Brown",
    date: "Feb 11, 2026",
    status: "In Progress",
    price: "$95",
  },
  {
    id: "00007",
    name: "Red Velvet Classic",
    customer: "Emma Davis",
    date: "Feb 7, 2026",
    status: "Completed",
    price: "$90",
  },
];

export default function AllOrders() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="page-header orders-header">
        <div>
          <h1 className="page-title">All Orders</h1>
          <p className="page-subtitle">7 total orders</p>
        </div>
        <input
          className="search-input"
          placeholder="Search orders..."
          type="search"
        />
      </header>

      <section className="stat-row">
        <div className="stat-pill">3 Pending</div>
        <div className="stat-pill">2 In Progress</div>
        <div className="stat-pill">2 Completed</div>
        <div className="stat-pill active">7 All Orders</div>
      </section>

      <div className="card">
        <div className="table">
          <div className="table-header">
            <span>Order Details</span>
            <span>Customer</span>
            <span>Delivery Date</span>
            <span>Status</span>
            <span>Price</span>
            <span />
          </div>
          {orders.map((o) => (
            <div key={o.id} className="table-row">
              <div>
                <div className="order-title">{o.name}</div>
                <div className="table-sub">Order #{o.id}</div>
              </div>
              <span>{o.customer}</span>
              <span>{o.date}</span>
              <span
                className={
                  o.status === "Completed"
                    ? "status-pill green-pill"
                    : o.status === "In Progress"
                    ? "status-pill yellow-pill"
                    : "status-pill blue-pill"
                }
              >
                {o.status}
              </span>
              <span className="order-price">{o.price}</span>
              <button
                className="pill-button"
                onClick={() => navigate(`/orders/${o.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}