import React, { useState, useEffect } from "react";
import backgroundVideo from "../../Assests/images/Rect.mp4";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const phrases = [
    {
      text: "From Ethiopia to the World:, Sell Your Story",
      highlight: ["Ethiopia", "World"],
    },
    {
      text: "Celebrate Ethiopia, Sell Globally",
      highlight: ["Ethiopia", "Globally"],
    },
    {
      text: "Our Craft Our Marketplace, Endless Reach",
      highlight: ["Marketplace", "Reach"],
    },
    {
      text: "Empower Your Designs, Inspire the World",
      highlight: ["Designs", "World"],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [phrases.length]);

  const renderText = (text, highlight) => {
    // Split text at commas and join with a span for smaller gap
    const parts = text.split(/,\s*/);
    let formattedText = parts.join('<span style="display: block; margin-top: 0.2rem;"></span>'); // Reduced from 0.5rem to 0.2rem

    // Highlight specified words
    highlight.forEach((word) => {
      formattedText = formattedText.replace(
        word,
        `<span class="text-[#FFB800]">${word}</span>`
      );
    });

    return formattedText;
  };

  return (
    <div className="relative min-h-screen pb-8 sm:pb-12 md:pb-20">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay with Linear Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))",
        }}
      />

      {/* Hero Content - Centered Vertically, Pushed Near Bottom with Margin */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-20 pb-2">
        <div className="max-w-7xl w-full mt-0 sm:mt-32 md:mt-48 lg:mt-64">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-quesha text-white mb-1 leading-tight tighter-line-height relative">
            {phrases.map((phrase, index) => (
              <span
                key={index}
                className={`block transition-opacity duration-500 ${
                  index === currentIndex ? "opacity-100" : "opacity-0 absolute"
                }`}
                style={{
                  top: 0,
                  left: 0,
                }}
                dangerouslySetInnerHTML={{
                  __html: renderText(phrase.text, phrase.highlight),
                }}
              />
            ))}
          </h1>
          <p className="text-white text-light text-sm sm:text-base md:text-lg max-w-2xl mb-4 sm:mb-8">
            Create your own shop in minutes and reach thousands of
            <br className="hidden sm:block" />
            buyers through our marketplace—no tech skills needed.
          </p>
          <button
            className="bg-[#FFB800] text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-[#FFB800]/90 font-medium text-sm sm:text-base"
            onClick={() => navigate("/sign-up")}
          >
            Try the free plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;