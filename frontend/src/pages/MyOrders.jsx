import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import pendingStatusIcon from "../assets/pending-status.png";
import inProgressStatusIcon from "../assets/in-progress-status.png";
import completedStatusIcon from "../assets/completed-status.png";
import { resolveImageUrl } from "../utils/imageUrls";
import "./styles.css";

const cakeCache = new Map();

async function readApiJson(response, fallbackMessage) {
  const raw = await response.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(
      response.ok
        ? fallbackMessage
        : "The backend route is not ready yet. Please restart the backend server and try again."
    );
  }

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

function normalizeStatus(status) {
  return (status || "pending").toLowerCase().replace(/_/g, " ");
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCustomerId() {
  try {
    const stored = localStorage.getItem("customerUser");
    if (!stored) return "";
    const parsed = JSON.parse(stored);
    return parsed?.id || parsed?._id || "";
  } catch {
    return "";
  }
}

function formatDate(raw) {
  if (!raw) return "Date not set";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return String(raw);
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (Number.isNaN(amount)) return "$0";
  return `$${amount.toFixed(0)}`;
}

function formatMoneyOrFallback(value, fallback = "To be confirmed") {
  if (value === undefined || value === null || value === "") return fallback;
  const amount = Number(value);
  if (Number.isNaN(amount)) return fallback;
  return `$${amount.toFixed(0)}`;
}

function getDisplayPrice(order) {
  const status = normalizeStatus(order?.status);
  if (
    status === "adjusted" &&
    ["pending", undefined, null, ""].includes(order?.customerApprovalStatus) &&
    order?.proposedPrice !== undefined &&
    order?.proposedPrice !== null
  ) {
    return order.proposedPrice;
  }

  if (order?.price !== undefined && order?.price !== null && order?.price !== "") {
    return order.price;
  }

  return order?.cakeListing?.price ?? 0;
}

function getAdjustmentPrices(order) {
  return {
    previousPrice:
      order?.previousPrice ??
      order?.cakeListing?.price ??
      (order?.proposedPrice !== undefined && order?.proposedPrice !== null ? order?.price : undefined),
    proposedPrice:
      order?.proposedPrice ??
      (order?.customerApprovalStatus === "approved" ? order?.price : undefined) ??
      order?.price,
  };
}

function getBakerLabel(order) {
  if (order?.bakerName) return order.bakerName;
  if (order?.bakerId) return `Baker #${String(order.bakerId).slice(-6)}`;
  return "Baker not set";
}

function getProgressPercent(status) {
  const value = normalizeStatus(status);
  if (value === "pending") return 24;
  if (value === "accepted") return 40;
  if (value === "adjusted") return 52;
  if (value === "in progress") return 72;
  if (value === "ready for pickup" || value === "delivered") return 90;
  if (value === "completed") return 100;
  if (value === "declined") return 100;
  return 24;
}

function getStatusCopy(status) {
  const value = normalizeStatus(status);
  if (value === "adjusted") return "Your baker updated the price. Review it so they can keep going.";
  if (value === "in progress") return "Your cake is actively being made.";
  if (value === "accepted") return "Your baker accepted the order and locked in the plan.";
  if (value === "ready for pickup") return "Your cake is ready and waiting for pickup.";
  if (value === "delivered") return "Your cake was delivered successfully.";
  if (value === "declined") return "This request was declined. You can reorder from another baker anytime.";
  if (value === "completed") return "This order is wrapped up. You can leave a rating now.";
  return "Your baker is reviewing the order details.";
}

function buildOrderFacts(order) {
  return [
    { label: "Size", value: order?.size || "Not set" },
    { label: "Pickup date", value: formatDate(order?.deliveryDate || order?.createdAt) },
    { label: "Pickup time", value: order?.deliveryTime || "To be confirmed" },
    { label: "Custom message", value: order?.customMessage || "None added" },
  ];
}

function buildReorderDraft(order) {
  return {
    cakeId: order?.cakeId || "",
    bakerId: order?.bakerId || "",
    bakerName: order?.bakerName || "",
    cakeName: order?.cakeListing?.name || order?.name || order?.flavor || "Custom cake",
    cakeDescription: order?.cakeListing?.description || order?.description || "",
    cakeImage:
      order?.cakeListing?.mainImage ||
      order?.cakeListing?.galleryImages?.[0] ||
      order?.mainImage ||
      order?.galleryImages?.[0] ||
      "",
    flavour: order?.flavor || order?.cakeListing?.flavor || "Custom",
    shape: order?.shape || order?.cakeListing?.shape || "Round",
    size: order?.size || order?.cakeListing?.size || "8 inches",
    price: order?.price ?? order?.cakeListing?.price ?? "",
    deliveryDate: order?.deliveryDate || "",
    deliveryTime: order?.deliveryTime || "",
    inspirationImage: "",
    referenceImage: "",
    customerInstructions: order?.customerInstructions || "",
    message: order?.customMessage || "",
    colorNotes: order?.colorNotes || "",
    dietaryNotes: order?.dietaryNotes || "",
    rushOrder: Boolean(order?.rushOrder),
    fillings:
      order?.filling
        ? [order.filling]
        : Array.isArray(order?.fillings) && order.fillings.length
          ? order.fillings
          : [],
    tiers: order?.tiers || "1",
    frosting: order?.frosting || "",
    notes: order?.notes || "",
    customizationOptions: {
      allowCustomMessage: Boolean(order?.allowCustomMessage || order?.cakeListing?.allowCustomMessage),
      allowColorCustomization: Boolean(order?.allowColorCustomization || order?.cakeListing?.allowColorCustomization),
      availableForRushOrders: Boolean(order?.availableForRushOrders || order?.cakeListing?.availableForRushOrders),
      dietaryOptionsAvailable: Boolean(order?.dietaryOptionsAvailable || order?.cakeListing?.dietaryOptionsAvailable),
    },
  };
}

function renderStars(value) {
  return "★★★★★".slice(0, value) + "☆☆☆☆☆".slice(0, 5 - value);
}

function OrderModal({ children, className = "", onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card my-orders-modal-card ${className}`.trim()} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function RatingPicker({ label, value, onChange }) {
  return (
    <div className="my-orders-rating-block">
      <div className="my-orders-rating-label-row">
        <span className="my-orders-rating-label">{label}</span>
        <strong>{value ? `${value}/5` : "Not rated yet"}</strong>
      </div>
      <div className="my-orders-stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`my-orders-star-btn ${star <= value ? "active" : ""}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const customerId = getCustomerId();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingDraft, setRatingDraft] = useState({ cakeRating: 0, bakerRating: 0, reviewNote: "" });
  const [savingRating, setSavingRating] = useState(false);

  const refreshOrders = async () => {
    const res = await fetch(`${API_BASE_URL}/api/orders?customerId=${customerId}`);
    const data = await readApiJson(res, "Could not load your orders.");
    if (!Array.isArray(data)) {
      throw new Error("Could not load your orders.");
    }

    const ordersNeedingCakeFetch = data.filter(
      (order) =>
        order?.cakeId &&
        (!order?.name || !order?.mainImage || order?.price === undefined || order?.price === null || order?.price === "")
    );

    const missingCakeIds = [...new Set(ordersNeedingCakeFetch.map((order) => order.cakeId).filter(Boolean))].filter(
      (cakeId) => !cakeCache.has(cakeId)
    );

    await Promise.all(
      missingCakeIds.map(async (cakeId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/cakes/${cakeId}`);
          if (!response.ok) return;
          const cake = await readApiJson(response, "Could not load the cake details.");
          cakeCache.set(cakeId, cake);
        } catch {
          /* ignore */
        }
      })
    );

    const enrichedOrders = data.map((order) => {
      const cakeListing = cakeCache.get(order?.cakeId);
      return cakeListing ? { ...order, cakeListing } : order;
    });

    setOrders(enrichedOrders);
    setSelectedOrder((current) => enrichedOrders.find((order) => order._id === current?._id) || null);
    setRatingOrder((current) => enrichedOrders.find((order) => order._id === current?._id) || null);
  };

  useEffect(() => {
    if (!customerId) {
      setError("Sign in as a customer to see your orders.");
      return;
    }

    setIsLoading(true);
    setError("");
    refreshOrders()
      .catch(() => {
        setError("Could not load your orders.");
        setOrders([]);
      })
      .finally(() => setIsLoading(false));
  }, [API_BASE_URL, customerId]);

  const activeOrders = useMemo(
    () => orders.filter((order) => !["completed", "declined", "delivered"].includes(normalizeStatus(order.status))),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter((order) => ["completed", "declined", "delivered"].includes(normalizeStatus(order.status))),
    [orders]
  );

  const stats = useMemo(
    () => [
      {
        label: "Pending",
        value: orders.filter((order) => normalizeStatus(order.status) === "pending").length,
        colorClass: "blue-bg",
        icon: pendingStatusIcon,
      },
      {
        label: "In Progress",
        value: orders.filter((order) => ["accepted", "adjusted", "in progress", "ready for pickup"].includes(normalizeStatus(order.status))).length,
        colorClass: "orange-bg",
        icon: inProgressStatusIcon,
      },
      {
        label: "Completed",
        value: orders.filter((order) => ["completed", "delivered"].includes(normalizeStatus(order.status))).length,
        colorClass: "green-bg",
        icon: completedStatusIcon,
      },
    ],
    [orders]
  );

  const statusTone = (status) => {
    const value = normalizeStatus(status);
    if (value === "completed" || value === "delivered") return "green";
    if (value === "adjusted" || value === "in progress" || value === "accepted" || value === "ready for pickup") return "warm";
    if (value === "declined") return "red-pill";
    return "cool";
  };

  const handleCustomerResponse = async (orderId, action) => {
    try {
      setActioningId(orderId);
      setError("");
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/customer-response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await readApiJson(res, "Could not update the order.");
      await refreshOrders();
    } catch (err) {
      setError(err.message || "Could not update the order.");
    } finally {
      setActioningId("");
    }
  };

  const openRatingModal = (order) => {
    setRatingOrder(order);
    setRatingDraft({
      cakeRating: Number(order?.cakeRating || 0),
      bakerRating: Number(order?.bakerRating || 0),
      reviewNote: order?.reviewNote || "",
    });
  };

  const submitRating = async () => {
    if (!ratingOrder?._id) return;
    try {
      setSavingRating(true);
      setError("");
      let saved = false;
      const targets = [
        `${API_BASE_URL}/api/orders/${ratingOrder._id}/review`,
        `${API_BASE_URL}/api/orders/${ratingOrder._id}`,
      ];

      for (const url of targets) {
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ratingDraft),
          });
          await readApiJson(res, "Could not save your rating.");
          saved = true;
          break;
        } catch (err) {
          if (url === targets[targets.length - 1]) {
            throw err;
          }
        }
      }

      if (!saved) {
        throw new Error("Could not save your rating.");
      }

      setRatingOrder(null);
      await refreshOrders();
    } catch (err) {
      setError(err.message || "Could not save your rating.");
    } finally {
      setSavingRating(false);
    }
  };

  const renderOrderImage = (order, fallbackLabel) => {
    const imageUrl = resolveImageUrl(
      API_BASE_URL,
      order?.cakeListing?.mainImage ||
        order?.cakeListing?.galleryImages?.[0] ||
        order?.mainImage ||
        order?.galleryImages?.[0] ||
        ""
    );

    if (imageUrl) {
      return <img src={imageUrl} alt={order?.name || fallbackLabel} className="order-img-rect refined" />;
    }

    return <div className="my-order-image-fallback">{fallbackLabel.slice(0, 1)}</div>;
  };

  const handleReorder = (order) => {
    const draft = buildReorderDraft(order);
    try {
      sessionStorage.setItem("orderDraft", JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    navigate(`/baker/${order?.bakerId || draft.bakerId || ""}/checkout${draft.cakeId ? `?cakeId=${draft.cakeId}` : ""}`);
  };

  return (
    <div className="page-container">
      <header className="white-header-box my-orders-header">
        <div className="header-text">
          <h1 className="page-title">My Orders</h1>
        </div>
      </header>

      <div className="content-scroll-area my-orders-surface">
        {error && <div className="auth-error-text" style={{ marginBottom: 16 }}>{error}</div>}

        <section className="my-orders-summary-shell">
          <div className="status-summary-row">
            {stats.map((stat) => (
              <article key={stat.label} className="status-card-mini elevated my-orders-stat-card">
                <div className={`status-icon-bg ${stat.colorClass}`}>
                  <img src={stat.icon} alt="" className="status-icon-image" />
                </div>
                <div className="status-info">
                  <p>{stat.label}</p>
                  <h3>{stat.value}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="my-orders-section-block">
          <div className="my-orders-section-head">
            <h2 className="section-title">Active Orders</h2>
            <button type="button" className="btn-outline-gray my-orders-head-btn" onClick={() => navigate("/home")}>
              Browse cakes
            </button>
          </div>

          <div className="active-orders-stack">
            {activeOrders.map((order) => {
              const cakeName = order?.cakeListing?.name || order?.name || order?.flavor || "Custom cake";
              const bakerLabel = getBakerLabel(order);
              const displayPrice = getDisplayPrice(order);
              const { previousPrice, proposedPrice } = getAdjustmentPrices(order);
              const hasPendingAdjustment =
                normalizeStatus(order?.status) === "adjusted" &&
                ["pending", undefined, null, ""].includes(order?.customerApprovalStatus);

              return (
                <article key={order._id} className="active-order-card refined-order-card my-orders-gallery-card">
                  <div className="order-flex my-orders-gallery-layout">
                    <div className="my-orders-image-wrap">{renderOrderImage(order, cakeName)}</div>

                    <div className="order-details-main">
                      <div className="order-row-between my-orders-title-row">
                        <div>
                          <h3>{cakeName}</h3>
                          <p className="baker-name-sub">by {bakerLabel}</p>
                        </div>
                        <div className="order-price-block">
                          <span className="order-price-large">{formatMoney(displayPrice)}</span>
                          <span className="order-id-label">Order #{String(order?._id || "").slice(-6)}</span>
                        </div>
                      </div>

                      <div className="my-orders-chip-row">
                        <span className={`status-pill-figma ${statusTone(order.status)}`}>
                          {titleCase(order.status || "pending")}
                        </span>
                      </div>

                      <p className="order-summary-copy my-orders-copy">{getStatusCopy(order?.status)}</p>

                      {hasPendingAdjustment && (
                        <div className="my-orders-adjustment-banner">
                          <div>
                            <div className="my-orders-adjustment-title">New price waiting for your approval</div>
                            <div className="my-orders-adjustment-copy">
                              Was {formatMoneyOrFallback(previousPrice)} | Now {formatMoneyOrFallback(proposedPrice)}
                              {order?.adjustmentReason ? ` | ${order.adjustmentReason}` : ""}
                            </div>
                          </div>
                          <div className="my-orders-adjustment-actions">
                            <button
                              type="button"
                              className="my-orders-adjust-btn approve"
                              disabled={actioningId === order._id}
                              onClick={() => handleCustomerResponse(order._id, "approve")}
                            >
                              {actioningId === order._id ? "Updating..." : "Approve new price"}
                            </button>
                            <button
                              type="button"
                              className="my-orders-adjust-btn decline"
                              disabled={actioningId === order._id}
                              onClick={() => handleCustomerResponse(order._id, "decline")}
                            >
                              Decline order
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="my-orders-facts-grid">
                        <div className="my-orders-fact-tile">
                          <span className="my-orders-meta-label">Placed</span>
                          <strong>{formatDate(order?.createdAt)}</strong>
                        </div>
                        {buildOrderFacts(order).map((fact) => (
                          <div key={fact.label} className="my-orders-fact-tile">
                            <span className="my-orders-meta-label">{fact.label}</span>
                            <strong>{fact.value}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="progress-container compact my-orders-progress-wrap">
                        <div className="progress-bar-track">
                          <div className="progress-fill" style={{ width: `${getProgressPercent(order?.status)}%` }} />
                        </div>
                        <div className="progress-labels">
                          <span>Placed</span>
                          <span>In progress</span>
                          <span>Done</span>
                        </div>
                      </div>

                      <div className="my-orders-actions-row">
                        <button type="button" className="btn-pink-full" onClick={() => setSelectedOrder(order)}>
                          View order details
                        </button>
                        <button type="button" className="btn-outline-gray" onClick={() => navigate(`/baker/${order?.bakerId || ""}`)}>
                          View baker
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {!isLoading && !error && activeOrders.length === 0 && (
              <div className="card my-orders-empty-card">
                <h3 className="card-title">No active orders yet</h3>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>
                  Once you place an order, it will show up here with the full cake details and progress updates.
                </p>
                <button className="primary-btn" type="button" onClick={() => navigate("/home")}>
                  Find bakers
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="my-orders-section-block">
          <div className="my-orders-section-head">
            <h2 className="section-title">Completed & Past Orders</h2>
          </div>

          <div className="history-grid-figma">
            {historyOrders.map((order) => {
              const cakeName = order?.cakeListing?.name || order?.name || order?.flavor || "Custom cake";
              const imageUrl = resolveImageUrl(
                API_BASE_URL,
                order?.cakeListing?.mainImage ||
                  order?.cakeListing?.galleryImages?.[0] ||
                  order?.mainImage ||
                  order?.galleryImages?.[0] ||
                  ""
              );
              const bakerLabel = getBakerLabel(order);
              const displayPrice = getDisplayPrice(order);
              const hasReview = Boolean(order?.cakeRating || order?.bakerRating);

              return (
                <article key={order._id} className="history-card-figma polished-history-card my-orders-history-card">
                  <div className="history-img-container my-orders-history-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={cakeName} />
                    ) : (
                      <div className="my-order-image-fallback large">{cakeName.slice(0, 1)}</div>
                    )}
                    <span className={`history-status-badge ${normalizeStatus(order?.status) === "completed" ? "completed-badge" : "declined-badge"}`}>
                      {titleCase(order?.status || "completed")}
                    </span>
                  </div>

                  <div className="history-details">
                    <div className="history-header">
                      <h4>{cakeName}</h4>
                      <p>by {bakerLabel}</p>
                    </div>

                    <div className="history-meta">
                      <span className="delivery-text">
                        {normalizeStatus(order?.status) === "completed" ? "Completed" : "Closed"}
                        <br />
                        {formatDate(order?.deliveryDate || order?.createdAt)}
                      </span>
                      <span className="history-price">{formatMoney(displayPrice)}</span>
                    </div>

                    {hasReview && (
                      <div className="my-orders-review-summary">
                        {order?.cakeRating ? <span>Cake {renderStars(order.cakeRating)}</span> : null}
                        {order?.bakerRating ? <span>Baker {renderStars(order.bakerRating)}</span> : null}
                      </div>
                    )}

                    <div className="my-orders-history-actions">
                      <button type="button" className="btn-outline-gray" onClick={() => setSelectedOrder(order)}>
                        View details
                      </button>
                      {normalizeStatus(order?.status) === "declined" ? (
                        <button type="button" className="btn-pink-full my-orders-reorder-btn" onClick={() => handleReorder(order)}>
                          Order again
                        </button>
                      ) : (
                        <button type="button" className="btn-pink-full" onClick={() => openRatingModal(order)}>
                          {hasReview ? "Edit rating" : "Rate cake or baker"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {!isLoading && !error && historyOrders.length === 0 && (
              <div className="card my-orders-empty-card">
                <h3 className="card-title">No past orders yet</h3>
                <p className="card-subtitle">Completed orders will move here once they are finished.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedOrder && (
        <OrderModal className="my-orders-detail-modal" onClose={() => setSelectedOrder(null)}>
          <div className="my-orders-detail-top">
            <div>
              <h2 className="modal-h2 my-orders-modal-title">
                {selectedOrder?.cakeListing?.name || selectedOrder?.name || selectedOrder?.flavor || "Custom cake"}
              </h2>
              <p className="modal-p my-orders-modal-subtitle">by {getBakerLabel(selectedOrder)}</p>
            </div>
            <button type="button" className="secondary-btn" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>

          <div className="my-orders-detail-grid">
            <div className="my-orders-detail-visual">
              {renderOrderImage(
                selectedOrder,
                selectedOrder?.cakeListing?.name || selectedOrder?.name || selectedOrder?.flavor || "Cake"
              )}
            </div>

            <div className="my-orders-detail-copy">
              <div className="my-orders-detail-hero">
                <div className="my-orders-detail-summary-row">
                  <span className={`status-pill-figma ${statusTone(selectedOrder?.status)}`}>
                    {titleCase(selectedOrder?.status || "pending")}
                  </span>
                  <strong className="my-orders-detail-price">{formatMoney(getDisplayPrice(selectedOrder))}</strong>
                </div>
                <p className="my-orders-detail-support">
                  Order #{String(selectedOrder?._id || "").slice(-6)} • Placed {formatDate(selectedOrder?.createdAt)}
                </p>
                <p className="my-orders-detail-description">{getStatusCopy(selectedOrder?.status)}</p>
              </div>

              <div className="my-orders-detail-section">
                <h3 className="my-orders-detail-section-title">Cake details</h3>
                <div className="my-orders-detail-facts">
                  <div className="my-orders-detail-fact"><span>Cake</span><strong>{selectedOrder?.cakeListing?.name || selectedOrder?.name || "Custom cake"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Size</span><strong>{selectedOrder?.size || "Not set"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Pickup date</span><strong>{formatDate(selectedOrder?.deliveryDate || selectedOrder?.createdAt)}</strong></div>
                  <div className="my-orders-detail-fact"><span>Pickup time</span><strong>{selectedOrder?.deliveryTime || "To be confirmed"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Flavour</span><strong>{selectedOrder?.flavor || "Not set"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Filling</span><strong>{selectedOrder?.filling || selectedOrder?.fillings?.[0] || "Not set"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Frosting</span><strong>{selectedOrder?.frosting || "Not set"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Shape</span><strong>{selectedOrder?.shape || "Not set"}</strong></div>
                </div>
              </div>

              <div className="my-orders-detail-section">
                <h3 className="my-orders-detail-section-title">Your request</h3>
                <div className="my-orders-detail-facts">
                  <div className="my-orders-detail-fact"><span>Custom message</span><strong>{selectedOrder?.customMessage || "None added"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Special notes</span><strong>{selectedOrder?.customerInstructions || "None added"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Delivery method</span><strong>{selectedOrder?.deliveryMethod || "Pickup"}</strong></div>
                  <div className="my-orders-detail-fact"><span>Baker</span><strong>{getBakerLabel(selectedOrder)}</strong></div>
                </div>
              </div>

              <div className="my-orders-detail-actions">
                <button type="button" className="btn-outline-gray" onClick={() => navigate(`/baker/${selectedOrder?.bakerId || ""}`)}>
                  View baker
                </button>
                {["completed", "delivered"].includes(normalizeStatus(selectedOrder?.status)) && (
                  <button type="button" className="btn-pink-full" onClick={() => openRatingModal(selectedOrder)}>
                    {selectedOrder?.cakeRating || selectedOrder?.bakerRating ? "Edit rating" : "Rate cake or baker"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </OrderModal>
      )}

      {ratingOrder && (
        <OrderModal className="my-orders-rating-modal" onClose={() => setRatingOrder(null)}>
          <div className="my-orders-detail-top">
            <div>
              <h2 className="modal-h2 my-orders-modal-title">Rate your order</h2>
              <p className="modal-p my-orders-modal-subtitle">
                Share how the cake turned out and how the baker experience felt.
              </p>
            </div>
            <button type="button" className="secondary-btn" onClick={() => setRatingOrder(null)}>
              Close
            </button>
          </div>

          <div className="my-orders-rating-layout">
            <RatingPicker
              label="Cake rating"
              value={ratingDraft.cakeRating}
              onChange={(value) => setRatingDraft((current) => ({ ...current, cakeRating: value }))}
            />
            <RatingPicker
              label="Baker rating"
              value={ratingDraft.bakerRating}
              onChange={(value) => setRatingDraft((current) => ({ ...current, bakerRating: value }))}
            />
            <div className="field my-orders-rating-note">
              <label className="field-label">Optional note</label>
              <textarea
                className="textarea"
                rows="4"
                placeholder="Tell us what you loved or what could have been better."
                value={ratingDraft.reviewNote}
                onChange={(event) => setRatingDraft((current) => ({ ...current, reviewNote: event.target.value }))}
              />
            </div>
          </div>

          <div className="my-orders-rating-actions">
            <button type="button" className="secondary-btn" onClick={() => setRatingOrder(null)}>
              Cancel
            </button>
            <button type="button" className="btn-pink-full" disabled={savingRating} onClick={submitRating}>
              {savingRating ? "Saving..." : "Save rating"}
            </button>
          </div>
        </OrderModal>
      )}
    </div>
  );
}
