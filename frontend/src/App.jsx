import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// shared pages
import Welcome from "./pages/Welcome";
import SignIn from "./pages/SignIn"; 
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./pages/AppLayout";
import CustomerLayout from "./pages/CustomerLayout";

// baker pages
import Dashboard from "./pages/Dashboard";
import AllOrders from "./pages/AllOrders";
import OrderCalendar from "./pages/OrderCalendar";
import OrderDetails from "./pages/OrderDetails";
import MyCakes from "./pages/MyCakes";
import EditCake from "./pages/EditCake";
import AddCake from "./pages/AddCake";
import CompletedOrders from "./pages/CompletedOrders";
import BakerProfile from "./pages/BakerProfile";
import BakerSettings from "./pages/BakerSettings";
import BakerMyProfile from "./pages/BakerMyProfile";
import Settings from "./pages/Settings";
import BakerSignUp from "./pages/BakerSignUp";

// customer pages
import CustomerSignUp from "./pages/CustomerSignUp";
import CustomerHome from "./pages/CustomerHome";
// customer orders UI lives in MyOrders.jsx
import MyOrders from "./pages/MyOrders"; 
import Favorites from "./pages/Favorites";
import CustomerProfile from "./pages/CustomerProfile";
import PaymentMethods from "./pages/PaymentMethods";
import CustomerSettings from "./pages/CustomerSettings";
// imported above for baker route
import Checkout from "./pages/Checkout";
import CustomCakeBuilder from "./pages/CustomCakeBuilder"; 
import Analytics from "./pages/Analytics";
import ComingSoon from "./pages/ComingSoon";


export default function App() {
  return (
    <Router>
      <Routes>
        {/* public landing page */}
        <Route path="/" element={<Welcome />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* auth routes - baker */}
        <Route path="/baker/sign-in" element={<SignIn />} />
        <Route path="/baker/sign-up" element={<BakerSignUp />} />
        <Route path="/baker/forgot-password" element={<ForgotPassword />} />
        <Route path="/baker/reset-password" element={<ResetPassword />} />

        {/* auth routes - customer */}
        <Route path="/customer/sign-in" element={<SignIn />} />
        <Route path="/customer/sign-up" element={<CustomerSignUp />} />
        <Route path="/customer/forgot-password" element={<ForgotPassword />} />
        <Route path="/customer/reset-password" element={<ResetPassword />} />

        {/* customer private routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/home" element={<CustomerHome />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/customer/orders" element={<MyOrders />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/customer/settings" element={<CustomerSettings />} />
          <Route path="/baker/:id/checkout" element={<Checkout />} />
          <Route path="/baker/:id/builder" element={<CustomCakeBuilder />} />
          <Route path="/baker/:id" element={<BakerProfile />} /> 
          
        </Route>

        {/* baker private routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<AllOrders />} />
          <Route path="/orders/calendar" element={<OrderCalendar />} />
          <Route path="/orders/completed" element={<CompletedOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/cakes" element={<MyCakes />} />
          <Route path="/cakes/new" element={<AddCake />} />
          <Route path="/cakes/:id/edit" element={<EditCake />} />
          <Route path="/baker/profile" element={<BakerProfile />} />
          <Route path="/baker/my-profile" element={<BakerMyProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Router>
  );
}