// src/pages/Settings.jsx
export default function Settings() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Business Settings</h1>
          <p className="page-subtitle">Customize your CakeCraft Studio</p>
        </div>
        <button className="primary-btn">Save Changes</button>
      </header>

      <div className="settings-column">
        <section className="card">
          <h3 className="card-title">Order Policies</h3>
          <div className="grid-3 gap-lg">
            <Field label="Minimum Order Notice" value="48 hours" />
            <Field label="Maximum Orders Per Day" value="5" />
            <Field label="Cancelation Policy" value="24 hours notice" />
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Delivery & Pickup</h3>
          <div className="grid-3 gap-lg">
            <Field label="Delivery Options" value="City Only" />
            <Field label="Delivery Radius" value="15 km" />
            <Field label="Delivery Fee" value="$10–$25" />
          </div>
          <label className="checkbox">
            <input type="checkbox" /> <span>Offer Pickup</span>
          </label>
        </section>

        <section className="card">
          <h3 className="card-title">Pricing Preferences</h3>
          <div className="grid-3 gap-lg">
            <Field label="Currency" value="USD" />
            <Field label="Tax Rate" value="8.5%" />
            <Field label="Rush Order Surcharge" value="20%" />
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Cake Customization Options</h3>
          <p className="card-subtitle">Available cake flavors, sizes, and more</p>
          <div className="pill-grid">
            {[
              "Vanilla",
              "Chocolate",
              "Red Velvet",
              "Lemon",
              "Strawberry",
              "Carrot",
              "Marble",
            ].map((v) => (
              <span key={v} className="chip">
                {v}
              </span>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Accepted Payment Methods</h3>
          <div className="pill-grid">
            {["Cash", "Credit Card", "Debit", "Online Transfer"].map((v) => (
              <span key={v} className="chip">
                {v}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="settings-field">
      <div className="settings-label">{label}</div>
      <div className="settings-value">{value}</div>
    </div>
  );
}