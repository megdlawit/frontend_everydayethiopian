import React, { useState, useEffect } from "react";
import "./TopSellersSection.css";
import seller1 from "../../Assests/images/Ellipse 6 (1).png";
import seller2 from "../../Assests/images/Ellipse 6 (2).png";
import seller3 from "../../Assests/images/Ellipse 6 (3).png";
import seller4 from "../../Assests/images/Ellipse 6 (4).png";
import seller5 from "../../Assests/images/Ellipse 6.png";
import featherIcon from "../../Assests/images/feather-pattern.svg";

const TopSellersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [numFeathers, setNumFeathers] = useState(20);
  const [screenSize, setScreenSize] = useState('large'); // Track size for dynamic translate
  const sellers = [
    { src: seller1 },
    { src: seller2 },
    { src: seller3 },
    { src: seller4 },
    { src: seller5 },
  ];

  const infiniteArray = [...sellers, ...sellers, ...sellers];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sellers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sellers.length]);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setNumFeathers(6); // Even fewer for tiny mobile
        setScreenSize('small');
      } else if (width < 1024) {
        setNumFeathers(10);
        setScreenSize('medium');
      } else {
        setNumFeathers(20);
        setScreenSize('large');
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // Dynamic translate percentage based on screen size for better spacing
  const getTranslatePercent = () => {
    switch (screenSize) {
      case 'small': return 140; // Tighter on mobile
      case 'medium': return 160;
      default: return 180;
    }
  };

  return (
    <section className="section-wrapper">
      <div className="gradient-box main-container">
        {/* Feather Pattern */}
        <div className="feather-pattern">
          {Array(numFeathers).fill().map((_, i) => (
            <img 
              key={i} 
              src={featherIcon} 
              alt="feather" 
              className="feather-icon"
            />
          ))}
        </div>

        {/* Sellers Display */}
        <div className="sellers-display">
          <div className="sellers-row">
            {infiniteArray.map((seller, index) => {
              const normalizedIndex = index % sellers.length;
              const isActive = normalizedIndex === currentIndex;
              const position = index - (currentIndex + sellers.length);
              const translatePercent = getTranslatePercent();
              
              return (
                <div 
                  key={index}
                  className={`seller-circle ${isActive ? 'active' : ''}`}
                  style={{
                    transform: `translateX(${position * translatePercent}%)`,
                    opacity: Math.abs(position) <= 2 ? 1 : 0,
                    visibility: Math.abs(position) <= 2 ? 'visible' : 'hidden'
                  }}
                >
                  <img 
                    src={seller.src} 
                    alt={`Seller ${normalizedIndex + 1}`} 
                    className="seller-image"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <h2 className="seller-title">Meet Our Top Sellers</h2>
      </div>
    </section>
  );
};

export default TopSellersSection;