// src/pages/EditCake.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles.css";

export default function EditCake() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    servings: "",
    prepTime: "",
    size: "",
    shape: "",
    flavor: "",
    filling: "",
    tiers: "",
    frosting: "",
    imageUrl: "",
    notes: "",
    allowCustomMessage: false,
    allowColorCustomization: false,
    availableForRushOrders: false,
    dietaryOptionsAvailable: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cakes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price ?? "",
          servings: data.servings || "",
          prepTime: data.prepTime || "",
          size: data.size || "",
          shape: data.shape || "",
          flavor: data.flavor || "",
          filling: data.filling || (data.fillings?.[0] || ""),
          tiers: data.tiers || "",
          frosting: data.frosting || "",
          imageUrl: data.mainImage || data.imageUrl || "",
          notes: data.notes || "",
          allowCustomMessage: Boolean(data.allowCustomMessage),
          allowColorCustomization: Boolean(data.allowColorCustomization),
          availableForRushOrders: Boolean(data.availableForRushOrders),
          dietaryOptionsAvailable: Boolean(data.dietaryOptionsAvailable),
        });
      })
      .catch((err) => {
        console.error("Load cake error:", err);
        setError("Failed to load cake.");
      })
      .finally(() => setLoading(false));
  }, [API_BASE_URL, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cakes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.price === "" ? "" : Number(formData.price),
          mainImage: formData.imageUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }
      alert("Cake updated!");
      navigate("/cakes");
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <button className="icon-back" onClick={() => navigate(-1)}>
            ⟵
          </button>
          <div>
            <h1 className="page-title">Edit Cake</h1>
            <p className="page-subtitle">Update your cake listing</p>
          </div>
        </div>
        <button className="primary-btn" onClick={handleSubmit} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      {error && <p className="auth-error-text" style={{ marginTop: 6 }}>{error}</p>}

      <form onSubmit={handleSubmit} className="edit-form">
        <section className="card">
          <div className="field">
            <span className="field-label">Cake Name</span>
            <input
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="field">
            <span className="field-label">Description</span>
            <textarea
              name="description"
              className="textarea"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Base Price</span>
              <div className="input-with-prefix">
                <span>$</span>
                <input
                  name="price"
                  type="number"
                  className="input no-padding"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Servings</span>
              <input
                name="servings"
                className="input"
                value={formData.servings}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Preparation Time</span>
              <input
                name="prepTime"
                className="input"
                value={formData.prepTime}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span className="field-label">Size</span>
              <input
                name="size"
                className="input"
                value={formData.size}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Shape</span>
              <input
                name="shape"
                className="input"
                value={formData.shape}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span className="field-label">Flavour</span>
              <input
                name="flavor"
                className="input"
                value={formData.flavor}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Filling</span>
              <input
                name="filling"
                className="input"
                value={formData.filling}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span className="field-label">Number of Tiers</span>
              <input
                name="tiers"
                className="input"
                value={formData.tiers}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Frosting Type</span>
              <input
                name="frosting"
                className="input"
                value={formData.frosting}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
            <label className="field">
              <span className="field-label">Image URL</span>
              <input
                name="imageUrl"
                className="input"
                value={formData.imageUrl}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <div className="field">
            <span className="field-label">Notes</span>
            <textarea
              name="notes"
              className="textarea"
              value={formData.notes}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="field">
            <span className="field-label">Customization Options</span>
            <div className="checkbox-column">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="allowCustomMessage"
                  checked={formData.allowCustomMessage}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Allow custom messages</span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="allowColorCustomization"
                  checked={formData.allowColorCustomization}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Allow color customization</span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="availableForRushOrders"
                  checked={formData.availableForRushOrders}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Available for rush orders</span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="dietaryOptionsAvailable"
                  checked={formData.dietaryOptionsAvailable}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Dietary options available</span>
              </label>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
