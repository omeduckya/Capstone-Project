import { Outlet, NavLink, useNavigate } from "react-router-dom";
import logoHorizontal from "../assets/logo_horizontal.png"; 
import settingsIcon from "../assets/settings-icon.png";
import boxIcon from "../assets/box-icon.png";
import homeIcon from "../assets/home-icon.png";
import favoritesIcon from "../assets/favorites-icon.png";
import "./styles.css";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { resolveCustomerAvatar } from "../utils/customerAvatar";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerPhoto, setCustomerPhoto] = useState("");
  const [customerAvatarPreset, setCustomerAvatarPreset] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const syncCustomer = () => {
      try {
        const stored = localStorage.getItem("customerUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) setCustomerName(parsed.name);
          setCustomerPhoto(parsed?.photo || "");
          setCustomerAvatarPreset(parsed?.avatarPreset || "");
        }
      } catch {
        /* ignore */
      }
    };

    syncCustomer();
    const onStorage = (event) => {
      if (event.key === "customerUser") {
        syncCustomer();
      }
    };
    const onCustomerUpdate = () => syncCustomer();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncCustomer);
    window.addEventListener("customer-user-updated", onCustomerUpdate);
    try {
      syncCustomer();
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncCustomer);
      window.removeEventListener("customer-user-updated", onCustomerUpdate);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");
    navigate("/customer/sign-in", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img 
            src={logoHorizontal} 
            alt="CakeCraft Logo" 
            style={{ width: '100%', height: 'auto', maxWidth: '160px' }} 
          />
        </div>

                <nav className="sidebar-nav">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={homeIcon} alt="Home" className="nav-img-icon" /> Home
          </NavLink>
          <NavLink
            to="/my-orders"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={boxIcon} alt="My Orders" className="nav-img-icon" /> My Orders
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={favoritesIcon} alt="Favorites" className="nav-img-icon" /> Favorites
          </NavLink>
          <NavLink
            to="/customer/settings"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <img src={settingsIcon} alt="Settings" className="nav-img-icon" /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar-circle customer-avatar" style={{ overflow: "hidden" }}>
              {resolveCustomerAvatar(API_BASE_URL, customerPhoto, customerAvatarPreset) && (
                <img
                  src={resolveCustomerAvatar(API_BASE_URL, customerPhoto, customerAvatarPreset)}
                  alt={customerName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{customerName}</div>
              <div className="user-role">Customer</div>
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



