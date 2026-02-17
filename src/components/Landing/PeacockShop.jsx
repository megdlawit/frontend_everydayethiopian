// PeacockShop.jsx
import React from 'react';
import './PeacockShop.css';
import peacock from '../../Assests/images/smallpeac.png'; // Adjust path as needed

const PeacockShop = () => {
  return (
    <div className="peacock-container">
      <div className="peacock-content">
        <div className="peacock-image-container">
          <div className="peacock-glow"></div>
          <img src={peacock} alt="Peacock" className="peacock-image" />
        </div>
        <div className="text-box">
          <h1 className="title">
            Hey, it’s <span className="highlight">Piko!</span>
          </h1>
          <p className="description">
            Don’t worry! you’re not alone. <br />
            I’ll walk you through everything step by step, <br />
            so you can open your shop, start selling.
          </p>
          <button className="shop-button">Show Me!</button>
        </div>
      </div>
    </div>
  );
};

export default PeacockShop;