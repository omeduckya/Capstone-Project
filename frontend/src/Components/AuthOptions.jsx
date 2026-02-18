import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const AuthOptions = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{role === "baker" ? "Baker Portal" : "Customer Portal"}</h2>
      <p>Do you want to register or login?</p>
      <button onClick={() => navigate(`/register/${role}`)} style={{ margin: "10px" }}>
        Register
      </button>
      <button onClick={() => navigate(`/login/${role}`)} style={{ margin: "10px" }}>
        Login
      </button>
    </div>
  );
};

export default AuthOptions;
