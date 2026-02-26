import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // state to manage which modal is open and the success state
  const [activeModal, setActiveModal] = useState(null); // 'accept', 'adjust', 'decline'
  const [isSuccess, setIsSuccess] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setIsSuccess(false);
  };

  const handleConfirm = () => {
    // this mimics the api call success
    setIsSuccess(true);
  };

  return (
    <div className="page">
      <header className="page-header">
        <button className="icon-back" onClick={() => navigate(-1)}>⟵</button>
        <div>
          <h1 className="page-title">Order #{id}</h1>
          <p className="page-subtitle">review order details and take action</p>
        </div>
      </header>

      <div className="details-grid">
        <div className="details-main-content">
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
              “please make sure the chocolate is dark chocolate, not milk
              chocolate. also, can you add some edible gold leaf decorations on
              top? thank you!”
            </p>
          </section>
        </div>

        <aside className="order-side">
          <section className="card">
            <h3 className="card-title">Order Status</h3>
            <span className="status-pill blue-pill large">Pending Review</span>
          </section>

          <section className="card">
            <h3 className="card-title">Price Breakdown</h3>
            <div className="price-row"><span>Base Cake</span><span>$85.00</span></div>
            <div className="price-row"><span>Custom Decorations</span><span>$25.00</span></div>
            <div className="price-row"><span>Personalized Text</span><span>$15.00</span></div>
            <div className="price-row total"><span>Total</span><span>$125.00</span></div>
          </section>

          <section className="card action-card">
            <button className="action-btn green" onClick={() => setActiveModal('accept')}>Accept Order</button>
            <button className="action-btn yellow" onClick={() => setActiveModal('adjust')}>Adjust Price</button>
            <button className="action-btn red" onClick={() => setActiveModal('decline')}>Decline Order</button>
          </section>

          <section className="card">
            <h3 className="card-title">Order Timeline</h3>
            <ol className="timeline">
              <li className="timeline-item completed"><span className="dot" /><div><div className="timeline-title">Order Placed</div><div className="timeline-sub">Feb 10, 2026</div></div></li>
              <li className="timeline-item active"><span className="dot" /><div><div className="timeline-title">Awaiting Confirmation</div></div></li>
            </ol>
          </section>
        </aside>
      </div>

      {/* --- POPUP MODALS --- */}

      {activeModal === 'accept' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body">
              <div className="modal-icon-circle green"><span className="icon-check">✓</span></div>
              <h2 className="modal-h2">Accept Order?</h2>
              <p className="modal-p">By accepting this order, you confirm that you can fulfill it as specified for <strong style={{color: 'var(--red)'}}>$125</strong> by February 15, 2026.</p>
              <div className="modal-blue-box">
                <p><strong>Next Steps</strong></p>
                <p>• Customer will be notified immediately</p>
                <p>• Payment will be processed</p>
                <p>• Order moves to "In Preparation"</p>
              </div>
              <div className="modal-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn green-btn" onClick={handleConfirm}>Confirm Accept</button>
              </div>
            </div>
          ) : (
            <div className="modal-body">
              <div className="modal-icon-circle green">✓</div>
              <h2 className="modal-h2">Order Accepted!</h2>
              <p className="modal-p">Customer has been notified.</p>
              <button className="primary-btn green-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {activeModal === 'adjust' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body">
              <div className="modal-icon-circle yellow">$</div>
              <h2 className="modal-h2">Adjust Order Price</h2>
              <p className="modal-p">Update the price based on the customer's specifications.</p>
              <div className="field" style={{textAlign: 'left'}}>
                <label className="field-label">Current Price: $125</label>
                <div className="input-group">
                  <span className="input-prefix">$</span>
                  <input type="number" className="input" defaultValue="125" />
                </div>
              </div>
              <div className="field" style={{textAlign: 'left', marginTop: '15px'}}>
                <label className="field-label">Reason for Adjustment (Optional)</label>
                <textarea className="input" placeholder="e.g., Additional decorations..." rows="3" />
              </div>
              <div className="modal-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn yellow-btn" onClick={handleConfirm}>Submit New Price</button>
              </div>
            </div>
          ) : (
            <div className="modal-body">
              <div className="modal-icon-circle yellow">$</div>
              <h2 className="modal-h2">Price adjusted to $125.</h2>
              <p className="modal-p">Customer will be notified to approve.</p>
              <button className="primary-btn yellow-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}

      {activeModal === 'decline' && (
        <Modal onClose={closeModal}>
          {!isSuccess ? (
            <div className="modal-body">
              <div className="modal-icon-circle red">✕</div>
              <h2 className="modal-h2">Decline Order?</h2>
              <p className="modal-p">Let the customer know why you're unable to fulfill this order.</p>
              <div className="field" style={{textAlign: 'left'}}>
                <label className="field-label">Reason for Declining *</label>
                <textarea className="input" placeholder="e.g., Fully booked for that date..." rows="4" required />
              </div>
              <div className="modal-footer">
                <button className="secondary-btn" onClick={closeModal}>Cancel</button>
                <button className="primary-btn red-btn" onClick={handleConfirm}>Decline Order</button>
              </div>
            </div>
          ) : (
            <div className="modal-body">
              <div className="modal-icon-circle red">✕</div>
              <h2 className="modal-h2">Order Declined!</h2>
              <p className="modal-p">Customer has been notified.</p>
              <button className="primary-btn red-btn full-width" onClick={closeModal}>Continue</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// simple components
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

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}