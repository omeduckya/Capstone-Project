import React, { useEffect, useState } from "react";
import "./styles.css";

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    email: "",
    businessName: "",
    legalBusinessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    taxIdLast4: "",
  });
  const [payoutForm, setPayoutForm] = useState({
    accountHolderName: "",
    bankName: "",
    bankAccountLast4: "",
    stripeConnectAccountId: "",
  });
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const bakerId = (() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || null;
      }
    } catch {
      /* ignore */
    }
    return null;
  })();

  useEffect(() => {
    if (!bakerId) return;

    fetch(`${API_BASE_URL}/api/bakers/${bakerId}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setBusinessForm({
          email: data.email || "",
          businessName: data.businessName || "",
          legalBusinessName: data.legalBusinessName || "",
          businessEmail: data.businessEmail || data.email || "",
          businessPhone: data.businessPhone || data.phone || "",
          businessAddress: data.businessAddress || "",
          taxIdLast4: data.taxIdLast4 || "",
        });
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/bakers/${bakerId}/payout-method`)
      .then((res) => res.json())
      .then((data) => {
        const payout = data?.payoutAccount;
        if (!payout) return;
        setPayoutForm({
          accountHolderName: payout.accountHolderName || "",
          bankName: payout.bankName || "",
          bankAccountLast4: payout.bankAccountLast4 || "",
          stripeConnectAccountId: payout.stripeConnectAccountId || "",
        });
      })
      .catch(() => {});
  }, [API_BASE_URL, bakerId]);

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayoutChange = (e) => {
    const { name, value } = e.target;
    setPayoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveBusiness = async () => {
    if (!bakerId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bakers/${bakerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save business settings");

      try {
        const stored = localStorage.getItem("bakerUser");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem("bakerUser", JSON.stringify({ ...parsed, ...data }));
      } catch {
        /* ignore */
      }

      alert("Business settings saved");
    } catch (err) {
      alert(err.message || "Could not save business settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayout = async () => {
    if (!bakerId) return;
    setPayoutSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bakers/${bakerId}/payout-method`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not link bank account");
      alert("Bank account linked");
    } catch (err) {
      alert(err.message || "Could not link bank account");
    } finally {
      setPayoutSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <div>
            <h1 className="page-title">Business Settings</h1>
            <p className="page-subtitle">Set up the business details customers and payouts depend on.</p>
          </div>
        </div>
      </header>

      <div className="settings-column" style={{ gap: "24px" }}>
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">Business Information</h3>
              <p className="card-subtitle">This is the core information your bakery account needs to operate.</p>
            </div>
            <button className="primary-btn" onClick={handleSaveBusiness} disabled={saving}>
              {saving ? "Saving..." : "Save Business Info"}
            </button>
          </div>

          <div className="grid-2 gap-lg" style={{ marginTop: 16 }}>
            <label className="field">
              <span className="field-label">Account email</span>
              <input
                name="email"
                type="email"
                className="input"
                value={businessForm.email}
                onChange={handleBusinessChange}
                placeholder="Used to sign in"
              />
            </label>
            <label className="field">
              <span className="field-label">Display business name</span>
              <input
                name="businessName"
                className="input"
                value={businessForm.businessName}
                onChange={handleBusinessChange}
                placeholder="CakeCraft Studio"
              />
            </label>
            <label className="field">
              <span className="field-label">Legal business name</span>
              <input
                name="legalBusinessName"
                className="input"
                value={businessForm.legalBusinessName}
                onChange={handleBusinessChange}
                placeholder="Legal registered name"
              />
            </label>
            <label className="field">
              <span className="field-label">Business email</span>
              <input
                name="businessEmail"
                type="email"
                className="input"
                value={businessForm.businessEmail}
                onChange={handleBusinessChange}
                placeholder="orders@yourbakery.com"
              />
            </label>
            <label className="field">
              <span className="field-label">Business phone</span>
              <input
                name="businessPhone"
                className="input"
                value={businessForm.businessPhone}
                onChange={handleBusinessChange}
                placeholder="(555) 555-1234"
              />
            </label>
            <label className="field full">
              <span className="field-label">Business address</span>
              <input
                name="businessAddress"
                className="input"
                value={businessForm.businessAddress}
                onChange={handleBusinessChange}
                placeholder="Street, city, province/state, postal code"
              />
            </label>
            <label className="field">
              <span className="field-label">Tax ID / SIN last 4 only</span>
              <input
                name="taxIdLast4"
                className="input"
                value={businessForm.taxIdLast4}
                onChange={handleBusinessChange}
                placeholder="1234"
                maxLength={4}
              />
            </label>
          </div>

          <div className="info-box-blue" style={{ marginTop: 18 }}>
            For safety, only the last 4 digits of a tax identifier are stored here. Do not store a full SIN in plain app settings.
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">Payout Account</h3>
              <p className="card-subtitle">Link the bank account where Stripe payouts should land.</p>
            </div>
            <button className="primary-btn" onClick={handleSavePayout} disabled={payoutSaving}>
              {payoutSaving ? "Linking..." : "Link Bank Account"}
            </button>
          </div>

          <div className="grid-2 gap-lg" style={{ marginTop: 16 }}>
            <label className="field">
              <span className="field-label">Account holder name</span>
              <input
                name="accountHolderName"
                className="input"
                value={payoutForm.accountHolderName}
                onChange={handlePayoutChange}
                placeholder="Legal account holder name"
              />
            </label>
            <label className="field">
              <span className="field-label">Bank name</span>
              <input
                name="bankName"
                className="input"
                value={payoutForm.bankName}
                onChange={handlePayoutChange}
                placeholder="Name of bank"
              />
            </label>
            <label className="field">
              <span className="field-label">Bank account last 4</span>
              <input
                name="bankAccountLast4"
                className="input"
                value={payoutForm.bankAccountLast4}
                onChange={handlePayoutChange}
                placeholder="1234"
                maxLength={4}
              />
            </label>
            <label className="field">
              <span className="field-label">Stripe Connect account ID</span>
              <input
                name="stripeConnectAccountId"
                className="input"
                value={payoutForm.stripeConnectAccountId}
                onChange={handlePayoutChange}
                placeholder="acct_..."
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
