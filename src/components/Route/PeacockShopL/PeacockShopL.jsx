import React from 'react';
import './PeacockShopL.css';
import peacock from '../../../Assests/images/peacockl.png'; // Adjust path as needed

const PeacockShopL = () => {
  return (
    <div className="peacock-containerl">
     <div className="peacock-contentl">
  <div className="text-boxl">
    <h1 className="titlel">
      Start Shopping <span className="highlight"> Your  </span> <br />
      <span className="highlight">Dream</span> Finds Today!
    </h1>
    <h4 className="descriptionl">
      Explore a global marketplace of unique creations from talented sellers—dive in for free and discover your favorites now!
    </h4>
    <button className="shop-buttonl">Start Shopping Now</button>
  </div>
  <div className="peacock-image-containerl">
    <img src={peacock} alt="Peacock" className="peacock-imagel" />
  </div>
</div>

    </div>
  );
};

export default PeacockShopL;