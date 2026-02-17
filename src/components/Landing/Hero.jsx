import React from "react";
import "./HeroSection.css";
import heroBackground from "../../Assests/images/Rectangle8.png";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
            backgroundImage: ` url(../../Assests/images/Rectangle8.png)`,
          }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex items-center min-h-screen px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-quesha text-white mb-6 leading-tight">
            From <span className="text-[#FFB800]">Ethiopia</span> to the{" "}
            <span className="text-[#FFB800]">World</span>:
            <br />
            <span className="text-white">Sell Your Story</span>
          </h1>
          <p className="text-white text-xl max-w-2xl mb-8">
            Create your own shop in minutes and reach thousands of buyers through
            our marketplace—no tech skills needed.
          </p>
          <button className="bg-[#FFB800] text-black px-8 py-3 rounded-full hover:bg-[#FFB800]/90 font-medium">
            Try the free plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;