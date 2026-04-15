// src/pages/AllOrders.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../assets/search-icon.svg";
import { resolveCustomerAvatar } from "../utils/customerAvatar";
import "./styles.css";

function normalizeStatus(status) {
  return (status || "pending").toLowerCase().replace(/_/g, " ");
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseOrderDate(order) {
  const raw = order.deliveryDate || order.pickupDate || order.date || order.createdAt;
  if (!raw) return new Date();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toOrderViewModel(order) {
  const orderDate = parseOrderDate(order);
  const rawStatus = normalizeStatus(order.rawStatus || order.status);
  const displayStatus =
    rawStatus === "pending" && order?.customerApprovalStatus === "approved"
      ? "Customer Approved"
      : titleCase(rawStatus);

  return {
    _id: order._id,
    name: order.name || order.flavor || "Custom Cake",
    customer: order.customer || order.customerName || "Customer",
    customerPhoto: order.customerPhoto || "",
    customerAvatarPreset: order.customerAvatarPreset || "",
    date: orderDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    rawStatus,
    customerApprovalStatus: order?.customerApprovalStatus || "",
    status: displayStatus,
    price: Number(order.price || 0),
  };
}

export default function AllOrders() {
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
  const [filter, setFilter] = useState("all");

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
          setOrders(data.map(toOrderViewModel));
        } else {
          setError("Could not load orders from server.");
          setOrders([]);
        }
      })
      .catch(() => {
        setError("Could not load orders from server.");
        setOrders([]);
      })
      .finally(() => setIsLoading(false));
  }, [API_BASE_URL, bakerId]);

  const filteredOrders = useMemo(() => {
    return filter === "all" ? orders : orders.filter((order) => order.rawStatus === filter);
  }, [filter, orders]);

  const statusClass = (status) => {
    const value = normalizeStatus(status);
    if (value === "accepted" || value === "completed" || value === "delivered") return "status-pill green-pill";
    if (value === "adjusted") return "status-pill orange-pill";
    if (value === "ready for pickup") return "status-pill orange-pill";
    if (value === "in progress") return "status-pill yellow-pill";
    if (value === "declined") return "status-pill red-pill";
    return "status-pill blue-pill";
  };

  const rowStatusClass = (order) => {
    if (order?.rawStatus === "pending" && order?.customerApprovalStatus === "approved") {
      return "status-pill green-pill";
    }
    return statusClass(order?.rawStatus);
  };

  return (
    <div className="page">
      <header className="page-header orders-header">
        <div>
          <h1 className="page-title">All Orders</h1>
          <p className="page-subtitle">
            {isLoading ? "Loading orders..." : `${orders.length} total orders`}
          </p>
        </div>
        <div className="orders-header-actions">
          <button className="primary-btn" onClick={() => navigate("/orders/calendar")}>
            Open Calendar
          </button>
          <div className="search-input-shell">
            <img src={searchIcon} alt="Search" className="search-icon-img" />
            <input
              className="search-input"
              placeholder="Search orders..."
              type="search"
            />
          </div>
        </div>
      </header>

      {error && <div className="info-box-blue" style={{ marginBottom: 12 }}>{error}</div>}
      <section className="stat-row">
        <button
          className={filter === "all" ? "stat-pill active" : "stat-pill"}
          onClick={() => setFilter("all")}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={filter === "pending" ? "stat-pill blue-pill" : "stat-pill"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "in progress" ? "stat-pill yellow-pill" : "stat-pill"}
          onClick={() => setFilter("in progress")}
        >
          In Progress
        </button>
        <button
          className={filter === "accepted" ? "stat-pill green-pill" : "stat-pill"}
          onClick={() => setFilter("accepted")}
        >
          Accepted
        </button>
        <button
          className={filter === "adjusted" ? "stat-pill orange-pill" : "stat-pill"}
          onClick={() => setFilter("adjusted")}
        >
          Awaiting Customer
        </button>
        <button
          className={filter === "declined" ? "stat-pill red-pill" : "stat-pill"}
          onClick={() => setFilter("declined")}
        >
          Declined
        </button>
        <button
          className={filter === "completed" ? "stat-pill green-pill" : "stat-pill"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
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
          {filteredOrders.map((order) => (
            <div key={order._id} className="table-row">
              <div>
                <div className="order-title">{order.name}</div>
                <div className="table-sub">Order #{order._id}</div>
              </div>
              <span className="customer-order-cell">
                <span className="customer-order-avatar">
                  {resolveCustomerAvatar(API_BASE_URL, order.customerPhoto, order.customerAvatarPreset) ? (
                    <img
                      src={resolveCustomerAvatar(API_BASE_URL, order.customerPhoto, order.customerAvatarPreset)}
                      alt={order.customer}
                    />
                  ) : (
                    <span>{String(order.customer || "C").charAt(0).toUpperCase()}</span>
                  )}
                </span>
                <span>{order.customer}</span>
              </span>
              <span>{order.date}</span>
              <span className={rowStatusClass(order)}>{order.status}</span>
              <span className="order-price">${order.price}</span>
              <button
                className="pill-button"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
          {!filteredOrders.length && (
            <div className="table-row">
              <span>No orders match your current filters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
