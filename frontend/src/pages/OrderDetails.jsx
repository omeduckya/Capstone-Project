// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.css";
import { resolveCustomerAvatar } from "../utils/customerAvatar";
import completedIcon from "../assets/done-all-alt-round-light.svg";
import readyCakeIcon from "../assets/ready-cake.svg";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [order, setOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'accept', 'adjust', 'decline'
  const [isSuccess, setIsSuccess] = useState(false);
  const [adjustPrice, setAdjustPrice] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedReference, setSelectedReference] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_BASE_URL}/api/orders/order/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setAdjustPrice(data?.price ?? "");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Failed to load order.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [API_BASE_URL, id]);

  const closeModal = () => {
    setActiveModal(null);
    setIsSuccess(false);
    setAdjustReason("");
    setDeclineReason("");
  };

  const updateOrder = async (payload) => {
    if (!id) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setOrder(data);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    }
  };

  const handleAccept = () => updateOrder({ status: "accepted" });

  const handleAdjust = () => {
    if (adjustPrice === "" || Number.isNaN(Number(adjustPrice))) {
      setError("Enter a valid price.");
      return;
    }
    updateOrder({
      status: "adjusted",
      price: Number(adjustPrice),
      adjustmentReason: adjustReason,
    });
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      setError("Please provide a reason to decline.");
      return;
    }
    updateOrder({ status: "declined", adjustmentReason: declineReason });
  };

  const handleStartProgress = () => updateOrder({ status: "in progress" });
  const handleReadyForPickup = () => updateOrder({ status: "ready for pickup" });
  const handleComplete = () => updateOrder({ status: "completed" });

  const customerName = order?.customerName || "Customer Name";
  const customerEmail = order?.customerEmail || "customer@example.com";
  const customerPhone = order?.customerPhone || "N/A";
  const customerLocation = order?.customerLocation || "N/A";
  const customerAvatar = resolveCustomerAvatar(API_BASE_URL, order?.customerPhoto, order?.customerAvatarPreset);
  const deliveryDate = order?.deliveryDate || "Not set";
  const deliveryTime = order?.deliveryTime || "Not set";
  const deliveryMethod = order?.deliveryMethod || "Pickup at your shop";
  const notes = order?.customerInstructions || "No special instructions.";

  const references = [...new Set([
    ...(order?.inspirationImage ? [order.inspirationImage] : []),
    ...(order?.referenceImage ? [order.referenceImage] : []),
  ])];
  const cakePreviewImage =
    order?.mainImage ||
    (Array.isArray(order?.galleryImages) && order.galleryImages.length ? order.galleryImages[0] : "");
  const statusLower = String(order?.status || "pending").toLowerCase();
  const isPending = statusLower === "pending";
  const isDeclined = statusLower === "declined";
  const isAccepted = statusLower === "accepted";
  const isInProgress = statusLower === "in progress";
  const isCompleted = statusLower === "completed";
  const isAdjusted = statusLower === "adjusted";
  const isReadyForPickup = statusLower === "ready for pickup";
  const isDelivered = statusLower === "delivered";
  const customerApprovedAdjustment = order?.customerApprovalStatus === "approved";

  const canAdjust = isPending || isAccepted;
  const canAccept = isPending;
  const canDecline = isPending;
  const canProgress = isAccepted;
  const canComplete = isInProgress;
  const canReadyForPickup = isInProgress && (order?.deliveryMethod || "").toLowerCase() !== "delivery";
  const canDeliver = isInProgress && (order?.deliveryMethod || "").toLowerCase() === "delivery";

  return (
    <div className="page">
      <header className="page-header">
        <button className="icon-back" onClick={() => navigate(-1)} aria-label="Go back">&lt;</button>
        <div>
          <h1 className="page-title">Order #{id}</h1>
          <p className="page-subtitle">review order details and take action</p>
        </div>
      </header>

      {error && <p className="auth-error-text" style={{ marginBottom: 8 }}>{error}</p>}

      <div className="details-grid">
        <div className="details-main-content">
          <section className="card">
            <h3 className="card-title">Customer Information</h3>
            <div className="order-customer-summary">
              <div className="order-customer-avatar">
                {customerAvatar ? (
                  <img src={customerAvatar} alt={customerName} />
                ) : (
                  <span>{customerName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="order-title">{customerName}</div>
                <div className="table-sub">{customerEmail}</div>
              </div>
            </div>
            <div className="grid-2 gap-lg">
              <InfoTile label="Customer Name" value={customerName} />
              <InfoTile label="Phone Number" value={customerPhone} />
              <InfoTile label="Email Address" value={customerEmail} />
              <InfoTile label="Location" value={customerLocation} />
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Delivery Information</h3>
            <div className="grid-2 gap-lg">
              <InfoTile label="Delivery Date" value={deliveryDate} />
              <InfoTile label="Delivery Time" value={deliveryTime} />
              <InfoTile label="Delivery Method" value={deliveryMethod} />
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">Cake Specifications</h3>
            <div className="grid-3 tight">
              <InfoChip label="Cake Shape" value={order?.shape || "-"} />
              <InfoChip label="Size" value={order?.size || "-"} />
              <InfoChip label="Flavour" value={order?.flavor || "-"} />
              <InfoChip label="Filling" value={order?.filling || order?.fillings?.[0] || "-"} />
              <InfoChip label="Number of Tiers" value={order?.tiers || "-"} />
              <InfoChip label="Frosting" value={order?.frosting || "-"} />
              <InfoChip label="Servings" value={order?.servings || "-"} />
              <InfoChip label="Notes" value={order?.notes || "-"} />
            </div>
          </section>

          <section className="reference-compare-grid">
            <div className="card reference-compare-card">
              <h3 className="card-title">Ordered Cake Preview</h3>
              {cakePreviewImage ? (
                <div
                  className="image-placeholder image-placeholder-large"
                  style={{
                    backgroundImage: `url(${cakePreviewImage.startsWith("http") ? cakePreviewImage : `${API_BASE_URL}${cakePreviewImage}`})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="image-placeholder image-placeholder-large" />
              )}
            </div>

            <div className="card reference-compare-card">
              <h3 className="card-title">Design Reference Images</h3>
              <div className="image-strip reference-image-strip">
                {references.length === 0 && (
                  <div className="image-placeholder image-placeholder-large" />
                )}
                {references.map((url) => (
                  <button
                    key={url}
                    type="button"
                    className="image-placeholder image-placeholder-button"
                    onClick={() => setSelectedReference(url.startsWith("http") ? url : `${API_BASE_URL}${url}`)}
                    style={{
                      backgroundImage: `url(${url.startsWith("http") ? url : `${API_BASE_URL}${url}`})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
              {references.length > 0 && (
                <p className="page-subtitle" style={{ marginTop: 12, marginBottom: 0 }}>
                  Click any reference image to open it full size.
                </p>
              )}
              {references.length === 0 && (
                <p className="page-subtitle" style={{ marginTop: 12, marginBottom: 0 }}>
                  The customer did not upload an inspiration image for this order.
                </p>
              )}
            </div>
          </section>

          <section className="card note-card">
            <h3 className="card-title">Special Instructions</h3>
            <p className="note-text">{notes}</p>
          </section>
        </div>

        <aside className="order-side">
          <section className="card">
            <h3 className="card-title">Order Status</h3>
            <span
              className={`status-pill ${
                statusLower === "in progress"
                  ? "yellow-pill"
                  : statusLower === "adjusted"
                  ? "orange-pill"
                  : statusLower === "ready for pickup"
                  ? "orange-pill"
                  : statusLower === "declined"
                  ? "red-pill"
                  : statusLower === "completed" || statusLower === "delivered"
                  ? "green-pill"
                  : "blue-pill"
              } large`}
            >
              {order?.status || "Pending Review"}
            </span>
            {customerApprovedAdjustment && isPending && (
              <div className="info-box-blue" style={{ marginTop: 12 }}>
                Customer approved your updated price. You can accept this order and continue now.
              </div>
            )}
          </section>

          <section className="card">
            <h3 className="card-title">Price Breakdown</h3>
            {order?.previousPrice && order?.customerApprovalStatus === "approved" && (
              <div className="price-row"><span>Original Price</span><span>${order.previousPrice}</span></div>
            )}
            <div className="price-row"><span>Order Price</span><span>${order?.price ?? 0}</span></div>
            <div className="price-row total"><span>Total</span><span>${order?.price ?? 0}</span></div>
          </section>

          <section className="card action-card">
            {customerApprovedAdjustment && isPending && (
              <div className="info-box-blue" style={{ marginBottom: 10 }}>
                The customer approved your updated price. Accept the order to continue.
              </div>
            )}
            {isPending && (
              <>
                <button
                  className="action-btn green"
                  onClick={() => setActiveModal('accept')}
                  disabled={loading || !canAccept}
                >
                  {customerApprovedAdjustment ? "Confirm & Accept Order" : "Accept Order"}
                </button>
                <button
                  className="action-btn yellow"
                  onClick={() => setActiveModal('adjust')}
                  disabled={loading || !canAdjust}
                >
                  Adjust Price
                </button>
                <button
                  className="action-btn red"
                  onClick={() => setActiveModal('decline')}
                  disabled={loading || !canDecline}
                >
                  Decline Order
                </button>
              </>
            )}

            {isAccepted && (
              <>
                <button
                  className="action-btn yellow"
                  onClick={() => setActiveModal('adjust')}
                  disabled={loading || !canAdjust}
                >
                  Adjust Price
                </button>
                <button
                  className="action-btn yellow"
                  onClick={handleStartProgress}
                  disabled={loading || !canProgress}
                >
                  Move to In Progress
                </button>
              </>
            )}

            {isAdjusted && (
              <div className="info-box-blue" style={{ marginTop: 8 }}>
                Waiting for the customer to approve the updated price.
              </div>
            )}

            {isInProgress && (
              <>
                {canReadyForPickup && (
                  <button
                    className="action-btn yellow"
                    onClick={() => setActiveModal("ready")}
                    disabled={loading || !canReadyForPickup}
                  >
                    Mark Ready for Pickup
                  </button>
                )}
                {canDeliver && (
                  <button
                    className="action-btn green"
                    onClick={() => updateOrder({ status: "delivered" })}
                    disabled={loading || !canDeliver}
                  >
                    Mark Delivered
                  </button>
                )}
                {!canDeliver && !canReadyForPickup && (
                  <button
                    className="action-btn green"
                    onClick={handleComplete}
                    disabled={loading || !canComplete}
                  >
                    Mark Completed
                  </button>
                )}
              </>
            )}

            {isReadyForPickup && (
              <button
                className="action-btn green"
                onClick={handleComplete}
                disabled={loading}
              >
                Mark Completed
              </button>
            )}

            {isDelivered && (
              <button
                className="action-btn green"
                onClick={handleComplete}
                disabled={loading}
              >
                Mark Completed
              </button>
            )}
          </section>

          <section className="card">
            <h3 className="card-title">Order Timeline</h3>
            <ol className="timeline">
              <li className="timeline-item completed">
                <span className="dot" />
                <div>
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-sub">Feb 10, 2026</div>
                </div>
              </li>
              <li className="timeline-item active">
                <span className="dot" />
                <div>
                  <div className="timeline-title">Awaiting Confirmation</div>
                </div>
              </li>
            </ol>
          </section>
        </aside>
      </div>

      {activeModal === 'accept' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle green modal-icon-circle--image">
                <img src={completedIcon} alt="" className="modal-status-icon" />
              </div>
              <div className="order-action-modal__copy">
                <h2 className="modal-h2">Accept this order?</h2>
                <p className="modal-p">
                  Once you accept, the customer is notified right away and you can move the order into progress when you are ready.
                </p>
              </div>
              <div className="modal-blue-box order-action-callout">
                <p><strong>What happens next</strong></p>
                <ul className="order-action-list">
                  <li>The customer receives an order update email.</li>
                  <li>The order stays active in your queue.</li>
                  <li>You can move it to In Progress from the order page.</li>
                </ul>
              </div>
              <div className="modal-footer order-action-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn green-btn" onClick={handleAccept}>Confirm Accept</button>
              </div>
            </div>
          ) : (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle green modal-icon-circle--image">
                <img src={completedIcon} alt="" className="modal-status-icon" />
              </div>
              <h2 className="modal-h2">Order accepted</h2>
              <p className="modal-p">Customer has been notified.</p>
              <button className="primary-btn green-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {activeModal === 'adjust' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body order-action-modal">
              <div className="modal-icon-circle yellow">$</div>
              <div className="order-action-modal__copy">
                <h2 className="modal-h2">Adjust order price</h2>
                <p className="modal-p">Send the customer an updated total and, if helpful, a quick reason for the change.</p>
              </div>
              <div className="order-adjust-summary">
                <span>Current price</span>
                <strong>${order?.price ?? 0}</strong>
              </div>
              <div className="field order-modal-field" style={{ textAlign: "left" }}>
                <label className="field-label">New Price</label>
                <div className="input-group">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    className="input"
                    value={adjustPrice}
                    onChange={(e) => setAdjustPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="field order-modal-field" style={{ textAlign: "left" }}>
                <label className="field-label">Reason for Adjustment (Optional)</label>
                <textarea
                  className="input"
                  placeholder="e.g., Additional decorations..."
                  rows="3"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>
              <div className="modal-footer order-action-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn yellow-btn" onClick={handleAdjust}>Submit New Price</button>
              </div>
            </div>
          ) : (
            <div className="modal-body order-action-modal">
              <div className="modal-icon-circle yellow">$</div>
              <h2 className="modal-h2">Price updated.</h2>
              <p className="modal-p">Customer will be notified to approve.</p>
              <button className="primary-btn yellow-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {activeModal === 'decline' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle red"><span className="icon-check">X</span></div>
              <div className="order-action-modal__copy">
                <h2 className="modal-h2">Decline this order?</h2>
                <p className="modal-p">Add a short reason so the customer knows why you cannot take it on.</p>
              </div>
              <div className="field order-modal-field" style={{ textAlign: "left" }}>
                <label className="field-label">Reason for Declining *</label>
                <textarea
                  className="input"
                  placeholder="e.g., Fully booked for that date..."
                  rows="4"
                  required
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </div>
              <div className="modal-footer order-action-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn red-btn" onClick={handleDecline}>Decline Order</button>
              </div>
            </div>
          ) : (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle red"><span className="icon-check">X</span></div>
              <h2 className="modal-h2">Order declined</h2>
              <p className="modal-p">Customer has been notified.</p>
              <button className="primary-btn red-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {activeModal === "ready" && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle yellow modal-icon-circle--image">
                <img src={readyCakeIcon} alt="" className="modal-status-icon" />
              </div>
              <div className="order-action-modal__copy">
                <h2 className="modal-h2">Cake ready for pickup?</h2>
                <p className="modal-p">We will mark this order as ready for pickup and notify the customer right away.</p>
              </div>
              <div className="modal-blue-box order-action-callout">
                <p><strong>Heads up</strong></p>
                <ul className="order-action-list">
                  <li>The customer gets an email update.</li>
                  <li>The order stays active until you mark it completed.</li>
                </ul>
              </div>
              <div className="modal-footer order-action-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn yellow-btn" onClick={handleReadyForPickup}>Yes, notify customer</button>
              </div>
            </div>
          ) : (
            <div className="modal-body order-action-modal compact">
              <div className="modal-icon-circle yellow modal-icon-circle--image">
                <img src={readyCakeIcon} alt="" className="modal-status-icon" />
              </div>
              <h2 className="modal-h2">Customer notified</h2>
              <p className="modal-p">The order is now marked ready for pickup.</p>
              <button className="primary-btn yellow-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {selectedReference && (
        <Modal onClose={() => setSelectedReference("")}>
          <div className="reference-preview-modal">
            <div className="reference-preview-head">
              <h2 className="modal-h2">Reference image</h2>
              <button type="button" className="secondary-btn" onClick={() => setSelectedReference("")}>
                Close
              </button>
            </div>
            <div className="reference-preview-frame">
              <img src={selectedReference} alt="Customer inspiration reference" className="reference-preview-image" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="info-tile">
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="info-chip">
      <div className="chip-label">{label}</div>
      <div className="chip-value">{value}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
