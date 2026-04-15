// src/pages/BakerProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";

export default function BakerProfile() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [cakes, setCakes] = useState([]);
  const [bakerInfo, setBakerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selfId = useMemo(() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || null;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, []);

  const hasBakerSession = Boolean(localStorage.getItem("bakerToken"));
  const hasCustomerSession = Boolean(
    localStorage.getItem("customerToken") || localStorage.getItem("customerUser")
  );

  const targetId = paramId || selfId;
  // prioritize customer view; if customer is logged in, never treat as self even if a baker token lingers
  const isSelfView = Boolean(
    !hasCustomerSession && hasBakerSession && selfId && (!paramId || paramId === selfId)
  );
  const showCustomerCtas = !isSelfView;
  const builderUrl = `/baker/${targetId}/builder`;
  const checkoutUrl = (cakeId) => `/baker/${targetId}/checkout${cakeId ? `?cakeId=${cakeId}` : ""}`;

  const handleOrderFromGallery = (cake) => {
    const image =
      cake?.mainImage ||
      cake?.imageUrl ||
      (Array.isArray(cake?.galleryImages) ? cake.galleryImages[0] : "");

    const draft = {
      cakeId: cake?._id,
      bakerId: targetId,
      bakerName: displayName,
      cakeName: cake?.name || cake?.flavor || "Custom cake",
      cakeDescription: cake?.description || "",
      cakeImage: image,
      flavour: cake?.flavor || cake?.name || "Custom",
      shape: cake?.shape || "Round",
      size: cake?.size || "8 inches",
      price: cake?.price || "",
      message: "",
      fillings: cake?.filling ? [cake.filling] : Array.isArray(cake?.fillings) ? cake.fillings : [],
      tiers: cake?.tiers || "1",
      frosting: cake?.frosting || "",
      notes: cake?.notes || "",
      customizationOptions: {
        allowCustomMessage: Boolean(cake?.allowCustomMessage),
        allowColorCustomization: Boolean(cake?.allowColorCustomization),
        availableForRushOrders: Boolean(cake?.availableForRushOrders),
        dietaryOptionsAvailable: Boolean(cake?.dietaryOptionsAvailable),
      },
    };
    try {
      sessionStorage.setItem("orderDraft", JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    navigate(checkoutUrl(cake?._id));
  };

  const bakerUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!targetId) {
      setError("No baker id available.");
      return;
    }
    setLoading(true);
    setError("");
    const bakerEndpoint = isSelfView
      ? `${API_BASE_URL}/api/bakers/${targetId}/settings`
      : `${API_BASE_URL}/api/bakers/${targetId}`;

    fetch(bakerEndpoint)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Could not load baker profile.");
        }
        return data;
      })
      .then((bakerData) => {
        setBakerInfo(bakerData);
        return fetch(`${API_BASE_URL}/api/cakes?userId=${targetId}`).then((res) => res.json());
      })
      .then((cakesData) => {
        if (Array.isArray(cakesData)) {
          setCakes(cakesData);
          if (!cakesData.length) {
            setError("No cakes yet. This baker hasn't added any listings.");
          }
        } else {
          setCakes([]);
          setError("Could not load cakes for this baker.");
        }
      })
      .catch((err) => {
        setBakerInfo(null);
        setCakes([]);
        setError(err.message || "Could not load baker profile.");
      })
      .finally(() => setLoading(false));
  }, [API_BASE_URL, isSelfView, targetId]);

  const normalizeImage = (cake) => {
    const raw =
      cake.mainImage ||
      cake.imageUrl ||
      (Array.isArray(cake.galleryImages) ? cake.galleryImages[0] : null);
    return resolveImageUrl(API_BASE_URL, raw);
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null || Number.isNaN(Number(val))) return "$—";
    return `$${Number(val).toFixed(0)}`;
  };

  const activeBaker = isSelfView ? (bakerUser || bakerInfo) : bakerInfo;
  const displayName =
    activeBaker?.businessName ||
    activeBaker?.name ||
    "Baker";
  const displayLocation = activeBaker?.location || "Local baker";
  const displayPhone = activeBaker?.phone || "";
  const displayBio =
    activeBaker?.description ||
    "Browse this baker’s creations and place an order.";
  const policies = {
    minNotice: isSelfView ? bakerUser?.minNotice : bakerInfo?.minNotice,
    maxOrdersPerDay: isSelfView ? bakerUser?.maxOrdersPerDay : bakerInfo?.maxOrdersPerDay,
    rushFee: isSelfView ? bakerUser?.rushFee : bakerInfo?.rushFee,
    cancellationPolicy: isSelfView ? bakerUser?.cancellationPolicy : bakerInfo?.cancellationPolicy,
    deliveryFee: isSelfView ? bakerUser?.deliveryFee : bakerInfo?.deliveryFee,
    deliveryRadius: isSelfView ? bakerUser?.deliveryRadius : bakerInfo?.deliveryRadius,
    pickupOffered:
      isSelfView
        ? bakerUser?.pickupOffered
        : bakerInfo?.pickupOffered,
    minOrderValue: isSelfView ? bakerUser?.minOrderValue : bakerInfo?.minOrderValue,
    consultationFee: isSelfView ? bakerUser?.consultationFee : bakerInfo?.consultationFee,
  };
  const displayLogo = activeBaker?.logo;
  const hiddenFromCustomers =
    !isSelfView && !bakerInfo && error.toLowerCase().includes("not publicly visible");

  return (
    <div className="page-container">
      <header className="white-header-box baker-profile-header">
        <div className="header-left-content">
          {!isSelfView && (
            <button className="back-btn" onClick={() => navigate("/home")}>←</button>
          )}
          <div className="header-text-info">
            <h1 className="page-title">Baker profile</h1>
            <p className="page-subtitle">View cakes and place an order</p>
          </div>
        </div>
      </header>

      <div className="content-scroll-area">
        {hiddenFromCustomers ? (
          <div className="profile-section-white">
            <p className="auth-error-text" style={{ marginBottom: 0 }}>
              This baker profile is not currently visible to customers.
            </p>
          </div>
        ) : (
          <>
        <div className="profile-section-white">
          <div className="baker-main-info">
            <div className="avatar-pink-solid large">
              {displayLogo && (
                <img
                  src={resolveImageUrl(API_BASE_URL, displayLogo)}
                  alt="baker logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              )}
            </div>
            <div className="baker-details-text">
              <h2>{displayName}</h2>
              <p>📍 {displayLocation}</p>
              {displayPhone && <p>📞 {displayPhone}</p>}
              <p className="baker-bio">{displayBio}</p>
            </div>
          </div>
          {showCustomerCtas && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn-pink-full-width"
                onClick={() => navigate(builderUrl)}
                style={{ flex: "1 1 260px" }}
              >
                Design custom cake
              </button>
              <button
                className="ghost-btn"
                style={{ flex: "1 1 200px" }}
                onClick={() => {
                  const cakesSection = document.getElementById("baker-cakes-section");
                  if (cakesSection) cakesSection.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View available cakes
              </button>
            </div>
          )}
        </div>

        <h2 id="baker-cakes-section" className="section-title">Available cakes</h2>
        {error && <p className="auth-error-text" style={{ marginBottom: 8 }}>{error}</p>}
        {loading && <p className="page-subtitle" style={{ marginBottom: 12 }}>Loading cakes...</p>}

        {!loading && cakes.length === 0 && !error && (
          <p className="page-subtitle">No cakes yet from this baker.</p>
        )}

        {cakes.length > 0 && (
          <section className="grid-cards">
            {cakes.map((c) => (
              <article key={c._id} className="cake-card">
                <div
                  className="cake-thumb"
                  style={
                    normalizeImage(c)
                      ? {
                          backgroundImage: `url(${normalizeImage(c)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <div className="cake-body">
                  <div className="cake-header">
                    <h3>{c.name || c.flavor || "Untitled Cake"}</h3>
                    <span className="cake-price">{formatPrice(c.price)}</span>
                  </div>
                  <div className="cake-metrics">
                    <div className="badge">{c.orders ? `${c.orders} orders` : "— orders"}</div>
                    <div className="badge">★ {c.rating || "4.8"}</div>
                  </div>
                  <div className="cake-footer">
                    <span className="revenue-label">Starting Price</span>
                    <span className="revenue-value">{formatPrice(c.price)}</span>
                  </div>
                </div>
                {showCustomerCtas ? (
                  <button
                    className="btn-pink-full"
                    style={{ margin: "12px 14px 16px" }}
                    onClick={() => handleOrderFromGallery(c)}
                  >
                    Order this cake
                  </button>
                ) : (
                  <div style={{ height: 12 }} />
                )}
              </article>
            ))}
          </section>
        )}

        <section className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">Policies & Info</h3>
          <div className="grid-2">
            <Policy label="Minimum notice" value={policies.minNotice} />
            <Policy label="Max orders/day" value={policies.maxOrdersPerDay} />
            <Policy label="Rush order fee" value={policies.rushFee} />
            <Policy label="Cancellation policy" value={policies.cancellationPolicy} />
            <Policy label="Delivery fee" value={policies.deliveryFee} />
            <Policy label="Delivery radius" value={policies.deliveryRadius ? `${policies.deliveryRadius} km` : ""} />
            <Policy label="Pickup offered" value={policies.pickupOffered === false ? "No" : "Yes"} />
            <Policy label="Minimum order value" value={policies.minOrderValue} />
            <Policy label="Consultation fee" value={policies.consultationFee} />
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

function Policy({ label, value }) {
  if (!value) return null;
  return (
    <div className="info-tile">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  );
}
