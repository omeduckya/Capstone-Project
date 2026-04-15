import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import wavingHandIcon from "../assets/waving-hand.svg";
import pendingActionsIcon from "../assets/pending-actions-rounded.svg";
import clockIcon from "../assets/clock.svg";
import completedIcon from "../assets/done-all-alt-round-light.svg";
import dollarIcon from "../assets/dollar.svg";
import viewIcon from "../assets/view.svg";
import { resolveImageUrl } from "../utils/imageUrls";

function normalizeStatus(status) {
  return (status || "pending").toLowerCase().replace(/_/g, " ");
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Date not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [bakerName, setBakerName] = useState("Baker");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bakerId, setBakerId] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setBakerName(parsed.name);
        setBakerId(parsed?.id || parsed?._id || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!bakerId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/orders?bakerId=${bakerId}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [API_BASE_URL, bakerId]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => normalizeStatus(order.status) === "pending").length;
    const inProgress = orders.filter((order) => normalizeStatus(order.status) === "in progress").length;
    const completed = orders.filter((order) => normalizeStatus(order.status) === "completed").length;
    const revenue = orders
      .filter((order) => normalizeStatus(order.status) === "completed")
      .reduce((sum, order) => sum + Number(order.price || 0), 0);
    return { pending, inProgress, completed, revenue };
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => normalizeStatus(order.status) === "pending").slice(0, 3),
    [orders]
  );
  const progressOrders = useMemo(
    () => orders.filter((order) => normalizeStatus(order.status) === "in progress").slice(0, 3),
    [orders]
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle greeting-line">
            Hello, {bakerName}!
            <img src={wavingHandIcon} alt="" className="greeting-icon" />
          </p>
        </div>
      </header>

      <section className="stat-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <img src={pendingActionsIcon} alt="" className="dashboard-stat-icon-image" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{loading ? "..." : stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <img src={clockIcon} alt="" className="dashboard-stat-icon-image" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{loading ? "..." : stats.inProgress}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <img src={completedIcon} alt="" className="dashboard-stat-icon-image" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{loading ? "..." : stats.completed}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">
            <img src={dollarIcon} alt="" className="dashboard-stat-icon-image" />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Revenue</span>
            <span className="stat-value">{loading ? "..." : `$${stats.revenue}`}</span>
          </div>
        </div>
      </section>

      <section className="attention-banner">
        <div>
          <h3>{stats.pending ? `${stats.pending} Orders Need Your Attention` : "You are all caught up"}</h3>
          <p>
            {stats.pending
              ? "Review and respond to pending orders"
              : "New orders will show up here once customers start booking with you."}
          </p>
        </div>
        <div className="orders-header-actions">
          <button className="primary-btn" onClick={() => navigate("/orders/calendar")}>
            View Calendar
          </button>
          <button className="primary-btn" onClick={() => navigate("/orders")}>
            Review Orders
          </button>
        </div>
      </section>

      <section className="split-row">
        <div className="card">
          <div className="card-header">
            <h3>Pending Orders</h3>
            <button className="link-button card-header-link" onClick={() => navigate("/orders")}>
              <span>View All</span>
              <img src={viewIcon} alt="" className="card-header-link-icon" />
            </button>
          </div>
          <div className="order-list">
            {pendingOrders.map((order) => (
              <div key={order._id} className="order-item">
                <div
                  className="order-thumb"
                  style={
                    resolveImageUrl(API_BASE_URL, order?.mainImage || order?.galleryImages?.[0] || "")
                      ? {
                          backgroundImage: `url(${resolveImageUrl(API_BASE_URL, order?.mainImage || order?.galleryImages?.[0] || "")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <div className="order-main">
                  <div className="order-title">{order.name || order.flavor || "Custom Cake"}</div>
                  <div className="order-meta">
                    <span>{order.customerName || "Customer"}</span>
                    <span>{formatDate(order.deliveryDate || order.createdAt)}</span>
                  </div>
                </div>
                <div className="order-price">${Number(order.price || 0)}</div>
                <span className="status-pill blue-pill">Pending</span>
              </div>
            ))}
            {!loading && pendingOrders.length === 0 && (
              <p className="page-subtitle" style={{ margin: 0 }}>No pending orders right now.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>In Progress</h3>
            <button className="link-button card-header-link" onClick={() => navigate("/orders")}>
              <span>View All</span>
              <img src={viewIcon} alt="" className="card-header-link-icon" />
            </button>
          </div>
          <div className="order-list">
            {progressOrders.map((order) => (
              <div key={order._id} className="order-item">
                <div
                  className="order-thumb"
                  style={
                    resolveImageUrl(API_BASE_URL, order?.mainImage || order?.galleryImages?.[0] || "")
                      ? {
                          backgroundImage: `url(${resolveImageUrl(API_BASE_URL, order?.mainImage || order?.galleryImages?.[0] || "")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <div className="order-main">
                  <div className="order-title">{order.name || order.flavor || "Custom Cake"}</div>
                  <div className="order-meta">
                    <span>{order.customerName || "Customer"}</span>
                    <span>{formatDate(order.deliveryDate || order.createdAt)}</span>
                  </div>
                </div>
                <div className="order-price">${Number(order.price || 0)}</div>
                <span className="status-pill yellow-pill">{titleCase(order.status)}</span>
              </div>
            ))}
            {!loading && progressOrders.length === 0 && (
              <p className="page-subtitle" style={{ margin: 0 }}>Nothing is in progress yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
