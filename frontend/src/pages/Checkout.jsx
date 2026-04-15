import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../Components/Modal";
import { resolveImageUrl } from "../utils/imageUrls";
import "./styles.css";

const EMPTY_CUSTOMIZATION = {
  allowCustomMessage: false,
  allowColorCustomization: false,
  availableForRushOrders: false,
  dietaryOptionsAvailable: false,
};
const INSPIRATION_STORAGE_KEY = "checkoutInspirationImage";

function normalizeCustomizationOptions(options) {
  return {
    allowCustomMessage: Boolean(options?.allowCustomMessage),
    allowColorCustomization: Boolean(options?.allowColorCustomization),
    availableForRushOrders: Boolean(options?.availableForRushOrders),
    dietaryOptionsAvailable: Boolean(options?.dietaryOptionsAvailable),
  };
}

function buildDraftFromCake(cake, existingDraft = null) {
  return {
    ...existingDraft,
    cakeId: cake?._id || existingDraft?.cakeId || "",
    bakerId: cake?.userId || existingDraft?.bakerId || "",
    bakerName: existingDraft?.bakerName || "",
    cakeName: cake?.name || existingDraft?.cakeName || "Custom cake",
    cakeDescription: cake?.description || existingDraft?.cakeDescription || "",
    cakeImage:
      cake?.mainImage ||
      cake?.imageUrl ||
      (Array.isArray(cake?.galleryImages) ? cake.galleryImages[0] : "") ||
      existingDraft?.cakeImage ||
      "",
    flavour: cake?.flavor || existingDraft?.flavour || "Custom",
    shape: cake?.shape || existingDraft?.shape || "Round",
    size: cake?.size || existingDraft?.size || "8 inches",
    price: cake?.price ?? existingDraft?.price ?? "",
    deliveryDate: existingDraft?.deliveryDate || "",
    deliveryTime: existingDraft?.deliveryTime || "",
    inspirationImage: existingDraft?.inspirationImage || "",
    customerInstructions: existingDraft?.customerInstructions || "",
    message: existingDraft?.message || "",
    colorNotes: existingDraft?.colorNotes || "",
    dietaryNotes: existingDraft?.dietaryNotes || "",
    rushOrder: Boolean(existingDraft?.rushOrder),
    fillings:
      cake?.filling
        ? [cake.filling]
        : Array.isArray(cake?.fillings) && cake.fillings.length
          ? cake.fillings
          : existingDraft?.fillings || [],
    tiers: cake?.tiers || existingDraft?.tiers || "1",
    frosting: cake?.frosting || existingDraft?.frosting || "",
    notes: cake?.notes || existingDraft?.notes || "",
    customizationOptions: normalizeCustomizationOptions(
      cake ? cake : existingDraft?.customizationOptions
    ),
  };
}

