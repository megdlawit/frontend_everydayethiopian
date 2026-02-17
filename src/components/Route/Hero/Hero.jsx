import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import styles from "../../../styles/styles";
import image1 from "../../../Assests/images/bg.png";
import image2 from "../../../Assests/images/bg1.png";
import image3 from "../../../Assests/images/bg3.png";
import infoOverlay from "../../../Assests/images/i.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Hero.css";

const Hero = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  // State to toggle between i.png and i2.png
  const [showAltImage, setShowAltImage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowAltImage((prev) => !prev);
    }, 1500); // Switch every 1.5 seconds
    return () => clearInterval(interval);
  }, []);

  const descriptions = [
    "Discover traditional Ethiopian spices and flavors.",
    "Experience handwoven textiles and home goods.",
    "Support artisans through sustainable shopping.",
  ];

  const [hoveredSlide, setHoveredSlide] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="relative w-full mt-[-1.5rem] overflow-hidden h-screen">
      {/* Background Image Slider */}
      <Slider {...settings} afterChange={(index) => setCurrentSlide(index)}>
        {[image1, image2, image3].map((img, i) => (
          <div key={i}>
            <img
              src={img}
              alt={`Background ${i + 1}`}
              className="w-full h-screen object-cover"
            />
          </div>
        ))}
      </Slider>

      {/* Info Overlay */}
      <div
        className="absolute right-[18%] top-[34%] z-20 flex flex-col items-center group"
        onMouseEnter={() => setHoveredSlide(currentSlide)}
        onMouseLeave={() => setHoveredSlide(null)}
      >
        <img
          src={showAltImage ? require("../../../Assests/images/i2.png") : infoOverlay}
          alt="Info Overlay"
          className="w-[80px] h-[80px] object-contain cursor-pointer"
        />

        {showAltImage && (
          <div className="mt-2 flex flex-col items-center space-y-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-0 animate-fade-in delay-[50ms]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-0 animate-fade-in delay-[150ms]" />
            <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-0 animate-fade-in delay-[250ms]" />
          </div>
        )}

        {/* Description on hover */}
        {hoveredSlide !== null && (
          <div className="absolute top-[100%] mt-2 w-64 text-sm bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-30 tighter-line-height">
            {descriptions[hoveredSlide]}
          </div>
        )}
      </div>

      {/* Text and Button */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="ml-[10%] max-w-[600px]">
          <h1
            className="text-[42px] 800px:text-[80px] text-[#1E1E1E] font-light leading-tight tighter-line-height"
            style={{ fontFamily: "Quesha" }}
          >
            Authentic{" "}
            <span style={{ color: "#CC9A00" }}>Ethiopian</span>
            <br />
            products, crafted
            <br />
            for <span style={{ color: "#CC9A00" }}>Everyday</span> living.
          </h1>
           <p className="text-[#1E1E1E] text-light max-w-2xl  mt-4">
            Create your own shop in minutes and reach thousands of
            <br />
            buyers through our marketplace—no tech skills needed.
          </p>

          <Link to="/products">
            <div
              className="mt-8 bg-[#FFCC00] text-white text-[16px] px-8 py-2 rounded-full shadow-md hover:bg-[#e6b800] transition inline-block"
              style={{ fontFamily: "Avenir LT Std " }}
            >
              Start Shopping
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;