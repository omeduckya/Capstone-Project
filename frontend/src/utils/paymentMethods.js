const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getCustomerId() {
  try {
    const stored = localStorage.getItem("customerUser");
    if (!stored) return "";
    const parsed = JSON.parse(stored);
    return parsed?.id || parsed?._id || "";
  } catch {
    return "";
  }
}

function syncLocalPaymentState(profile) {
  const methods = Array.isArray(profile?.paymentMethods) ? profile.paymentMethods : [];
  const cards = methods.filter((method) => method.type === "card");

  localStorage.setItem("savedCards", JSON.stringify(cards));
  localStorage.setItem("customerPaymentMethods", JSON.stringify(methods));

  try {
    const stored = localStorage.getItem("customerUser");
    const parsed = stored ? JSON.parse(stored) : {};
    localStorage.setItem(
      "customerUser",
      JSON.stringify({
        ...parsed,
        paypalEmail: profile?.paypalEmail || "",
        preferredPaymentMethod: profile?.preferredPaymentMethod || "",
        paymentMethods: methods,
      })
    );
  } catch {
    /* ignore */
  }
}

export async function fetchCustomerPaymentProfile() {
  const customerId = getCustomerId();
  if (!customerId) {
    return { paymentMethods: [], paypalEmail: "", preferredPaymentMethod: "" };
  }

  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/payment-methods`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not load payment methods");
  }
  syncLocalPaymentState(data);
  return data;
}

export async function saveStripeCard(paymentMethod) {
  const customerId = getCustomerId();
  if (!customerId) throw new Error("Please sign in as a customer first.");

  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/payment-methods/card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentMethodId: paymentMethod?.id,
      brand: paymentMethod?.card?.brand || "Card",
      last4: paymentMethod?.card?.last4 || "",
      expMonth: paymentMethod?.card?.exp_month || null,
      expYear: paymentMethod?.card?.exp_year || null,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not save card");
  }
  syncLocalPaymentState(data);
  return data;
}

export async function savePaypalMethod(paypalEmail) {
  const customerId = getCustomerId();
  if (!customerId) throw new Error("Please sign in as a customer first.");

  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/payment-methods/paypal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paypalEmail }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not link PayPal");
  }
  syncLocalPaymentState(data);
  return data;
}

export async function setDefaultPaymentMethod(paymentMethodId) {
  const customerId = getCustomerId();
  if (!customerId) throw new Error("Please sign in as a customer first.");

  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/payment-methods/default`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentMethodId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not update default payment method");
  }
  syncLocalPaymentState(data);
  return data;
}

export async function removePaymentMethod(paymentMethodId) {
  const customerId = getCustomerId();
  if (!customerId) throw new Error("Please sign in as a customer first.");

  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/payment-methods/${paymentMethodId}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not remove payment method");
  }
  syncLocalPaymentState(data);
  return data;
}
