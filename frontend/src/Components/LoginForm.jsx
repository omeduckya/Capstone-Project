import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { role } = useParams(); 
  const navigate = useNavigate(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });

      // save user infomation
      localStorage.setItem("user", JSON.stringify(res.data)); 
      
      setMessage(`Login successful! Welcome ${res.data.name}`);

      // login jump to page
      if (role === "baker" && res.data.role === "baker") {
        navigate("/baker/dashboard");
      } else if (role === "customer" && res.data.role === "customer") {
        navigate("/customer/dashboard");
      } else {
        setMessage("Role mismatch! Please login with the correct role.");
      }

    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login as {role}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit" style={{ marginTop: "10px" }}>Login</button>
      </form>
      {message && <p style={{ marginTop: "10px", color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default LoginForm;
