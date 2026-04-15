import { Link } from "react-router-dom";
import "./styles.css";
import logoImg from "../assets/logo.png";
import arrowIcon from "../assets/arrow.png";
import personIcon from "../assets/person_icon.png";
import cakeIcon from "../assets/cake_icon.png";

export default function Welcome() {
  return (
    <div className="gradient-bg full-center">
      <div className="welcome-content-wrapper">
        
        <div className="welcome-logo-circle">
          <img src={logoImg} alt="logo" className="logo-img-main" />
        </div>

        <h1 className="welcome-heading">
          #1 platform connecting home bakers <br />
          with people who crave something special.
        </h1>

        <p className="welcome-subheading">
          Discover custom and ready-made cakes crafted by talented <br />
          home bakers — all in one place.
        </p>

        <div className="welcome-cards-row">
          {/* customer card */}
          <Link to="/customer/sign-up" className="welcome-card-item no-underline">
            <div className="icon-container pink-bg">
              <img src={personIcon} alt="Customer" className="inner-icon" />
            </div>
            <div className="card-info">
              <h3>Continue as Customer</h3>
              <p>Browse home bakers, order custom or ready-made cakes.</p>
            </div>
            <img src={arrowIcon} alt="Arrow" className="arrow-small" />
          </Link>

          {/* baker card */}
          <Link to="/baker/sign-in" className="welcome-card-item no-underline">
            <div className="icon-container blue-bg">
              <img src={cakeIcon} alt="" className="inner-icon" />
            </div>
            <div className="card-info">
              <h3>Continue as Baker</h3>
              <p>Showcase your creations and build your brand.</p>
            </div>
            <img src={arrowIcon} alt="" className="arrow-small" />
          </Link>
        </div>

        <p className="welcome-caption">
          Join thousands of happy customers and talented bakers
        </p>
      </div>
    </div>
  );
}
