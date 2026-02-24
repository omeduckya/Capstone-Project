import React, { useState } from "react";
import MyCakes from "./MyCakes";
import Orders from "./Orders";
import Settings from "./Settings";
import { useNavigate } from "react-router-dom";

const BakerDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* sidebar */}
      <div style={{ width: "220px", background: "#f8f8f8", padding: "20px" }}>
        <h3>Baker Panel</h3>

        <button onClick={() => setActive("dashboard")}
          style={{ fontWeight: active === "dashboard" ? "bold" : "normal" }}>
          Dashboard
        </button>

        <button onClick={() => setActive("cakes")}>My Cakes</button>
        <button onClick={() => setActive("orders")}>Orders</button>
        <button onClick={() => setActive("settings")}>Settings</button>
        <button onClick={handleLogout}>Sign Out</button>
      </div>

      {/* content */}
      <div style={{ flex: 1, padding: "30px" }}>
        {active === "dashboard" && <h2>Welcome to your dashboard 🎂</h2>}
        {active === "cakes" && <MyCakes />}
        {active === "orders" && <Orders />}
        {active === "settings" && <Settings />}
      </div>

    </div>
  );
};

export default BakerDashboard;
