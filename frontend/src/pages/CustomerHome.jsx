// src/pages/CustomerHome.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import Modal from "../Components/Modal";
import verifiedIcon from "../assets/verified.png";
import qualityIcon from "../assets/quality.png";
import unlimitedIcon from "../assets/unlimited.png";
import locationIcon from "../assets/location-icon.png";
import searchIcon from "../assets/search-icon.svg";
import wavingHandIcon from "../assets/waving-hand.svg";
import { resolveImageUrl } from "../utils/imageUrls";

const LOCATION_OPTIONS = ["Ottawa, ON", "Toronto, ON", "Montreal, QC", "Vancouver, BC"];
const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

function readCustomerPreferences() {
  try {
    const stored = localStorage.getItem("customerUser");
    if (!stored) {
      return { location: "Ottawa, ON", preferredRadius: "15" };
    }
    const parsed = JSON.parse(stored);
    return {
      location: parsed?.location || "Ottawa, ON",
      preferredRadius: String(parsed?.preferredRadius || "15"),
    };
  } catch {
    return { location: "Ottawa, ON", preferredRadius: "15" };
  }
}

function cityKey(value) {
  return String(value || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("Customer");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState("Ottawa, ON");
  const [customLocation, setCustomLocation] = useState("");
  const [preferredRadius, setPreferredRadius] = useState("15");
  const [pendingRadius, setPendingRadius] = useState("15");
  const [bakers, setBakers] = useState([]);
  const [error, setError] = useState("");
  const [savingPreferences, setSavingPreferences] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const prefs = readCustomerPreferences();
    setLocation(prefs.location);
    setPreferredRadius(prefs.preferredRadius);
    setPendingRadius(prefs.preferredRadius);

    try {
      const stored = localStorage.getItem("customerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setCustomerName(parsed.name);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/bakers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setBakers(
            data.map((b) => ({
              id: b._id,
              name: b.businessName || b.name || "Baker",
              location: b.location || "Local baker",
              deliveryRadius: Number(b.deliveryRadius || 0),
              rating: 4.8,
              logo: resolveImageUrl(API_BASE_URL, b.logo),
            }))
          );
          setError("");
        } else {
          setError("No bakers yet.");
          setBakers([]);
        }
      })
      .catch(() => {
        setError("Could not load bakers.");
        setBakers([]);
      });
  }, [API_BASE_URL]);

  const filteredBakers = useMemo(() => {
    const radiusLimit = Number(preferredRadius || 0);
    const activeCity = cityKey(location);

    return bakers
      .filter((baker) => {
        if (!activeCity) return true;
        return cityKey(baker.location) === activeCity;
      })
      .filter((baker) => {
        if (!radiusLimit) return true;
        if (!baker.deliveryRadius) return true;
        return baker.deliveryRadius >= radiusLimit;
      })
      .map((baker) => ({
        ...baker,
        coverageLabel: baker.deliveryRadius
          ? `Delivers up to ${baker.deliveryRadius} km`
          : `Within ${radiusLimit || 15} km`,
      }));
  }, [bakers, location, preferredRadius]);

  const persistCustomerPreferences = async (nextLocation, nextRadius) => {
    const normalizedRadius = String(nextRadius || "15");

    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "customerUser",
        JSON.stringify({
          ...parsed,
          location: nextLocation,
          preferredRadius: normalizedRadius,
        })
      );
    } catch {
      /* ignore */
    }

    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      const customerId = parsed?.id || parsed?._id;
      if (!customerId) return;

      await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: nextLocation,
          preferredRadius: normalizedRadius,
        }),
      });
    } catch {
      /* ignore */
    }
  };

  const applyPreferences = async (nextLocation) => {
    const normalizedLocation = String(nextLocation || "").trim();
    if (!normalizedLocation) return;

    setSavingPreferences(true);
    setLocation(normalizedLocation);
    setPreferredRadius(pendingRadius);
    await persistCustomerPreferences(normalizedLocation, pendingRadius);
    setSavingPreferences(false);
    setIsLocationOpen(false);
    setCustomLocation("");
  };

  return (
    <div className="page">
      <div className="cust-topbar">
        <div className="cust-search-wrap">
          <img src={searchIcon} alt="Search" className="search-icon-img" />
          <input
            className="cust-search-input"
            type="search"
            placeholder="Search for bakers, cakes, or flavors..."
          />
        </div>
        <div
          className="cust-location"
          role="button"
          tabIndex={0}
          onClick={() => {
            setPendingRadius(preferredRadius);
            setIsLocationOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setPendingRadius(preferredRadius);
              setIsLocationOpen(true);
            }
          }}
        >
          <img src={locationIcon} alt="Location" className="cust-location-icon-img" />
          <span className="cust-location-text">{location}</span>
          <span className="cust-location-radius">{preferredRadius} km</span>
          <button
            type="button"
            className="link-button"
            onClick={(e) => {
              e.stopPropagation();
              setPendingRadius(preferredRadius);
              setIsLocationOpen(true);
            }}
          >
            Change
          </button>
        </div>
      </div>

      <div className="cust-hero">
        <p className="page-subtitle greeting-line" style={{ marginBottom: 10 }}>
          Hello, {customerName}!
          <img src={wavingHandIcon} alt="" className="greeting-icon" />
        </p>
        <h1 className="page-title">Discover Your Perfect Cake</h1>
        <p className="page-subtitle">
          Connect with talented local bakers, browse ready-made cakes, or design
          your custom masterpiece
        </p>
      </div>

      <section style={{ marginBottom: "32px" }}>
        <h2 className="cust-section-title">Featured Bakers Nearby</h2>
        <p className="page-subtitle" style={{ marginBottom: "18px" }}>
          {filteredBakers.length
            ? `${filteredBakers.length} bakers in ${location} matching your ${preferredRadius} km search radius`
            : `No bakers found in ${location} for a ${preferredRadius} km search radius`}
        </p>
        {error && <p className="auth-error-text">{error}</p>}
        <div className="cust-baker-grid">
          {filteredBakers.map((b) => (
            <article key={b.id} className="premium-baker-card cust-baker-card">
              <div
                className="cust-baker-img"
                style={
                  b.logo
                    ? { backgroundImage: `url(${b.logo})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              >
                <span className="cust-badge-distance">{b.coverageLabel}</span>
                <span className="cust-badge-rating">Star {b.rating}</span>
              </div>
              <div className="cust-baker-body">
                <h3 className="cust-baker-name">{b.name}</h3>
                <p className="helper-text" style={{ margin: "0 0 12px" }}>{b.location}</p>
                <button
                  className="cust-primary-btn wide"
                  onClick={() => navigate(`/baker/${b.id}`)}
                >
                  View Profile
                </button>
              </div>
            </article>
          ))}
          {!filteredBakers.length && !error && (
            <p className="page-subtitle">Try a larger radius or change your location.</p>
          )}
        </div>
      </section>

      <section className="cust-why-section">
        <h2 className="cust-why-title">Why Choose CakeCraft?</h2>
        <div className="cust-why-grid">
          {[
            {
              title: "Verified Bakers Only",
              copy: "Every baker is thoroughly verified and reviewed by our community for your peace of mind",
              icon: verifiedIcon,
              tone: "pink",
            },
            {
              title: "Quality Guaranteed",
              copy: "Not satisfied? We'll make it right with our 100% satisfaction guarantee policy",
              icon: qualityIcon,
              tone: "purple",
            },
            {
              title: "Unlimited Customization",
              copy: "Design your perfect cake with our builder - unlimited options for every celebration",
              icon: unlimitedIcon,
              tone: "orange",
            },
          ].map((item) => (
            <div className="cust-why-item" key={item.title}>
              <div className={`cust-why-icon ${item.tone}-icon`}>
                <img src={item.icon} alt={item.title} className="cust-why-icon-img" />
              </div>
              <h4>{item.title}</h4>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {isLocationOpen && (
        <Modal onClose={() => setIsLocationOpen(false)} cardClassName="location-modal-card">
          <h2 className="modal-h2">Choose your location</h2>
          <p className="modal-p">Set where you are and how far out you want to browse bakers.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
            {LOCATION_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={opt === location ? "update-location-btn" : "ghost-btn"}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 12 }}
                onClick={() => applyPreferences(opt)}
                disabled={savingPreferences}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="radius-picker-block">
            <div className="radius-picker-head">
              <strong>Search radius</strong>
              <span>{pendingRadius} km</span>
            </div>
            <div className="radius-chip-row">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`radius-chip ${String(option) === String(pendingRadius) ? "active" : ""}`}
                  onClick={() => setPendingRadius(String(option))}
                >
                  {option} km
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              Other location
            </div>
            <input
              className="input"
              placeholder="Enter your city or postal code"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
            />
            <button
              type="button"
              className="update-location-btn"
              onClick={() => applyPreferences(customLocation)}
              disabled={savingPreferences}
              style={{ width: "100%" }}
            >
              {savingPreferences ? "Saving..." : "Apply"}
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              className="ghost-btn"
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12 }}
              onClick={() => {
                setPendingRadius(preferredRadius);
                setIsLocationOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
