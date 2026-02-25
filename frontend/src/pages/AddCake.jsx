// src/pages/AddCake.jsx
import { useNavigate } from "react-router-dom";

export default function AddCake() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/cakes");
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <button className="icon-back" onClick={() => navigate(-1)}>
            ⟵
          </button>
          <div>
            <h1 className="page-title">Add New Cake</h1>
            <p className="page-subtitle">
              Create a new cake listing for customers
            </p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="ghost-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="primary-btn">Save &amp; Publish</button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="long-form">
        <section className="card">
          <h3 className="card-title">Cake Images</h3>
          <p className="card-subtitle">
            Upload high-quality photos of your cake (up to 5 images)
          </p>
          <div className="image-upload-main">
            <div className="image-drop">
              <span className="upload-icon">⬆</span>
              <p>Drop your main image here</p>
              <p className="helper-text">
                or click to browse from your computer
              </p>
              <p className="helper-text small">
                Recommended: 1200×800px, JPG or PNG, max 5MB
              </p>
            </div>
          </div>
          <div className="image-upload-row">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="image-slot">
                Add Photo {i + 1}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Basic Information</h3>
          <div className="grid-2 gap-lg">
            <label className="field full">
              <span className="field-label">
                Cake Name <span className="required">*</span>
              </span>
              <input
                className="input"
                placeholder="e.g., Red Velvet Dream Cake"
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">
              Description <span className="required">*</span>
            </span>
            <textarea
              className="textarea"
              placeholder="Describe your cake, ingredients, and what makes it special..."
            />
          </label>

          <div className="grid-3 gap-lg">
            <label className="field">
              <span className="field-label">
                Base Price <span className="required">*</span>
              </span>
              <div className="input-with-prefix">
                <span>$</span>
                <input className="input no-padding" placeholder="0.00" />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Servings</span>
              <input
                className="input"
                placeholder="e.g., 10–12 people"
              />
            </label>
            <label className="field">
              <span className="field-label">Preparation Time</span>
              <input
                className="input"
                placeholder="e.g., 24–48 hours"
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Cake Specifications</h3>
          <div className="grid-3 gap-lg">
            {["Size", "Shape", "Flavour", "Filling", "Number of Tiers", "Frosting Type"].map(
              (label) => (
                <label key={label} className="field">
                  <span className="field-label">{label}</span>
                  <input className="input" />
                </label>
              )
            )}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Customization Options</h3>
          <p className="card-subtitle">
            Allow customers to personalize this cake
          </p>
          <div className="checkbox-column">
            <label className="checkbox">
              <input type="checkbox" />{" "}
              <span>
                Allow custom messages
                <span className="checkbox-sub">
                  Customers can add personalized text
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input type="checkbox" />{" "}
              <span>
                Allow color customization
                <span className="checkbox-sub">
                  Customers can choose cake colors
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input type="checkbox" />{" "}
              <span>
                Available for rush orders
                <span className="checkbox-sub">
                  Can be prepared in under 24 hours (additional fees may apply)
                </span>
              </span>
            </label>
            <label className="checkbox">
              <input type="checkbox" />{" "}
              <span>
                Dietary options available
                <span className="checkbox-sub">
                  Offer gluten-free, vegan, or sugar-free alternatives
                </span>
              </span>
            </label>
          </div>
        </section>
      </form>
    </div>
  );
}