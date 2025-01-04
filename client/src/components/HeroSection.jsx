// components/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1>Find the Best Places to Visit</h1>
          <p>Discover great local businesses around you</p>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="What are you looking for?"
              className="search-input"
            />
            <input 
              type="text" 
              placeholder="Location"
              className="location-input"
            />
            <button className="search-btn">Search</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;