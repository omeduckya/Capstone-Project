// src/pages/EditCake.jsx
import { useNavigate, useParams } from "react-router-dom";

export default function EditCake() {
  const navigate = useNavigate();
  useParams();

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
            <h1 className="page-title">Edit Cake</h1>
            <p className="page-subtitle">Update your cake listing</p>
          </div>
        </div>
        <button className="primary-btn">Save Changes</button>
      </header>

      <form onSubmit={handleSubmit} className="edit-form">
        <section className="card">
          <div className="field">
            <span className="field-label">Cake Name</span>
            <input className="input" defaultValue="Rose Garden Cake" />
          </div>
          <div className="field">
            <span className="field-label">Description</span>
            <textarea className="textarea" />
          </div>
          <div className="grid-2 gap-lg">
            <label className="field">
              <span className="field-label">Base Price</span>
              <div className="input-with-prefix">
                <span>$</span>
                <input className="input no-padding" defaultValue="85" />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Servings</span>
              <input className="input" defaultValue="10–12 people" />
            </label>
          </div>
        </section>
      </form>
    </div>
  );
}