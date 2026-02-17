import React from "react";
import img from "../../../../Assests/images/Rectangle34.png"; // Placeholder image
import { FaTruck, FaGem, FaHandshake, FaLeaf, FaStore } from "react-icons/fa";
import { backend_url } from "../../../../server";

// Define feature icons with consistent string keys
const FEATURE_ICONS = [
  { name: "Truck", component: FaTruck, label: "Fast Delivery" },
  { name: "Gem", component: FaGem, label: "Premium Quality" },
  { name: "Handshake", component: FaHandshake, label: "Trusted Service" },
  { name: "Leaf", component: FaLeaf, label: "Eco Friendly" },
  { name: "Store", component: FaStore, label: "Local Store" },
];

const DEFAULT_FEATURES = [
  { title: "Fast Delivery", icon: "Truck" },
  { title: "Premium Quality", icon: "Gem" },
  { title: "Trusted Service", icon: "Handshake" },
  { title: "Eco Friendly", icon: "Leaf" },
];

const GrowthPlanAbout = ({ shop }) => {
  const safeShop = shop || {
    name: "Our Shop",
    description: "Welcome to our premium shop! We offer premium products crafted with passion and care.",
    features: [],
  };

  // Use features from shop if available, otherwise fallback
  const features = Array.isArray(safeShop.features) && safeShop.features.length > 0
    ? safeShop.features
    : DEFAULT_FEATURES;

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return img;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  // Determine about image URL
  const aboutImg = getImageUrl(safeShop.aboutImage?.url);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:max-w-7xl xl:mx-auto py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm mt-6 sm:mt-8 md:mt-10">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 lg:gap-10">
        {/* Left: Shop Content */}
        <div className="lg:w-1/2 w-full">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#1c3b3c] text-center lg:text-left mb-6 sm:mb-8 font-quesha"
          >
            About {safeShop.name}
          </h2>
          <p className="text-center lg:text-left text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
            {safeShop.description}
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
            {features.map((feature, index) => {
              const IconComp = FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component || FaStore;
              return (
                <div 
                  key={index} 
                  className="bg-[#1c3b3c] rounded-md sm:rounded-lg p-3 sm:p-4 text-center shadow-sm flex items-center justify-center gap-2 sm:gap-3 min-h-[60px] sm:min-h-[70px]"
                >
                  <IconComp size={20} className="sm:size-6 md:size-7 lg:size-8 text-[#FAC50C] flex-shrink-0" />
                  <h4 
                    className="text-xs sm:text-sm md:text-base font-medium sm:font-semibold text-[#fff] truncate"
                    style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
                  >
                    {feature.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Image - Desktop */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="relative mx-auto">
            <img
              src={aboutImg}
              alt="About Image"
              className="w-full max-w-md rounded-lg object-cover"
              onError={(e) => {
                e.target.src = img;
              }}
            />
          </div>
        </div>

        {/* Right: Image - Mobile & Tablet */}
        <div className="lg:hidden w-full">
          <div className="relative mx-auto max-w-sm sm:max-w-md">
            <img
              src={aboutImg}
              alt="About Image"
              className="w-full rounded-lg object-cover"
              onError={(e) => {
                e.target.src = img;
              }}
            />
            {/* Optional decorative overlay for mobile */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 bg-[#FAC50C] rounded-lg opacity-20 -z-10"></div>
            <div className="absolute -top-2 -left-2 w-12 h-12 sm:w-16 sm:h-16 bg-[#1c3b3c] rounded-lg opacity-20 -z-10"></div>
          </div>
        </div>
      </div>

      {/* Additional Mobile CTA */}
      <div className="lg:hidden text-center mt-6 sm:mt-8">
        <p className="text-sm text-gray-500 mb-3">Visit our store for more!</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-5 py-2 bg-[#1c3b3c] text-white rounded-full text-sm font-medium hover:bg-[#2a5253] transition-colors"
        >
          Back to Top
        </button>
      </div>

      <style jsx>{`
        /* Responsive font scaling for Quesha */
        @media (max-width: 640px) {
          .font-quesha {
            font-size: 1.75rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .font-quesha {
            font-size: 2.25rem !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .font-quesha {
            font-size: 3rem !important;
          }
        }
        
        @media (min-width: 1025px) and (max-width: 1280px) {
          .font-quesha {
            font-size: 4rem !important;
          }
        }
        
        @media (min-width: 1281px) {
          .font-quesha {
            font-size: 5rem !important;
          }
        }
        
        /* Small breakpoint for 2-column grid on very small screens */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        /* Smooth transitions */
        * {
          transition: all 0.3s ease;
        }
        
        /* Ensure text doesn't overflow on mobile */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Better touch targets */
        @media (max-width: 1024px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </section>
  );
};

export default GrowthPlanAbout;