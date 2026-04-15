// src/pages/CompletedOrders.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function CompletedOrders() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const bakerId = (() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed?.id || parsed?._id || "";
    } catch {
      return "";
    }
  })();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    if (!bakerId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/orders?bakerId=${bakerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(
            data
              .filter((o) => ["completed", "delivered"].includes((o.status || "").toLowerCase()))
              .map((o) => ({
                _id: o._id,
                name: o.flavor || "Custom Cake",
                customer: o.customerName || "Customer",
                date: new Date(o.createdAt || Date.now()).toDateString(),
                status: o.status || "Completed",
                price: o.price || 0,
              }))
          );
        } else {
          setError("No completed orders yet.");
        }
      })
      .catch(() => setError("Could not load orders from server."))
      .finally(() => setIsLoading(false));
  }, [API_BASE_URL, bakerId]);

  return (
    <div className="page">
      <header className="page-header orders-header">
        <div>
          <h1 className="page-title">Completed Orders</h1>
          <p className="page-subtitle">
            {isLoading ? "Loading orders..." : `${orders.length} completed`}
          </p>
        </div>
        <button className="pill-button" onClick={() => navigate("/orders")}>
          ← Back to All Orders
        </button>
      </header>

      {error && <div className="info-box-blue" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="card">
        <div className="table">
          <div className="table-header">
            <span>Order Details</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Status</span>
            <span>Price</span>
            <span />
          </div>
          {orders.map((o) => (
            <div key={o._id} className="table-row">
              <div>
                <div className="order-title">{o.name}</div>
                <div className="table-sub">Order #{o._id}</div>
              </div>
              <span>{o.customer}</span>
              <span>{o.date}</span>
              <span className="status-pill green-pill">Completed</span>
              <span className="order-price">${o.price}</span>
              <button
                className="pill-button"
                onClick={() => navigate(`/orders/${o._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
          {!orders.length && !isLoading && (
            <div className="table-row">
              <span>No completed orders yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
