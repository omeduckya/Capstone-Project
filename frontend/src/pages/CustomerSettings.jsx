import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Components/Modal";
import "./styles.css";
import { fetchCustomerPaymentProfile } from "../utils/paymentMethods";
import {
  CUSTOMER_AVATAR_PRESETS,
  resolveCustomerAvatar,
} from "../utils/customerAvatar";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

export default function CustomerSettings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("Name Lastname");
  const [email, setEmail] = useState("your@email.com");
  const [phone, setPhone] = useState("+1 (613) 123-4567");
  const [location, setLocation] = useState("Ottawa, ON");
  const [preferredRadius, setPreferredRadius] = useState("15");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [avatarPreset, setAvatarPreset] = useState("berry");
  const [uploadStatus, setUploadStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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
        if (parsed?.avatarPreset) setAvatarPreset(parsed.avatarPreset);
      }
    } catch {
      /* ignore */
    }

    fetchCustomerPaymentProfile()
      .then((profile) => setPaymentMethods(profile.paymentMethods || []))
      .catch(() => setPaymentMethods([]));
  }, []);

  const persistCustomerSettings = async (nextFields) => {
    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem("customerUser", JSON.stringify({ ...parsed, ...nextFields }));
      window.dispatchEvent(new Event("customer-user-updated"));
    } catch {
      /* ignore */
    }

    if (!customerId) throw new Error("Please sign in as a customer first.");

    const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextFields),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not save settings");

    try {
      const stored = localStorage.getItem("customerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem("customerUser", JSON.stringify({ ...parsed, ...data }));
      window.dispatchEvent(new Event("customer-user-updated"));
    } catch {
      /* ignore */
    }

    return data;
  };

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
      await persistCustomerSettings({ photo: url, avatarPreset });
      setIsAvatarModalOpen(false);
      setUploadStatus("Photo saved");
    } catch (err) {
      setUploadStatus(err.message || "Upload failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadStatus("");

    try {
      await persistCustomerSettings({
        name: fullName,
        email,
        phone,
        location,
        preferredRadius,
        photo: photoUrl,
        avatarPreset,
      });
      setUploadStatus("Settings saved");
    } catch (err) {
      setUploadStatus(err.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = resolveCustomerAvatar(API_BASE_URL, photoUrl, avatarPreset);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your account details</p>
          </div>
        </div>
      </header>

      <div className="content-scroll-area">
        <div className="profile-header-card-figma">
          <div className="avatar-with-camera">
            <div className="avatar-pink-solid" style={{ overflow: "hidden" }}>
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span aria-label="profile" style={{ fontSize: 28, fontWeight: 700 }}>
                  {String(fullName || "C").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              className="camera-badge"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Choose avatar"
            >
              +
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
            <h2 className="page-title" style={{ margin: 0 }}>{fullName}</h2>
            <p className="page-subtitle" style={{ margin: 0 }}>Member since February 2026</p>
            <p className="helper-text" style={{ marginTop: 8 }}>
              Your picture shows in the sidebar and on the baker side when you place an order.
            </p>
            {uploadStatus && <p className="helper-text" style={{ marginTop: 6 }}>{uploadStatus}</p>}
          </div>
        </div>

        <div className="profile-section-white">
          <h3 className="card-title">Personal Information</h3>
          <div className="form-grid-figma">
            <div className="form-item-full">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-item-full">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label>Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label>Search Radius (km)</label>
              <select value={preferredRadius} onChange={(e) => setPreferredRadius(e.target.value)}>
                {RADIUS_OPTIONS.map((radius) => (
                  <option key={radius} value={String(radius)}>
                    {radius} km
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-buttons">
            <button
              className="btn-cancel"
              type="button"
              onClick={() => {
                try {
                  const stored = localStorage.getItem("customerUser");
                  const parsed = stored ? JSON.parse(stored) : {};
                  setFullName(parsed?.name || "Name Lastname");
                  setEmail(parsed?.email || "your@email.com");
                  setPhone(parsed?.phone || "+1 (613) 123-4567");
                  setLocation(parsed?.location || "Ottawa, ON");
                  setPreferredRadius(String(parsed?.preferredRadius || "15"));
                  setPhotoUrl(parsed?.photo || "");
                  setAvatarPreset(parsed?.avatarPreset || "berry");
                  setUploadStatus("");
                } catch {
                  /* ignore */
                }
              }}
            >
              Cancel
            </button>
            <button className="btn-save-dark" type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="profile-section-white">
          <div className="section-header">
            <div>
              <h3 className="card-title">Payment Methods</h3>
              <p className="card-subtitle">Add your Stripe card or link PayPal for checkout.</p>
            </div>
            <button className="primary-btn" type="button" onClick={() => navigate("/payment-methods")}>
              Manage Payments
            </button>
          </div>

          {paymentMethods.length ? (
            <div className="payment-card-grid" style={{ marginTop: 16 }}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-card">
                  <div className="payment-card-top">
                    <span className="payment-card-brand">
                      {method.provider === "paypal" ? "PayPal" : method.brand || "Card"}
                    </span>
                    {method.isDefault && <span className="status-pill blue-pill">Default</span>}
                  </div>
                  <div className="payment-card-number">
                    {method.type === "paypal"
                      ? method.paypalEmail
                      : `.... .... .... ${method.last4 || "0000"}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="info-box-blue" style={{ marginTop: 16 }}>
              No saved payment methods yet. Add a card or PayPal account.
            </div>
          )}
        </div>
      </div>

      {isAvatarModalOpen && (
        <Modal onClose={() => setIsAvatarModalOpen(false)} cardClassName="modal-card avatar-picker-modal">
          <div className="avatar-picker-head">
            <div>
              <h2 className="modal-h2">Choose your look</h2>
              <p className="modal-p">
                Pick one of the illustrated avatars, choose a plain color, or upload your own picture.
              </p>
            </div>
            <div className="avatar-picker-current">
              {currentAvatar ? <img src={currentAvatar} alt="Current avatar" /> : null}
            </div>
          </div>

          <div className="avatar-preset-grid avatar-preset-grid--modal">
            {CUSTOMER_AVATAR_PRESETS.map((preset) => {
              const src = resolveCustomerAvatar(API_BASE_URL, "", preset.id);
              const selected = avatarPreset === preset.id && !photoUrl;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`avatar-preset-card ${selected ? "selected" : ""}`}
                  onClick={() => {
                    setAvatarPreset(preset.id);
                    setPhotoUrl("");
                    setUploadStatus("Avatar selected. Save changes to keep it.");
                  }}
                >
                  <span className="avatar-preset-preview">
                    <img src={src} alt={preset.label} />
                  </span>
                  <strong>{preset.label}</strong>
                  <span>{preset.mood}</span>
                </button>
              );
            })}
          </div>

          <div className="modal-footer avatar-picker-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload my own photo
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
