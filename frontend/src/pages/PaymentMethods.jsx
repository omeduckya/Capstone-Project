import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Modal from "../Components/Modal";
import PaymentForm from "../Components/PaymentForm";
import {
  fetchCustomerPaymentProfile,
  removePaymentMethod,
  savePaypalMethod,
  saveStripeCard,
  setDefaultPaymentMethod,
} from "../utils/paymentMethods";
import "./styles.css";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCustomerPaymentProfile()
      .then((profile) => {
        setPaymentMethods(profile.paymentMethods || []);
        setPaypalEmail(profile.paypalEmail || "");
      })
      .catch((err) => setStatus(err.message || "Could not load payment methods"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddCard = async (paymentMethod) => {
    const profile = await saveStripeCard(paymentMethod);
    setPaymentMethods(profile.paymentMethods || []);
    setPaypalEmail(profile.paypalEmail || "");
    setShowCardModal(false);
    setStatus("Card saved to your account.");
  };

  const handleSavePaypal = async () => {
    if (!paypalEmail.trim()) {
      setStatus("Enter a PayPal email address first.");
      return;
    }
    setBusy(true);
    try {
      const profile = await savePaypalMethod(paypalEmail.trim());
      setPaymentMethods(profile.paymentMethods || []);
      setShowPaypalModal(false);
      setStatus("PayPal linked successfully.");
    } catch (err) {
      setStatus(err.message || "Could not link PayPal.");
    } finally {
      setBusy(false);
    }
  };

  const handleMakeDefault = async (id) => {
    setBusy(true);
    try {
      const profile = await setDefaultPaymentMethod(id);
      setPaymentMethods(profile.paymentMethods || []);
      setStatus("Default payment method updated.");
    } catch (err) {
      setStatus(err.message || "Could not update default payment method.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id) => {
    setBusy(true);
    try {
      const profile = await removePaymentMethod(id);
      setPaymentMethods(profile.paymentMethods || []);
      setPaypalEmail(profile.paypalEmail || "");
      setStatus("Payment method removed.");
    } catch (err) {
      setStatus(err.message || "Could not remove payment method.");
    } finally {
      setBusy(false);
    }
  };

  const stripeReady = useMemo(() => !!stripePromise, []);
  const hasStripeKey = Boolean(publishableKey);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Payment Methods</h1>
          <p className="page-subtitle">Manage your Stripe cards and PayPal account</p>
        </div>
        <div className="orders-header-actions">
          <button className="ghost-btn" onClick={() => setShowPaypalModal(true)}>
            Link PayPal
          </button>
          <button className="primary-btn" onClick={() => setShowCardModal(true)}>
            Add new card
          </button>
        </div>
      </header>

      {status && <div className="info-box-blue" style={{ marginBottom: 12 }}>{status}</div>}
      {loading && <p className="page-subtitle">Loading payment methods...</p>}

      <div className="payment-card-grid">
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
                : `•••• •••• •••• ${method.last4 || "0000"}`}
            </div>
            <div className="payment-card-meta">
              {method.type === "paypal" ? (
                <span>Pay online with PayPal</span>
              ) : (
                <span>
                  Exp {method.expMonth || "--"}/{method.expYear ? String(method.expYear).slice(-2) : "--"}
                </span>
              )}
              <span>ID {method.id}</span>
            </div>
            <div className="payment-card-actions">
              <button
                className="ghost-btn"
                onClick={() => handleMakeDefault(method.id)}
                disabled={method.isDefault || busy}
              >
                {method.isDefault ? "Default" : "Make default"}
              </button>
              <button className="ghost-btn" onClick={() => handleRemove(method.id)} disabled={busy}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && paymentMethods.length === 0 && (
        <div className="card">
          <p className="page-subtitle" style={{ marginBottom: 16 }}>
            Add a Stripe card or link PayPal so checkout can use a saved payment method.
          </p>
          <div className="orders-header-actions">
            <button className="ghost-btn" onClick={() => setShowPaypalModal(true)}>
              Link PayPal
            </button>
            <button className="primary-btn" onClick={() => setShowCardModal(true)}>
              Add card
            </button>
          </div>
        </div>
      )}

      {showCardModal && (
        <Modal onClose={() => setShowCardModal(false)}>
          <h2 className="modal-h2">Add a card</h2>
          <p className="modal-p">Your card details are handled securely by Stripe.</p>
          {hasStripeKey && stripeReady ? (
            <Elements stripe={stripePromise}>
              <PaymentForm onSuccess={handleAddCard} />
            </Elements>
          ) : (
            <div className="payment-form">
              <p className="auth-error-text">
                Stripe is not configured yet. Add `VITE_STRIPE_PUBLISHABLE_KEY` for live cards, or use a temporary test card below.
              </p>
              <button
                className="primary-btn wide"
                onClick={() =>
                  handleAddCard({
                    id: `pm_test_${Date.now()}`,
                    card: { last4: "4242", brand: "Test", exp_month: 12, exp_year: 2028 },
                  })
                }
              >
                Add temporary test card
              </button>
            </div>
          )}
        </Modal>
      )}

      {showPaypalModal && (
        <Modal onClose={() => setShowPaypalModal(false)}>
          <h2 className="modal-h2">Link PayPal</h2>
          <p className="modal-p">Save the PayPal email you want to use at checkout.</p>
          <div className="field" style={{ textAlign: "left" }}>
            <span className="field-label">PayPal email</span>
            <input
              className="input"
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="modal-footer">
            <button className="ghost-btn" type="button" onClick={() => setShowPaypalModal(false)}>
              Cancel
            </button>
            <button className="primary-btn wide" type="button" onClick={handleSavePaypal} disabled={busy}>
              {busy ? "Saving..." : "Save PayPal"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
