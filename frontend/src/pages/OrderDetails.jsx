// src/pages/OrderDetails.jsx
import { useNavigate, useParams } from "react-router-dom";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="page">
      <header className="page-header">
        <button className="icon-back" onClick={() => navigate(-1)}>
          ⟵
        </button>
        <div>
          <h1 className="page-title">Order #{id}</h1>
          <p className="page-subtitle">Review order details and take action</p>
        </div>
      </header>

      <div className="details-grid">
        <section className="card">
          <h3 className="card-title">Customer Information</h3>
          <div className="grid-2 gap-lg">
            <InfoTile label="Customer Name" value="Emily Johnson" icon="👤" />
            <InfoTile label="Phone Number" value="+1 (555) 123-4567" icon="📞" />
            <InfoTile label="Email Address" value="emily.j@email.com" icon="✉️" />
            <InfoTile label="Location" value="San Francisco, CA" icon="📍" />
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Delivery Information</h3>
          <div className="grid-2 gap-lg">
            <InfoTile label="Delivery Date" value="February 15, 2026" icon="📅" />
            <InfoTile label="Delivery Time" value="3:00 PM - 4:00 PM" icon="⏰" />
            <InfoTile label="Delivery Method" value="Pickup at your shop" icon="🚗" />
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Cake Specifications</h3>
          <div className="grid-3 tight">
            <InfoChip label="Cake Shape" value="Round" />
            <InfoChip label="Size" value="10 inch (Large)" />
            <InfoChip label="Flavour" value="Chocolate" />
            <InfoChip label="Filling" value="Chocolate Ganache" />
            <InfoChip label="Number of Tiers" value="2 tiers" />
            <InfoChip label="Frosting" value="Buttercream" />
            <InfoChip label="Servings" value="15–20 people" />
            <InfoChip label="Custom Message" value="Happy Birthday Sarah!" />
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Design Reference Images</h3>
          <div className="image-strip">
            <div className="image-placeholder" />
            <div className="image-placeholder" />
            <div className="image-placeholder" />
          </div>
        </section>

        <section className="card note-card">
          <h3 className="card-title">Special Instructions</h3>
          <p className="note-text">
            “Please make sure the chocolate is dark chocolate, not milk
            chocolate. Also, can you add some edible gold leaf decorations on
            top? Thank you!”
          </p>
        </section>

        <aside className="order-side">
          <section className="card">
            <h3 className="card-title">Order Status</h3>
            <span className="status-pill blue-pill large">
              Pending Review
            </span>
          </section>

          <section className="card">
            <h3 className="card-title">Price Breakdown</h3>
            <div className="price-row">
              <span>Base Cake</span>
              <span>$85.00</span>
            </div>
            <div className="price-row">
              <span>Custom Decorations</span>
              <span>$25.00</span>
            </div>
            <div className="price-row">
              <span>Personalized Text</span>
              <span>$15.00</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>$125.00</span>
            </div>
          </section>

          <section className="card action-card">
            <button className="action-btn green">Accept Order</button>
            <button className="action-btn yellow">Adjust Price</button>
            <button className="action-btn red">Decline Order</button>
          </section>

          <section className="card">
            <h3 className="card-title">Order Timeline</h3>
            <ol className="timeline">
              <li className="timeline-item completed">
                <span className="dot" />
                <div>
                  <div className="timeline-title">Order Placed</div>
                  <div className="timeline-sub">Feb 10, 2026 at 2:30 PM</div>
                </div>
              </li>
              <li className="timeline-item active">
                <span className="dot" />
                <div>
                  <div className="timeline-title">Awaiting Confirmation</div>
                  <div className="timeline-sub">Current Status</div>
                </div>
              </li>
              <li className="timeline-item">
                <span className="dot" />
                <div>
                  <div className="timeline-title">In Preparation</div>
                </div>
              </li>
              <li className="timeline-item">
                <span className="dot" />
                <div>
                  <div className="timeline-title">Ready for Pickup</div>
                </div>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ label, value, icon }) {
  return (
    <div className="info-tile">
      <div className="info-icon">{icon}</div>
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="info-chip">
      <div className="chip-label">{label}</div>
      <div className="chip-value">{value}</div>
    </div>
  );
}