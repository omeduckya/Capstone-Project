import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const cardStyle = {
  style: {
    base: {
      color: "#111827",
      fontSize: "14px",
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      backgroundColor: "#ffffff",
      "::placeholder": { color: "#9ca3af" },
      padding: "12px 14px",
    },
    invalid: {
      color: "#d32f2f",
    },
  },
};

export default function PaymentForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setStatus("");

    const card = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setStatus(error.message || "Unable to save card.");
      setLoading(false);
      return;
    }

    // pretend to persist on server; do not store card details here
    try {
      await onSuccess?.(paymentMethod);
      setStatus("Card added securely.");
      elements.getElement(CardElement)?.clear();
    } catch (submitError) {
      setStatus(submitError?.message || "Unable to save card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <label className="field">
        <span className="field-label">Card details</span>
        <div className="card-element-shell">
          <CardElement options={cardStyle} />
        </div>
      </label>

      {status && <p className="auth-error-text" style={{ marginTop: 6 }}>{status}</p>}

      <button className="primary-btn wide" type="submit" disabled={!stripe || loading}>
        {loading ? "Saving..." : "Save card"}
      </button>
    </form>
  );
}
