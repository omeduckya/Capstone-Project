import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../components/Modal";
import "./styles.css";
import verifiedIcon from "../assets/verified.png";
import qualityIcon from "../assets/quality.png";
import unlimitedIcon from "../assets/unlimited.png";

const featuredBakers = [
  {
    id: "1",
    name: "Cakes By Nelia",
    distance: "0.8 km",
    rating: "4.9",
    image:
      "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "2",
    name: "Sweet Dreams Bakery",
    distance: "1.2 km",
    rating: "4.8",
    image:
      "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "3",
    name: "The Cake Studio",
    distance: "1.5 km",
    rating: "4.7",
    image:
      "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "4",
    name: "Cakes By Nelia",
    distance: "0.8 km",
    rating: "4.9",
    image:
      "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "5",
    name: "Sweet Dreams Bakery",
    distance: "1.5 km",
    rating: "4.7",
    image:
      "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "6",
    name: "The Cake Studio",
    distance: "1.5 km",
    rating: "4.7",
    image:
      "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const trustHighlights = [
  {
    icon: verifiedIcon,
    title: "Verified Bakers Only",
    description:
      "Every baker is thoroughly verified and reviewed by our community for your peace of mind",
    tone: "pink",
  },
  {
    icon: qualityIcon,
    title: "Quality Guaranteed",
    description:
      "Not satisfied? We'll make it right with our 100% satisfaction guarantee policy",
    tone: "purple",
  },
  {
    icon: unlimitedIcon,
    title: "Unlimited Customization",
    description:
      "Design your perfect cake with our builder - unlimited options for every celebration",
    tone: "orange",
  },
];

function HighlightIcon({ icon, tone, title }) {
  return (
    <div className={`customer-highlight-icon ${tone}`}>
      <img src={icon} alt={title} className="cust-why-icon-img" />
    </div>
  );
}

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState("Ottawa, ON");
  const [customLocation, setCustomLocation] = useState("");

  const locationOptions = ["Ottawa, ON", "Toronto, ON", "Montreal, QC", "Vancouver, BC"];

  return (
    <div className="customer-home-page">
      <div className="customer-home-topbar">
        <label className="customer-search-shell">
          <span className="customer-search-icon">Search</span>
          <input
            type="search"
            className="customer-search-input"
            placeholder="Search for bakers, cakes, or flavors..."
          />
        </label>

        <div
          className="customer-location-pill"
          role="button"
          tabIndex={0}
          onClick={() => setIsLocationOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsLocationOpen(true);
          }}
        >
          <span className="customer-location-icon">Pin</span>
          <span className="customer-location-copy">{location}</span>
          <button
            type="button"
            className="customer-location-action"
            onClick={(e) => {
              e.stopPropagation();
              setIsLocationOpen(true);
            }}
          >
            Change
          </button>
        </div>
      </div>

      <header className="customer-home-hero">
        <h1 className="page-title">Discover Your Perfect Cake</h1>
        <p className="page-subtitle">
          Connect with talented local bakers, browse ready-made cakes, or design
          your custom masterpiece
        </p>
      </header>

      <section className="customer-home-section">
        <div className="customer-section-heading">
          <h2 className="customer-section-title">Featured Bakers Nearby</h2>
          <p className="customer-section-subtitle">
            127 talented bakers within 10 km
          </p>
        </div>

        <div className="customer-baker-grid">
          {featuredBakers.map((baker) => (
            <article
              key={baker.id}
              className="premium-baker-card customer-baker-card"
            >
              <div
                className="customer-baker-image"
                style={{ backgroundImage: `url(${baker.image})` }}
              >
                <span className="customer-card-pill left">{baker.distance}</span>
                <span className="customer-card-pill right">{baker.rating}</span>
              </div>

              <div className="customer-baker-content">
                <h3 className="customer-baker-name">{baker.name}</h3>
                <button
                  type="button"
                  className="cust-primary-btn customer-card-button"
                  onClick={() => navigate(`/baker/${baker.id}`)}
                >
                  View Profile
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="customer-value-panel">
        <h2 className="customer-value-title">Why Choose CakeCraft?</h2>

        <div className="customer-value-grid">
          {trustHighlights.map((item) => (
            <div key={item.title} className="customer-value-item">
              <HighlightIcon icon={item.icon} tone={item.tone} title={item.title} />
              <h3 className="customer-value-item-title">{item.title}</h3>
              <p className="customer-value-item-copy">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {isLocationOpen && (
        <Modal onClose={() => setIsLocationOpen(false)} cardClassName="location-modal-card">
          <h2 className="modal-h2">choose your location</h2>
          <p className="modal-p">this helps you find bakers nearby.</p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 18,
            }}
          >
            {locationOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={opt === location ? "update-location-btn" : "ghost-btn"}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 12 }}
                onClick={() => {
                  setLocation(opt);
                  setIsLocationOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
              other location
            </div>
            <input
              className="input"
              placeholder="enter your city or postal code"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
            />
            <button
              type="button"
              className="update-location-btn"
              onClick={() => {
                const v = customLocation.trim();
                if (!v) return;
                setLocation(v);
                setIsLocationOpen(false);
              }}
              style={{ width: "100%" }}
            >
              apply
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              className="ghost-btn"
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12 }}
              onClick={() => setIsLocationOpen(false)}
            >
              cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
