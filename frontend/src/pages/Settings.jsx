import React, { useState } from "react";
import "./styles.css";

export default function Settings() {
  // state to manage all selected customization options
  const [selectedOptions, setSelectedOptions] = useState([]);

  const toggleOption = (item) => {
    setSelectedOptions(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-left">
          <button className="icon-back">←</button>
          <div>
            <h1 className="page-title">Business Settings</h1>
            <p className="page-subtitle">Customize your offerings and policies.</p>
          </div>
        </div>
        <button className="primary-btn" onClick={() => alert("Settings Saved!")}>
          <span>💾</span> Save Changes
        </button>
      </header>

      <div className="settings-column" style={{ gap: '24px' }}>
        
        {/* order policies */}
        <section className="card">
          <div className="section-header">
            <div className="stat-icon blue">🛡️</div>
            <h3 className="card-title">Order Policies</h3>
          </div>
          <div className="grid-2">
            <Field label="Minimum Notice Required" placeholder="48 hours" help="How much advance notice do you need?" />
            <Field label="Maximum Orders Per Day" placeholder="5" help="Daily cake order capacity" />
            <Field label="Rush Order Fee" placeholder="$ 20" help="Extra charge for last-minute orders" />
            <Field label="Cancellation Policy" placeholder="24 hours notice" help="Your cancellation terms" />
          </div>
        </section>

        {/* delivery & pickup */}
        <section className="card">
          <div className="section-header">
            <div className="stat-icon green">🚚</div>
            <h3 className="card-title">Delivery & Pickup</h3>
          </div>
          <div className="grid-2">
            <Field label="Offer Delivery" placeholder="$ 15" help="Standard delivery fee" />
            <Field label="Delivery Radius" placeholder="15" unit="km" help="Maximum delivery distance" />
          </div>
          <div className="info-tile" style={{ marginTop: '15px' }}>
            <label className="checkbox">
              <input type="checkbox" defaultChecked /> 
              <div>
                <strong>Offer Pickup</strong>
                <span className="checkbox-sub">Customers can collect orders from your location</span>
              </div>
            </label>
          </div>
        </section>

        {/* pricing */}
        <section className="card">
          <div className="section-header">
            <div className="stat-icon yellow">💰</div>
            <h3 className="card-title">Pricing Preferences</h3>
          </div>
          <div className="grid-2">
            <Field label="Minimum Order Value" placeholder="$ 50" help="Minimum price for any order" />
            <Field label="Consultation Fee" placeholder="$ 0" help="Charge for custom cake consultations" />
          </div>
        </section>

        {/* customization options - fully clickable */}
        <section className="card">
          <div className="section-header">
            <div className="stat-icon pink">🎂</div>
            <h3 className="card-title">Cake Customization Options</h3>
          </div>
          <p className="card-subtitle">Select the flavors, fillings, and shapes you currently offer.</p>
          
          <div className="customization-layout">
            <OptionSection 
              title="Available Cake Flavours" 
              items={["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry", "Carrot Cake", "Marble", "Coconut", "Almond", "Coffee/Mocha", "Banana", "Orange", "Pistachio", "Funfetti", "Cookies & Cream", "Peanut Butter"]} 
              selected={selectedOptions}
              onToggle={toggleOption}
            />
            
            <hr className="divider" />
            
            <OptionSection 
              title="Available Fillings" 
              items={["Buttercream", "Cream Cheese", "Chocolate Ganache", "Fruit Compote", "Custard", "Whipped Cream", "Lemon Curd", "Raspberry Jam", "Strawberry", "Bavarian Cream", "Mousse", "Caramel"]} 
              selected={selectedOptions}
              onToggle={toggleOption}
            />

            <hr className="divider" />

            <div className="grid-2">
               <OptionSection 
                 title="Available Shapes" 
                 items={["Round", "Square", "Rectangle", "Heart", "Oval", "Hexagon", "Number", "Custom"]} 
                 selected={selectedOptions}
                 onToggle={toggleOption}
               />
               <OptionSection 
                 title="Dietary Options" 
                 items={["Gluten-Free", "Vegan", "Sugar-Free", "Dairy-Free", "Nut-Free", "Organic", "Halal"]} 
                 selected={selectedOptions}
                 onToggle={toggleOption}
               />
            </div>
          </div>
        </section>

        {/* payment methods */}
        <section className="card">
          <h3 className="card-title">Accepted Payment Methods</h3>
          <div className="grid-3">
            <PaymentBox title="Cash" sub="Accept cash on delivery" icon="💵" />
            <PaymentBox title="Credit Card" sub="Process via platform" icon="💳" />
            <PaymentBox title="PayPal" sub="Accept PayPal" icon="🅿️" />
          </div>
        </section>
      </div>
    </div>
  );
}

// reusable field component
function Field({ label, placeholder, help, unit }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="input-with-prefix">
        <input type="text" className="input no-padding" placeholder={placeholder} style={{ flex: 1 }} />
        {unit && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{unit}</span>}
      </div>
      {help && <p className="helper-text" style={{ fontSize: '11px', marginTop: '4px' }}>{help}</p>}
    </div>
  );
}

// reusable option section component
function OptionSection({ title, items, selected, onToggle }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--navy)' }}>{title}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
        {items.map(item => {
          const isSelected = selected.includes(item);
          return (
            <div 
              key={item} 
              onClick={() => onToggle(item)}
              className="chip" 
              style={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--pink)' : '1px solid var(--border-subtle)', 
                background: isSelected ? 'var(--pink)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                padding: '10px',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                borderRadius: '8px'
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentBox({ title, sub, icon }) {
  return (
    <div className="info-tile" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '15px' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontWeight: '600', fontSize: '14px' }}>{title}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}