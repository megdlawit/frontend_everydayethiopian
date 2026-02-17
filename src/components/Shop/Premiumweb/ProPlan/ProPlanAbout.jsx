import React from "react";
import aboutImgDefault from '../../../../Assests/images/peacockl.png';
import { FaTruck, FaGem, FaHandshake, FaLeaf, FaStore } from "react-icons/fa";
import { backend_url } from '../../../../server';

// Define feature icons with consistent string keys
const FEATURE_ICONS = [
  { name: "Truck", component: FaTruck, label: "Fast Delivery" },
  { name: "Gem", component: FaGem, label: "Premium Quality" },
  { name: "Handshake", component: FaHandshake, label: "Trusted Service" },
  { name: "Leaf", component: FaLeaf, label: "Eco Friendly" },
  { name: "Store", component: FaStore, label: "Local Store" },
];

const DEFAULT_FEATURES = [
  { title: "Custom Designs", icon: "Gem" },
  { title: "Eco-Friendly Materials", icon: "Leaf" },
  { title: "Handcrafted Quality", icon: "Handshake" },
  { title: "Worldwide Shipping", icon: "Truck" },
];

const ProPlanAbout = ({ shop }) => {
  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return aboutImgDefault;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  const aboutImg = getImageUrl(shop?.aboutImage?.url);

  const title = shop?.name || "K";
  const desc = shop?.description || "Sofa Chair Set For Relaxation & Home Decor Status";

  // Use features from shop if available, otherwise fallback
  const features = Array.isArray(shop?.features) && shop.features.length > 0
    ? shop.features
    : DEFAULT_FEATURES;

  return (
    <section
      className="w-full"
      id="about-section"
      style={{ background: '#f5f3ef' }}
    >
      {/* Desktop Layout (unchanged) */}
      <div className="hidden lg:flex lg:flex-row min-h-[400px]">
        {/* Left: Image */}
        <div className="w-1/2 h-auto">
          <img
            src={aboutImg}
            alt="About"
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '320px', maxHeight: '600px' }}
            onError={(e) => { e.target.src = aboutImgDefault; }}
          />
        </div>

        {/* Right: Text & Features */}
        <div
          className="w-1/2 flex flex-col justify-center items-center bg-[#1C3B3E] text-white"
          style={{ minHeight: '320px' }}
        >
          <div className="w-full flex flex-col items-center text-center gap-6 px-6">
            <h2
              className="text-5xl mb-2"
              style={{ fontFamily: "'Quesha', serif" }}
            >
              About {title}
            </h2>
            <p
              className="text-lg font-thin text-white/60 mb-4"
              style={{ fontFamily: "'AvenirLTStd', sans-serif", letterSpacing: '0.01em' }}
            >
              {desc}
            </p>

            {/* Feature Boxes */}
            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
              {features.map((feature, idx) => {
                // Support both string and object features for backward compatibility
                if (typeof feature === "string") {
                  return (
                    <div
                      key={idx}
                      className="border border-white/20 p-4 rounded-lg text-base bg-white/10 backdrop-blur-sm"
                      style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
                    >
                      {feature}
                    </div>
                  );
                }
                const IconComp = FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component || FaStore;
                return (
                  <div
                    key={idx}
                    className="border border-white/20 p-4 text-base bg-white/10 backdrop-blur-sm flex items-center justify-center"
                    style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
                  >
                    <IconComp size={22} className="text-[#FFF] mr-2" />
                    <span>{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Layout */}
      <div className="lg:hidden">
        {/* Image Section */}
        <div className="w-full h-[280px] sm:h-[350px]">
          <img
            src={aboutImg}
            alt="About"
            className="w-full h-full object-cover object-center"
            onError={(e) => { e.target.src = aboutImgDefault; }}
          />
        </div>

        {/* Content Section */}
        <div
          className="w-full flex flex-col justify-center items-center bg-[#1C3B3E] text-white p-6 sm:p-8"
          style={{ minHeight: 'auto' }}
        >
          <div className="w-full flex flex-col items-center text-center gap-4 sm:gap-6">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2"
              style={{ fontFamily: "'Quesha', serif" }}
            >
              About {title}
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg font-thin text-white/60 mb-3 sm:mb-4 max-w-2xl"
              style={{ fontFamily: "'AvenirLTStd', sans-serif", letterSpacing: '0.01em' }}
            >
              {desc}
            </p>

            {/* Feature Boxes - Responsive grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 w-full max-w-md">
              {features.map((feature, idx) => {
                // Support both string and object features for backward compatibility
                if (typeof feature === "string") {
                  return (
                    <div
                      key={idx}
                      className="border border-white/20 p-3 sm:p-4 rounded-lg text-sm sm:text-base bg-white/10 backdrop-blur-sm"
                      style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
                    >
                      {feature}
                    </div>
                  );
                }
                const IconComp = FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component || FaStore;
                return (
                  <div
                    key={idx}
                    className="border border-white/20 p-3 sm:p-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm flex items-center justify-center"
                    style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
                  >
                    <IconComp size={18} className="text-[#FFF] mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base">{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for custom breakpoints */}
      <style>{`
        /* Custom breakpoint for very small screens */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
};

export default ProPlanAbout;