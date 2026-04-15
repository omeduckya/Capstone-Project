import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("Name Lastname");
  const [email, setEmail] = useState("your@email.com");
  const [phone, setPhone] = useState("+1 (613) 123-4567");
  const [location, setLocation] = useState("Ottawa, ON");
  const [preferredRadius, setPreferredRadius] = useState("15");
  const [notifState, setNotifState] = useState([true, false, false, false]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const customerId = (() => {
    try {
      const stored = localStorage.getItem("customerUser");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return parsed?.id || parsed?._id || "";
    } catch {
      return "";
    }
  })();

  const toggleNotif = (index) => {
    const next = [...notifState];
    next[index] = !next[index];
    setNotifState(next);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setFullName(parsed.name);
        if (parsed?.email) setEmail(parsed.email);
        if (parsed?.phone) setPhone(parsed.phone);
        if (parsed?.location) setLocation(parsed.location);
        if (parsed?.preferredRadius) setPreferredRadius(String(parsed.preferredRadius));
        if (parsed?.photo) setPhotoUrl(parsed.photo);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadStatus("Uploading...");
    try {
      const form = new FormData();
      form.append("files", file);
      const res = await fetch(`${API_BASE_URL}/api/upload?context=customer`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const url = data.urls?.[0];
      if (!url) throw new Error("No URL returned");
      setPhotoUrl(url);
      if (customerId) {
        await persistCustomerProfile({ photo: url });
      }
      setUploadStatus("Saved");
    } catch (err) {
      setUploadStatus(err.message || "Upload failed");
    }
  };

  const persistCustomerProfile = async (nextFields) => {
    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem("customerUser", JSON.stringify({ ...parsed, ...nextFields }));
    } catch {
      /* ignore */
    }

    if (!customerId) return;

    const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextFields),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not save profile");

    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem("customerUser", JSON.stringify({ ...parsed, ...data }));
    } catch {
      /* ignore */
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadStatus("");

    try {
      await persistCustomerProfile({
        name: fullName,
        phone,
        location,
        preferredRadius,
        photo: photoUrl,
      });
      setUploadStatus("Profile saved");
    } catch (err) {
      setUploadStatus(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    { title: "Email notifications", desc: "Receive order updates via email" },
    { title: "SMS notifications", desc: "Get order status updates via text message" },
    { title: "Marketing emails", desc: "Receive special offers and promotions" },
    { title: "New baker alerts", desc: "Get notified when new bakers join near you" },
  ];

  return (
    <div className="page-container">
      <header className="white-header-box">
        <div className="header-text">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </header>

      <div className="content-scroll-area">
        <div className="profile-header-card-figma">
          <div className="avatar-with-camera">
            <div className="avatar-pink-solid" style={{ overflow: "hidden" }}>
              {photoUrl ? (
                <img
                  src={resolveImageUrl(API_BASE_URL, photoUrl)}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span role="img" aria-label="profile" style={{ fontSize: 28 }}>
                  🙂
                </span>
              )}
            </div>
            <button
              type="button"
              className="camera-badge"
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo"
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
            />
          </div>
          <div className="profile-header-details">
            <h2>{fullName}</h2>
            <p>Member since February 2026</p>
            <div className="profile-badges">
              <span className="badge-pink">12 Orders Placed</span>
              <span className="badge-gold">★ Gold Member</span>
            </div>
            {uploadStatus && <p className="helper-text" style={{ marginTop: 6 }}>{uploadStatus}</p>}
          </div>
        </div>

        <div className="profile-section-white">
          <h3>Personal Information</h3>
          <div className="form-grid-figma">
            <div className="form-item-full">
              <label>👤 Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="name lastname"
              />
            </div>
            <div className="form-item-full">
              <label>✉️ Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-item-half">
              <label>☎️ Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-item-half">
              <label>📍 Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-item-half">
              <label>Search Radius (km)</label>
              <select value={preferredRadius} onChange={(e) => setPreferredRadius(e.target.value)}>
                {[5, 10, 15, 25, 50].map((value) => (
                  <option key={value} value={String(value)}>
                    {value} km
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-buttons">
            <button className="btn-cancel">Cancel</button>
            <button className="btn-save-dark" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="profile-section-white">
          <h3>🔔 Notification Preferences</h3>
          <p className="section-subtext">Choose how you want to receive updates</p>
          <div className="notification-list-figma">
            {notificationItems.map((n, i) => (
              <div key={n.title} className="notif-row">
                <div className="notif-text">
                  <h4>{n.title}</h4>
                  <p>{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  className="notif-check"
                  checked={notifState[i]}
                  onChange={() => toggleNotif(i)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="profile-footer-actions">
          <div className="action-card-mini">
            <span className="icon-pink">🔒</span>
            <div>
              <h4>Change Password</h4>
              <p>Update your password and security</p>
            </div>
          </div>
          <button
            className="action-card-mini action-card-button"
            onClick={() => navigate("/payment-methods")}
          >
            <span className="icon-pink">💳</span>
            <div>
              <h4>Payment Methods</h4>
              <p>Manage your saved payment cards</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