function formatMoney(value) {
  if (value === "" || value === null || value === undefined || Number.isNaN(Number(value))) {
    return "$0";
  }
  return `$${Number(value).toFixed(0)}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [deliveryMethod, setDeliveryMethod] = useState("Pickup");
  const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");
  const [draft, setDraft] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [status, setStatus] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [showAddCardPrompt, setShowAddCardPrompt] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [uploadingInspiration, setUploadingInspiration] = useState(false);
  const [inspirationUrl, setInspirationUrl] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const stored = sessionStorage.getItem("orderDraft");
    let parsedDraft = null;
    if (stored) {
      try {
        parsedDraft = JSON.parse(stored);
      } catch {
        parsedDraft = null;
      }
    }

    const cakeId = parsedDraft?.cakeId || new URLSearchParams(location.search).get("cakeId");
    if (!cakeId) {
      setDraft(parsedDraft);
      setInspirationUrl(
        parsedDraft?.inspirationImage ||
          parsedDraft?.referenceImage ||
          sessionStorage.getItem(INSPIRATION_STORAGE_KEY) ||
          ""
      );
      setLoadingDraft(false);
      return;
    }

    setLoadingDraft(true);
    fetch(`${API_BASE_URL}/api/cakes/${cakeId}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Could not load the selected cake.");
        }
        const nextDraft = buildDraftFromCake(data, parsedDraft);
        setDraft(nextDraft);
        setInspirationUrl(
          nextDraft?.inspirationImage ||
            nextDraft?.referenceImage ||
            sessionStorage.getItem(INSPIRATION_STORAGE_KEY) ||
            ""
        );
        sessionStorage.setItem("orderDraft", JSON.stringify(nextDraft));
      })
      .catch(() => {
        setDraft(parsedDraft);
        setInspirationUrl(
          parsedDraft?.inspirationImage ||
            parsedDraft?.referenceImage ||
            sessionStorage.getItem(INSPIRATION_STORAGE_KEY) ||
            ""
        );
      })
      .finally(() => setLoadingDraft(false));
  }, [API_BASE_URL, location.search]);

  useEffect(() => {
    const stored = localStorage.getItem("savedCards");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSavedCards(parsed);
      } catch {
        /* ignore */
      }
    }

    const storedMethods = localStorage.getItem("customerPaymentMethods");
    if (storedMethods) {
      try {
        const parsed = JSON.parse(storedMethods);
        if (Array.isArray(parsed)) setSavedPaymentMethods(parsed);
      } catch {
        /* ignore */
      }
    }

    const onStorage = (event) => {
      if (event.key === "savedCards") {
        try {
          const parsed = JSON.parse(event.newValue || "[]");
          if (Array.isArray(parsed)) setSavedCards(parsed);
        } catch {
          /* ignore */
        }
      }
      if (event.key === "customerPaymentMethods") {
        try {
          const parsed = JSON.parse(event.newValue || "[]");
          if (Array.isArray(parsed)) setSavedPaymentMethods(parsed);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hasPaymentMethod = savedPaymentMethods.length > 0 || savedCards.length > 0;
  const customizationOptions = normalizeCustomizationOptions(draft?.customizationOptions);
  const hasCustomizationOptions = Object.values(customizationOptions).some(Boolean);

  const serviceFee = useMemo(() => {
    const cakePrice = Number(draft?.price || 0);
    return cakePrice > 0 ? 8 : 0;
  }, [draft?.price]);

  const total = useMemo(() => Number(draft?.price || 0) + serviceFee, [draft?.price, serviceFee]);

  const updateDraftField = (field, value) => {
    setDraft((prev) => {
      const next = { ...(prev || {}), [field]: value };
      sessionStorage.setItem("orderDraft", JSON.stringify(next));
      return next;
    });
  };

  const handleInspirationUpload = async (file) => {
    if (!file) return;
    setUploadingInspiration(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("files", file);
      const res = await fetch(`${API_BASE_URL}/api/upload?context=cake`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not upload inspiration image");
      const url = data.urls?.[0];
      if (!url) throw new Error("No inspiration image URL returned");
      setInspirationUrl(url);
      sessionStorage.setItem(INSPIRATION_STORAGE_KEY, url);
      setDraft((prev) => {
        const next = {
          ...(prev || {}),
          inspirationImage: url,
          referenceImage: url,
        };
        sessionStorage.setItem("orderDraft", JSON.stringify(next));
        return next;
      });
      setStatus("Inspiration image uploaded.");
    } catch (err) {
      setStatus(err.message || "Could not upload inspiration image");
    } finally {
      setUploadingInspiration(false);
    }
  };

  const placeOrder = async () => {
    if (!draft?.cakeId && !draft?.flavour) {
      setStatus("Choose a cake before continuing to checkout.");
      return;
    }

    if (!agreedToTerms) {
      setStatus("Please agree to the terms and conditions before placing your order.");
      return;
    }

    const latestMethods = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem("customerPaymentMethods") || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const latestCards = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem("savedCards") || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    if (!latestMethods.length && !latestCards.length) {
      setShowAddCardPrompt(true);
      return;
    }
    if (uploadingInspiration) {
      setStatus("Please wait for the inspiration image to finish uploading.");
      return;
    }
    setSavedCards(latestCards);
    setSavedPaymentMethods(latestMethods);

    const customer = JSON.parse(localStorage.getItem("customerUser") || "{}");
    const userId = customer.id || customer._id || "guest";
    const payload = {
      cakeId: draft?.cakeId || "",
      userId,
      bakerId: draft?.bakerId || id || "",
      customerId: userId,
      bakerName: draft?.bakerName || "",
      name: draft?.cakeName || "Custom cake",
      description: draft?.cakeDescription || "",
      mainImage: draft?.cakeImage || "",
      galleryImages: draft?.cakeImage ? [draft.cakeImage] : [],
      flavor: draft?.flavour || "Custom",
      shape: draft?.shape || "Round",
      size: draft?.size || "8 inches",
      toppings: Array.isArray(draft?.fillings) ? draft.fillings : [],
      filling: draft?.fillings?.[0] || "",
      tiers: draft?.tiers || "",
      frosting: draft?.frosting || "",
      customMessage: draft?.message || "",
      colorNotes: draft?.colorNotes || "",
      dietaryNotes: draft?.dietaryNotes || "",
      rushOrder: Boolean(draft?.rushOrder),
      customerInstructions:
        [draft?.message, draft?.colorNotes, draft?.dietaryNotes, draft?.rushOrder ? "Rush order requested" : ""]
          .filter(Boolean)
          .join(" | "),
      notes:
        draft?.notes ||
        [draft?.message, draft?.colorNotes, draft?.dietaryNotes, draft?.rushOrder ? "Rush order requested" : ""]
          .filter(Boolean)
          .join(" | "),
      price: draft?.price || 0,
      customerName: customer.name || "Customer",
      customerEmail: customer.email || "",
      customerPhone: customer.phone || "",
      customerLocation: customer.location || "",
      customerPhoto: customer.photo || "",
      customerAvatarPreset: customer.avatarPreset || "",
      deliveryMethod,
      deliveryDate: draft?.deliveryDate || "",
      deliveryTime: draft?.deliveryTime || "",
      inspirationImage:
        inspirationUrl ||
        draft?.inspirationImage ||
        draft?.referenceImage ||
        sessionStorage.getItem(INSPIRATION_STORAGE_KEY) ||
        "",
      referenceImage:
        inspirationUrl ||
        draft?.referenceImage ||
        draft?.inspirationImage ||
        sessionStorage.getItem(INSPIRATION_STORAGE_KEY) ||
        "",
    };

    setPlacing(true);
    setStatus("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not place order");
      }
      setStatus("Order placed! The baker will approve or decline.");
      sessionStorage.removeItem(INSPIRATION_STORAGE_KEY);
      sessionStorage.removeItem("orderDraft");
      setShowPaymentPrompt(true);
    } catch (err) {
      setStatus(err.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  const cakeImage = resolveImageUrl(API_BASE_URL, draft?.cakeImage);

  return (
    <>
      <div className="builder-page-wrapper">
        <header className="white-header-box baker-profile-header">
          <div className="header-left-content">
            <button className="back-btn" onClick={() => navigate(`/baker/${id}`)}>{"<-"}</button>
            <div className="header-text-info">
              <h1 className="page-title">Checkout</h1>
              <p className="page-subtitle">Complete your order</p>
            </div>
          </div>
          <div className="secure-badge-container">
            <span className="secure-tag">Secure checkout</span>
          </div>
        </header>

        <div className="builder-main-layout">
          <div className="builder-content-scroll">
            <div className="selection-card">
              <h3>Order summary</h3>
              {loadingDraft ? (
                <p className="selection-subtitle" style={{ marginTop: 12 }}>Loading cake details...</p>
              ) : !draft ? (
                <p className="auth-error-text" style={{ marginTop: 12 }}>
                  No cake was selected. Please go back to the baker&apos;s gallery and choose a cake.
                </p>
              ) : (
                <>
                  <div className="checkout-featured-cake">
                    <div className="checkout-featured-image">
                      {cakeImage ? (
                        <img src={cakeImage} alt={draft.cakeName || "Selected cake"} />
                      ) : (
                        <div className="checkout-image-fallback">Cake</div>
                      )}
                    </div>
                    <div className="checkout-featured-copy">
                      <h4 className="checkout-item-title">{draft?.cakeName || draft?.flavour || "Custom birthday cake"}</h4>
                      {draft?.cakeDescription && (
                        <p className="checkout-summary-copy">{draft.cakeDescription}</p>
                      )}
                      <div className="checkout-price-tag">{formatMoney(draft?.price)}</div>
                    </div>
                  </div>

                  <div className="checkout-summary-grid">
                    <div className="sum-item"><span>Shape:</span> <strong>{draft?.shape || "Round"}</strong></div>
                    <div className="sum-item"><span>Size:</span> <strong>{draft?.size || "8 inches"}</strong></div>
                    <div className="sum-item"><span>Tiers:</span> <strong>{draft?.tiers || "1"}</strong></div>
                    <div className="sum-item"><span>Flavor:</span> <strong>{draft?.flavour || "Chocolate"}</strong></div>
                    <div className="sum-item"><span>Filling:</span> <strong>{draft?.fillings?.[0] || "Buttercream"}</strong></div>
                    <div className="sum-item"><span>Frosting:</span> <strong>{draft?.frosting || "-"}</strong></div>
                  </div>
                </>
              )}
            </div>

            <div className="selection-card">
              <h3>Customize this cake</h3>
              <p className="selection-subtitle">
                The options below depend on what this baker allows for this specific cake.
              </p>

              {!hasCustomizationOptions ? (
                <div className="checkout-note-box">
                  This cake is sold as listed. If you want more flexibility, use the custom cake builder instead.
                </div>
              ) : (
                <div className="checkout-customization-grid">
                  {customizationOptions.allowCustomMessage && (
                    <label className="field full">
                      <span className="field-label">Custom message</span>
                      <input
                        className="figma-input-field"
                        placeholder="e.g., Happy Birthday Ava"
                        value={draft?.message || ""}
                        onChange={(e) => updateDraftField("message", e.target.value)}
                      />
                    </label>
                  )}

                  {customizationOptions.allowColorCustomization && (
                    <label className="field full">
                      <span className="field-label">Color preferences</span>
                      <textarea
                        className="figma-input-field checkout-textarea"
                        placeholder="Share your preferred colors or decoration style"
                        value={draft?.colorNotes || ""}
                        onChange={(e) => updateDraftField("colorNotes", e.target.value)}
                      />
                    </label>
                  )}

                  {customizationOptions.dietaryOptionsAvailable && (
                    <label className="field full">
                      <span className="field-label">Dietary requests</span>
                      <textarea
                        className="figma-input-field checkout-textarea"
                        placeholder="Gluten-free, vegan, nut-free, or other dietary notes"
                        value={draft?.dietaryNotes || ""}
                        onChange={(e) => updateDraftField("dietaryNotes", e.target.value)}
                      />
                    </label>
                  )}

                  {customizationOptions.availableForRushOrders && (
                    <label className="checkout-toggle-row">
                      <input
                        type="checkbox"
                        checked={Boolean(draft?.rushOrder)}
                        onChange={(e) => updateDraftField("rushOrder", e.target.checked)}
                      />
                      <span>
                        Request a rush order
                        <small>This cake can be prepared faster if the baker accepts the request.</small>
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="selection-card">
              <h3>Delivery method</h3>
              <p className="selection-subtitle">How would you like to receive your cake?</p>
              <div className="delivery-grid">
                <div
                  className={`delivery-card ${deliveryMethod === "Pickup" ? "active" : ""}`}
                  onClick={() => setDeliveryMethod("Pickup")}
                >
                  <div className="delivery-card-content">
                    <div className="delivery-icon-box">
                      <span className="icon-emoji">Pickup</span>
                    </div>
                    <div className="delivery-text">
                      <strong className="delivery-title">Pickup</strong>
                      <span className="delivery-desc">Free - pick up from bakery</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`delivery-card ${deliveryMethod === "Delivery" ? "active" : ""}`}
                  onClick={() => setDeliveryMethod("Delivery")}
                >
                  <div className="delivery-card-content">
                    <div className="delivery-icon-box">
                      <span className="icon-emoji">Delivery</span>
                    </div>
                    <div className="delivery-text">
                      <strong className="delivery-title">Delivery</strong>
                      <span className="delivery-desc">$15 - delivered to you</span>
                    </div>
                  </div>
                </div>
              </div>

              {deliveryMethod === "Pickup" && (
                <div className="address-info-banner">
                  <p className="banner-label">Pickup location</p>
                  <p className="banner-address">123 Main St, Springfield, IL 62701</p>
                </div>
              )}
            </div>

            <div className="selection-card">
              <h3>Pickup date &amp; time</h3>
              <div className="dual-column">
                <div className="input-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="figma-input-field"
                    value={draft?.deliveryDate || ""}
                    onChange={(e) => updateDraftField("deliveryDate", e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Time</label>
                  <input
                    type="time"
                    className="figma-input-field"
                    value={draft?.deliveryTime || ""}
                    onChange={(e) => updateDraftField("deliveryTime", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="selection-card">
              <h3>Add inspiration picture</h3>
              <p className="selection-subtitle">Optional: share an inspiration photo so the baker can see your vision.</p>
              <div className="checkout-inspiration-wrap">
                <label className="ghost-btn checkout-upload-trigger">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleInspirationUpload(e.target.files?.[0])}
                  />
                  {uploadingInspiration ? "Uploading..." : "Upload inspiration"}
                </label>
                {inspirationUrl && (
                  <div className="checkout-inspiration-preview">
                    <img src={resolveImageUrl(API_BASE_URL, inspirationUrl)} alt="Inspiration" />
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        setInspirationUrl("");
                        setDraft((prev) => {
                          const next = {
                            ...(prev || {}),
                            inspirationImage: "",
                            referenceImage: "",
                          };
                          sessionStorage.removeItem(INSPIRATION_STORAGE_KEY);
                          sessionStorage.setItem("orderDraft", JSON.stringify(next));
                          return next;
                        });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="selection-card">
              <h3>Payment method</h3>
              <div className="payment-list">
                {["Credit/Debit Card", "PayPal", "Venmo", "Cash on Pickup/Delivery"].map((method) => (
                  <div
                    key={method}
                    className={`payment-row-item ${paymentMethod === method ? "active" : ""}`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <span>{method}</span>
                    <div className={`radio-circle ${paymentMethod === method ? "selected" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="builder-sidebar-sticky">
            <div className="figma-summary-card">
              <h3>Price breakdown</h3>
              <div className="price-row"><span>Cake price</span><strong>{formatMoney(draft?.price)}</strong></div>
              <div className="price-row"><span>Service fee</span><strong>{formatMoney(serviceFee)}</strong></div>

              <div className="total-display-row">
                <span>Total</span>
                <span className="big-pink-price">{formatMoney(total)}</span>
              </div>

              <div className="info-box-blue status-box">
                <p><strong>Pending confirmation</strong></p>
                <p>Your order will be sent to the baker for review. They may adjust the price.</p>
              </div>

              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>I agree to the <span>terms and conditions</span></span>
              </label>

              {status && <p className="auth-error-text" style={{ marginTop: 8 }}>{status}</p>}
              {!hasPaymentMethod && (
                <p className="auth-error-text" style={{ marginTop: 6 }}>
                  Add a card or PayPal account before placing an order.
                </p>
              )}

              <button
                className="btn-pink-full-width checkout-large"
                onClick={placeOrder}
                disabled={placing || loadingDraft || !draft}
              >
                {placing ? "Placing..." : "Place order"}
              </button>
            </div>

            <div className="policy-card">
              <h4>Cancellation policy</h4>
              <div className="policy-row green">Free cancellation up to 48 hours</div>
              <div className="policy-row orange">50% refund for 24-48 hours</div>
              <div className="policy-row red">No refund within 24 hours</div>
            </div>
          </aside>
        </div>
      </div>

      {showPaymentPrompt && (
        <Modal onClose={() => setShowPaymentPrompt(false)}>
          <h2 className="modal-h2">Proceed to payment?</h2>
          <p className="modal-p">
            Your order was sent to the baker for approval. You will be charged only if they accept. Track it in My Orders.
          </p>
          <div className="modal-footer">
            <button
              type="button"
              className="primary-btn wide"
              onClick={() => {
                setShowPaymentPrompt(false);
                navigate("/my-orders", { replace: true });
              }}
            >
              View my orders
            </button>
          </div>
        </Modal>
      )}

      {showAddCardPrompt && (
        <Modal onClose={() => setShowAddCardPrompt(false)}>
          <h2 className="modal-h2">Add a payment method</h2>
          <p className="modal-p">Please add a card before placing your order.</p>
          <div className="modal-footer">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowAddCardPrompt(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="primary-btn wide"
              onClick={() => {
                setShowAddCardPrompt(false);
                navigate("/payment-methods");
              }}
            >
              Go to payment
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
