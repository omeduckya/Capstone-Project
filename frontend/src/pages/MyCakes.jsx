import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";

function formatPrice(val) {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return "$—";
  return `$${Number(val).toFixed(0)}`;
}

function formatRevenue(val) {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return "$—";
  return `$${Number(val).toLocaleString()}`;
}

function getBakerId() {
  try {
    const stored = localStorage.getItem("bakerUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.id || parsed?._id || "";
    }
  } catch {
    /* ignore */
  }
  return localStorage.getItem("id") || "";
}

function normalizeImage(apiBase, cake) {
  const raw =
    cake.mainImage ||
    cake.imageUrl ||
    (Array.isArray(cake.galleryImages) ? cake.galleryImages[0] : null);
  return resolveImageUrl(apiBase, raw);
}

export default function MyCakes() {
  const navigate = useNavigate();
  const [cakes, setCakes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const bakerId = getBakerId();

  useEffect(() => {
    if (!bakerId) return;
    setIsLoading(true);
    setLoadError("");
    fetch(`${API_BASE_URL}/api/cakes?userId=${bakerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCakes(data);
          if (!data.length) {
            setLoadError("No cakes listed yet. Add your first cake to start selling.");
          }
        } else {
          setLoadError("Could not load cakes from server.");
          setCakes([]);
        }
      })
      .catch(() => {
        setLoadError("Could not reach the server.");
        setCakes([]);
      })
      .finally(() => setIsLoading(false));
  }, [API_BASE_URL, bakerId]);

  const stats = useMemo(() => {
    const totalCakes = cakes.length;
    const totalOrders = cakes.reduce((sum, c) => sum + (c.orders || 0), 0);
    const avgRating =
      cakes.length === 0
        ? 0
        : cakes.reduce((sum, c) => sum + (c.rating || 0), 0) / cakes.length;
    const revenue = cakes.reduce(
      (sum, c) => sum + (c.revenue || (c.price || 0) * (c.orders || 0)),
      0
    );
    return {
      totalCakes,
      totalOrders,
      avgRating: avgRating ? avgRating.toFixed(1) : "0.0",
      revenue,
    };
  }, [cakes]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Cake Gallery</h1>
          <p className="page-subtitle">
            {isLoading ? "Loading your cakes..." : "Manage and showcase your creations"}
          </p>
        </div>
        <button className="primary-btn" onClick={() => navigate("/cakes/new")}>
          + Add New Cake
        </button>
      </header>
<section className="stat-row">
        <div className="stat-card small">
          <span className="stat-label">Total Cakes</span>
          <span className="stat-value">{stats.totalCakes}</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{stats.totalOrders}</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Avg. Rating</span>
          <span className="stat-value">{stats.avgRating} ?</span>
        </div>
        <div className="stat-card small">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatRevenue(stats.revenue)}</span>
        </div>
      </section>

      <section className="grid-cards">
        {cakes.map((cake) => (
          <article key={cake._id} className="cake-card">
            <div
              className="cake-thumb"
              style={
                normalizeImage(API_BASE_URL, cake)
                  ? {
                      backgroundImage: `url(${normalizeImage(API_BASE_URL, cake)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="cake-body">
              <div className="cake-header">
                <h3>{cake.name || "Untitled Cake"}</h3>
                <span className="cake-price">{formatPrice(cake.price)}</span>
              </div>
              <div className="cake-metrics">
                <div className="badge">{cake.orders ? `${cake.orders} orders` : "— orders"}</div>
                <div className="badge">? {cake.rating || "—"}</div>
              </div>
              <div className="cake-footer">
                <span className="revenue-label">Total Revenue</span>
                <span className="revenue-value">
                  {formatRevenue(cake.revenue || (cake.price || 0) * (cake.orders || 0))}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 14 }}>
              <Link className="pill-button centered" to={`/cakes/${cake._id}/edit`}>
                Edit Cake
              </Link>
            </div>
          </article>
        ))}

        {!isLoading && cakes.length === 0 && (
          <article className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <h3 className="card-title">No cakes listed yet</h3>
            <p className="card-subtitle" style={{ marginBottom: 18 }}>
              Add your first cake to build your storefront and start taking orders.
            </p>
            <button className="primary-btn" type="button" onClick={() => navigate("/cakes/new")}>
              Add First Cake
            </button>
          </article>
        )}
      </section>
    </div>
  );
}

