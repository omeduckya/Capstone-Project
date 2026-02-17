import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelect from "./Components/RoleSelect";
import AuthOptions from "./Components/AuthOptions";
import RegisterForm from "./Components/RegisterForm";
import LoginForm from "./Components/LoginForm";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/auth/:role" element={<AuthOptions />} />
        <Route path="/register/:role" element={<RegisterForm />} />
        <Route path="/login/:role" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
