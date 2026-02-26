/* import React from "react";
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

export default App; */

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./pages/styles.css";
import Dashboard from "./pages/Dashboard";
import AllOrders from "./pages/AllOrders";
import OrderDetails from "./pages/OrderDetails";
import MyCakes from "./pages/MyCakes";
import EditCake from "./pages/EditCake";
import AddCake from "./pages/AddCake";
import Settings from "./pages/Settings";
import BakerSignIn from "./pages/BakerSignIn";
import BakerSignUp from "./pages/BakerSignUp";
import AppLayout from "./pages/AppLayout";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/baker/sign-in" element={<BakerSignIn />} />
        <Route path="/baker/sign-up" element={<BakerSignUp />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<AllOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/cakes" element={<MyCakes />} />
          <Route path="/cakes/new" element={<AddCake />} />
          <Route path="/cakes/:id/edit" element={<EditCake />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
