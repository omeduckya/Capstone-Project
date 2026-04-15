import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles.css";
import logoHorizontal from "../assets/logo_horizontal.png";
import settingsIcon from "../assets/settings-icon.png";
import boxIcon from "../assets/box-icon.png";
import cakesIcon from "../assets/my-cakes-icon.png";
import homeIcon from "../assets/home-icon.png";
import profileIcon from "../assets/profile-icon.png";
import Modal from "../components/Modal";
import { resolveImageUrl } from "../utils/imageUrls";

export default function AppLayout() {
  const navigate = useNavigate();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [bakerName, setBakerName] = useState("Baker");
  const [bakerLogo, setBakerLogo] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const syncBaker = () => {
      try {
        const stored = localStorage.getItem("bakerUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) setBakerName(parsed.name);
          setBakerLogo(parsed?.logo || "");
        }
      } catch {
        /* ignore */
      }
    };

    syncBaker();
    const onStorage = (event) => {
      if (event.key === "bakerUser") {
        syncBaker();
      }
    };
    const onBakerUpdate = () => syncBaker();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncBaker);
    window.addEventListener("baker-user-updated", onBakerUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncBaker);
      window.removeEventListener("baker-user-updated", onBakerUpdate);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("bakerToken");
    localStorage.removeItem("bakerUser");
    localStorage.removeItem("id");
    navigate("/baker/sign-in", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img
            src={logoHorizontal}
            alt="CakeCraft Logo"
            style={{ width: "100%", height: "auto", maxWidth: "160px" }}
          />
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={homeIcon} alt="Dashboard" className="nav-img-icon" /> Dashboard
          </NavLink>
          <NavLink
            to="/cakes"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={cakesIcon} alt="My Cakes" className="nav-img-icon" /> My Cakes
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={boxIcon} alt="Orders" className="nav-img-icon" /> Orders
          </NavLink>
          <NavLink
            to="/baker/my-profile"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={profileIcon} alt="My Profile" className="nav-img-icon" /> My Profile
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={settingsIcon} alt="Settings" className="nav-img-icon" /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar-circle" style={{ overflow: "hidden" }}>
              {resolveImageUrl(API_BASE_URL, bakerLogo) && (
                <img
                  src={resolveImageUrl(API_BASE_URL, bakerLogo)}
                  alt={bakerName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{bakerName}</div>
              <div className="user-role">Baker</div>
            </div>
          </div>
          <button className="signout-link" onClick={() => setIsSignOutOpen(true)}>
            ⟵ Sign Out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      {isSignOutOpen && (
        <Modal onClose={() => setIsSignOutOpen(false)}>
          <h2 className="modal-h2">sign out?</h2>
          <p className="modal-p">are you sure you want to sign out?</p>
          <div className="modal-footer">
            <button
              type="button"
              className="ghost-btn"
              style={{ width: "100%" }}
              onClick={() => setIsSignOutOpen(false)}
            >
              cancel
            </button>
            <button
              type="button"
              className="primary-btn wide"
              onClick={() => {
                setIsSignOutOpen(false);
                handleSignOut();
              }}
            >
              sign out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
