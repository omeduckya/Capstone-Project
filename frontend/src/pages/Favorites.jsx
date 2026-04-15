import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Favorites() {
  const favBakers = [
    { 
      id: 1, 
      name: "Cakes By Nelia", 
      rating: 4.9, 
      dist: "0.8 km", 
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800" 
    }
    // you can add more here to see the grid in action
  ];

  const navigate = useNavigate();

  return (
    <div className="page-container">
      <header className="white-header-box">
        <div className="header-text">
          <h1 className="page-title">Favorites</h1>
          <p className="page-subtitle">Your top-rated bakers in one place</p>
        </div>
      </header>

      <div className="content-scroll-area">
        <div className="grid-intro">
          <h2>Your Loved Bakers</h2>
          <p>{favBakers.length} bakers saved to your list</p>
        </div>

        {/* this uses the same grid class as the home page */}
        <div className="baker-grid">
          {favBakers.map((b) => (
            <div
              key={b.id}
              className="premium-baker-card baker-card-figma"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/baker/${b.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/baker/${b.id}`);
              }}
            >
              <div className="card-img-wrapper">
                <img src={b.img} alt={b.name} className="baker-photo" />
                <div className="card-badges">
                  <span className="tag-dist">📍 {b.dist}</span>
                  <span className="tag-rate">⭐ {b.rating}</span>
                </div>
                <div className="heart-icon-active">❤️</div>
              </div>
              <div className="card-info">
                <h3>{b.name}</h3>
                <button
                  type="button"
                  className="profile-btn-pink"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/customer/orders");
                  }}
                >
                  Order Again
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {favBakers.length === 0 && (
          <div className="empty-state">
            <p>no favorites yet! time to browse some cakes! 🍰</p>
          </div>
        )}
      </div>
    </div>
  );
}
