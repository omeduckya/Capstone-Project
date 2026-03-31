import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditCake() {
  const navigate = useNavigate();
  const { id } = useParams(); // get cake id

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
  });

  // go to page to get cake info
  useEffect(() => {
    fetch(`http://localhost:5000/api/cakes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
      })
      .catch((err) => console.error("Load cake error:", err));
  }, [id]);

  // if change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // submit updates
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/cakes/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Cake updated!");
        navigate("/cakes");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <button onClick={() => navigate(-1)}>⟵</button>
          <div>
            <h1>Edit Cake</h1>
            <p>Update your cake listing</p>
          </div>
        </div>
        <button className="primary-btn" onClick={handleSubmit}>
          Save Changes
        </button>
      </header>

      <form onSubmit={handleSubmit} className="edit-form">
        <section className="card">
          <div className="field">
            <span>Cake Name</span>
            <input
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <span>Description</span>
            <textarea
              name="description"
              className="textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2 gap-lg">
            <label className="field">
              <span>Price</span>
              <input
                name="price"
                type="number"
                className="input"
                value={formData.price}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span>Servings</span>
              <input
                name="servings"
                className="input"
                value={formData.servings}
                onChange={handleChange}
              />
            </label>
          </div>

          {/* ⭐ 图片 */}
          <div className="field">
            <span>Image URL</span>
            <input
              name="imageUrl"
              className="input"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          {/* ⭐ notes */}
          <div className="field">
            <span>Notes</span>
            <textarea
              name="notes"
              className="textarea"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </section>
      </form>
    </div>
  );
}