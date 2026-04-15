import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import { resolveImageUrl } from "../utils/imageUrls";
import {
  BAKER_CUSTOMIZATION_CHOICES,
  createCustomizationState,
  normalizeCustomizationOptions,
} from "../utils/bakerCustomization";

export default function BakerMyProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    location: "",
    phone: "",
    description: "",
    publicProfileVisible: true,
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [logoStatus, setLogoStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [cakes, setCakes] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(() => createCustomizationState(false));
  const [policies, setPolicies] = useState({
    minNotice: "",
    maxOrdersPerDay: "",
    rushFee: "",
    cancellationPolicy: "",
    deliveryFee: "",
    deliveryRadius: "",
    pickupOffered: true,
    minOrderValue: "",
    consultationFee: "",
  });

  const bakerId = (() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || localStorage.getItem("id");
      }
    } catch {
      /* ignore */
    }
    return localStorage.getItem("id");
  })();

  useEffect(() => {
    if (!bakerId) return;
    fetch(`${API_BASE_URL}/api/bakers/${bakerId}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          businessName: data.businessName || prev.businessName,
          location: data.location || prev.location,
          phone: data.phone || prev.phone,
          description: data.description || prev.description,
          publicProfileVisible: data.publicProfileVisible ?? prev.publicProfileVisible,
        }));
        setSelectedOptions(normalizeCustomizationOptions(data.customizationOptions));
        setPolicies((prev) => ({
          ...prev,
          minNotice: data.minNotice ?? prev.minNotice,
          maxOrdersPerDay: data.maxOrdersPerDay ?? prev.maxOrdersPerDay,
          rushFee: data.rushFee ?? prev.rushFee,
          cancellationPolicy: data.cancellationPolicy ?? prev.cancellationPolicy,
          deliveryFee: data.deliveryFee ?? prev.deliveryFee,
          deliveryRadius: data.deliveryRadius ?? prev.deliveryRadius,
          pickupOffered: data.pickupOffered ?? prev.pickupOffered,
          minOrderValue: data.minOrderValue ?? prev.minOrderValue,
          consultationFee: data.consultationFee ?? prev.consultationFee,
        }));
        if (data.logo) setLogoUrl(data.logo);
      })
      .catch(() => {});
  }, [API_BASE_URL, bakerId]);

  useEffect(() => {
    if (!bakerId) return;
    fetch(`${API_BASE_URL}/api/cakes?userId=${bakerId}`)
      .then((res) => res.json())
      .then((data) => setCakes(Array.isArray(data) ? data : []))
      .catch(() => setCakes([]));
  }, [API_BASE_URL, bakerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setPolicies((prev) => ({ ...prev, [name]: value }));
  };

  const toggleOption = (group, item) => {
    setSelectedOptions((prev) => {
      const current = Array.isArray(prev[group]) ? prev[group] : [];
      return {
        ...prev,
        [group]: current.includes(item)
          ? current.filter((entry) => entry !== item)
          : [...current, item],
      };
    });
  };

  const addCustomOption = (group, draftKey) => {
    const value = String(selectedOptions[draftKey] || "").trim();
    if (!value) return;
    setSelectedOptions((prev) => {
      const current = Array.isArray(prev[group]) ? prev[group] : [];
      if (current.includes(value)) {
        return { ...prev, [draftKey]: "" };
      }
      return {
        ...prev,
        [group]: [...current, value],
        [draftKey]: "",
      };
    });
  };

  const updateCustomDraft = (draftKey, value) => {
    setSelectedOptions((prev) => ({ ...prev, [draftKey]: value }));
  };

  const handleLogoUpload = async (file) => {
    if (!file || !bakerId) return;
    setLogoStatus("uploading logo...");
    try {
      const body = new FormData();
      body.append("files", file);
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload?context=baker`, {
        method: "POST",
        body,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.error || "upload failed");
      const uploaded = uploadData.urls?.[0];
      if (!uploaded) throw new Error("no url returned");
      setLogoUrl(uploaded);
      setLogoStatus("logo updated");
    } catch (err) {
      setLogoStatus(err.message || "upload failed");
    }
  };

  const handleSave = async () => {
    if (!bakerId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bakers/${bakerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          logo: logoUrl,
          minNotice: policies.minNotice,
          maxOrdersPerDay: policies.maxOrdersPerDay,
          rushFee: policies.rushFee,
          cancellationPolicy: policies.cancellationPolicy,
          deliveryFee: policies.deliveryFee,
          deliveryRadius: policies.deliveryRadius,
          pickupOffered: policies.pickupOffered,
          minOrderValue: policies.minOrderValue,
          consultationFee: policies.consultationFee,
          customizationOptions: {
            flavours: selectedOptions.flavours,
            frostings: selectedOptions.frostings,
            fillings: selectedOptions.fillings,
            shapes: selectedOptions.shapes,
            dietary: selectedOptions.dietary,
            tiers: selectedOptions.tiers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "save failed");
      try {
        const stored = localStorage.getItem("bakerUser");
        const merged = stored ? { ...JSON.parse(stored), ...data } : data;
        localStorage.setItem("bakerUser", JSON.stringify(merged));
        window.dispatchEvent(new Event("baker-user-updated"));
      } catch {
        /* ignore */
      }
      alert("Profile saved");
    } catch (err) {
      alert(err.message || "save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-inner baker-profile-page">
        <header className="white-header-box baker-profile-header">
          <div className="header-left-content header-text">
            <div className="header-text-info">
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Preview what customers will see.</p>
            </div>
          </div>
          <div className="header-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link
              className="btn-pink-full-width outline compact"
              to={`/baker/${bakerId}`}
            >
              View my public profile
            </Link>
            <button className="btn-pink-full-width compact" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </header>

        <div className="content-scroll-area">
        <div className="profile-section-white">
          <div className="baker-profile-grid">
            <div className="profile-logo-column">
              <div
                className="avatar-pink-solid large"
                style={{ width: 140, height: 140, overflow: "hidden" }}
              >
                {logoUrl ? (
                  <img
                    src={resolveImageUrl(API_BASE_URL, logoUrl)}
                    alt="logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  <span role="img" aria-label="logo" style={{ fontSize: 36 }}>
                    🧁
                  </span>
                )}
              </div>
              <button className="ghost-btn" onClick={() => fileInputRef.current?.click()}>
                Upload logo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleLogoUpload(e.target.files?.[0])}
              />
              {logoStatus && <span className="muted">{logoStatus}</span>}
            </div>

            <div className="baker-details-text">
              <div className="grid-2 gap-lg">
                <label className="field">
                  <span className="field-label">Business name</span>
                  <input
                    name="businessName"
                    className="input"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="CakeCraft Studio"
                  />
                </label>
                <label className="field">
                  <span className="field-label">Contact name</span>
                  <input
                    name="name"
                    className="input"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </label>
              </div>
              <div className="grid-2 gap-lg">
                <label className="field">
                  <span className="field-label">Location</span>
                  <input
                    name="location"
                    className="input"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </label>
                <label className="field">
                  <span className="field-label">Phone</span>
                  <input
                    name="phone"
                    className="input"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 555-1234"
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Short bio / description</span>
                <textarea
                  name="description"
                  className="textarea"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your specialty, experience, and style."
                />
              </label>
              <label className="checkout-toggle-row" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  name="publicProfileVisible"
                  checked={Boolean(form.publicProfileVisible)}
                  onChange={handleChange}
                />
                <span>
                  Make my account visible to customers
                  <small>
                    Turn this on when your profile is ready to appear in customer browse results.
                  </small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <section className="card" style={{ marginTop: 16 }}>
          <h3 className="card-title">Policies & Info</h3>
          <div className="grid-2 gap-lg">
            <Field
              label="Minimum notice"
              name="minNotice"
              value={policies.minNotice}
              onChange={handlePolicyChange}
              placeholder="e.g., 48 hours"
            />
            <Field
              label="Max orders/day"
              name="maxOrdersPerDay"
              value={policies.maxOrdersPerDay}
              onChange={handlePolicyChange}
              placeholder="e.g., 5"
            />
            <Field
              label="Rush order fee"
              name="rushFee"
              value={policies.rushFee}
              onChange={handlePolicyChange}
              placeholder="$ 20"
            />
            <Field
              label="Cancellation policy"
              name="cancellationPolicy"
              value={policies.cancellationPolicy}
              onChange={handlePolicyChange}
              placeholder="e.g., 48h notice required"
            />
            <Field
              label="Delivery fee"
              name="deliveryFee"
              value={policies.deliveryFee}
              onChange={handlePolicyChange}
              placeholder="$ 15"
            />
            <Field
              label="Delivery radius (km)"
              name="deliveryRadius"
              value={policies.deliveryRadius}
              onChange={handlePolicyChange}
              placeholder="15"
            />
            <div className="field">
              <span className="field-label">Pickup offered</span>
              <select
                className="input"
                name="pickupOffered"
                value={policies.pickupOffered ? "yes" : "no"}
                onChange={(e) => setPolicies((prev) => ({ ...prev, pickupOffered: e.target.value === "yes" }))}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <Field
              label="Minimum order value"
              name="minOrderValue"
              value={policies.minOrderValue}
              onChange={handlePolicyChange}
              placeholder="$ 50"
            />
            <Field
              label="Consultation fee"
              name="consultationFee"
              value={policies.consultationFee}
              onChange={handlePolicyChange}
              placeholder="$ 0"
            />
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <div className="section-header">
            <div>
              <h3 className="card-title">Cake Customization Options</h3>
              <p className="card-subtitle">Click the options you want customers to be able to choose from your store.</p>
            </div>
          </div>

          <div className="customization-layout">
            <OptionSection
              title="Available Cake Flavours"
              group="flavours"
              items={BAKER_CUSTOMIZATION_CHOICES.flavours}
              selected={selectedOptions}
              onToggle={toggleOption}
              customValue={selectedOptions.customFlavour}
              onCustomChange={(value) => updateCustomDraft("customFlavour", value)}
              onAddCustom={() => addCustomOption("flavours", "customFlavour")}
              customPlaceholder="Add your own flavour"
            />

            <hr className="divider" />

            <OptionSection
              title="Available Frostings"
              group="frostings"
              items={BAKER_CUSTOMIZATION_CHOICES.frostings}
              selected={selectedOptions}
              onToggle={toggleOption}
              customValue={selectedOptions.customFrosting}
              onCustomChange={(value) => updateCustomDraft("customFrosting", value)}
              onAddCustom={() => addCustomOption("frostings", "customFrosting")}
              customPlaceholder="Add your own frosting"
            />

            <hr className="divider" />

            <OptionSection
              title="Available Fillings"
              group="fillings"
              items={BAKER_CUSTOMIZATION_CHOICES.fillings}
              selected={selectedOptions}
              onToggle={toggleOption}
              customValue={selectedOptions.customFilling}
              onCustomChange={(value) => updateCustomDraft("customFilling", value)}
              onAddCustom={() => addCustomOption("fillings", "customFilling")}
              customPlaceholder="Add your own filling"
            />

            <hr className="divider" />

            <div className="grid-2">
              <OptionSection
                title="Available Shapes"
                group="shapes"
                items={BAKER_CUSTOMIZATION_CHOICES.shapes}
                selected={selectedOptions}
                onToggle={toggleOption}
                customValue={selectedOptions.customShape}
                onCustomChange={(value) => updateCustomDraft("customShape", value)}
                onAddCustom={() => addCustomOption("shapes", "customShape")}
                customPlaceholder="Add your own shape"
              />
              <OptionSection
                title="Dietary Options"
                group="dietary"
                items={BAKER_CUSTOMIZATION_CHOICES.dietary}
                selected={selectedOptions}
                onToggle={toggleOption}
                customValue={selectedOptions.customDietary}
                onCustomChange={(value) => updateCustomDraft("customDietary", value)}
                onAddCustom={() => addCustomOption("dietary", "customDietary")}
                customPlaceholder="Add your own dietary option"
              />
            </div>

            <hr className="divider" />

            <OptionSection
              title="Available Tier Options"
              group="tiers"
              items={BAKER_CUSTOMIZATION_CHOICES.tiers}
              selected={selectedOptions}
              onToggle={toggleOption}
              customValue={selectedOptions.customTier}
              onCustomChange={(value) => updateCustomDraft("customTier", value)}
              onAddCustom={() => addCustomOption("tiers", "customTier")}
              customPlaceholder="Add your own tier option"
            />
          </div>
        </section>

        {/* <h2 id="baker-cakes-section" className="section-title" style={{ marginTop: 20 }}>
          Available cakes
        </h2> */}
        <section className="card" style={{ marginTop: 12 }}>
          <div className="section-header" style={{ alignItems: "center" }}>
            <div>
              <h3 className="card-title">Cakes gallery</h3>
              <p className="card-subtitle">Customers see these cakes on your profile.</p>
            </div>
            <button className="ghost-btn" onClick={() => navigate("/cakes/new")}>
              + Add cake
            </button>
          </div>
          {cakes.length === 0 ? (
            <p className="muted">No cakes yet. Add your first cake to showcase your work.</p>
          ) : (
            <section className="grid-cards">
              {cakes.map((c) => (
                <article key={c._id} className="cake-card">
                  <div
                    className="cake-thumb"
                    style={
                      normalizeImage(API_BASE_URL, c)
                        ? {
                            backgroundImage: `url(${normalizeImage(API_BASE_URL, c)})`,
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
                  <div style={{ display: "flex", gap: 10, padding: "0 16px 16px" }}>
                    <button
                      className="pill-button full"
                      type="button"
                      onClick={() => navigate(`/cakes/${c._id}/edit`)}
                    >
                      Edit cake
                    </button>
                    <Link
                      className="pill-button full pill-button-outline"
                      style={{ margin: 0, textAlign: "center" }}
                      to={`/baker/${bakerId}`}
                    >
                      View live
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}

function OptionSection({
  title,
  group,
  items,
  selected,
  onToggle,
  customValue,
  onCustomChange,
  onAddCustom,
  customPlaceholder,
}) {
  const activeItems = Array.isArray(selected[group]) ? selected[group] : [];
  return (
    <div style={{ marginBottom: "15px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", color: "var(--navy)" }}>
        {title}
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
        {items.map((item) => {
          const isSelected = activeItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              className={isSelected ? "profile-option-chip active" : "profile-option-chip"}
              aria-pressed={isSelected}
              onClick={() => onToggle(group, item)}
            >
              {item}
            </button>
          );
        })}
        {activeItems
          .filter((item) => !items.includes(item))
          .map((item) => (
            <button
              key={item}
              type="button"
              className="profile-option-chip active"
              aria-pressed="true"
              onClick={() => onToggle(group, item)}
            >
              {item}
            </button>
          ))}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          className="input"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={customPlaceholder}
        />
        <button type="button" className="ghost-btn" onClick={onAddCustom}>
          Add
        </button>
      </div>
    </div>
  );
}

function Policy({ label, value }) {
  const display = value === undefined || value === null || value === "" ? "Not set" : value;
  return (
    <div className="info-tile">
      <div className="info-label">{label}</div>
      <div className="info-value">{display}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        name={name}
        className="input"
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

function normalizeImage(apiBase, cake) {
  const raw =
    cake.mainImage ||
    cake.imageUrl ||
    (Array.isArray(cake.galleryImages) ? cake.galleryImages[0] : null);
  return resolveImageUrl(apiBase, raw);
}

function formatPrice(val) {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return "$—";
  return `$${Number(val).toFixed(0)}`;
}
