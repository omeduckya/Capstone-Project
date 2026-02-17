import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome to CakeCraft Studio</h2>
      <p>Please select your role:</p>
      <button onClick={() => navigate("/auth/baker")} style={{ margin: "10px" }}>
        Baker
      </button>
      <button onClick={() => navigate("/auth/customer")} style={{ margin: "10px" }}>
        Customer
      </button>
    </div>
  );
};

export default RoleSelect;
