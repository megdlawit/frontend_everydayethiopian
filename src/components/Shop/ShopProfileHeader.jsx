import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { backend_url } from "../../server";

const ShopProfileHeader = ({
  data,
  joinedYear,
  activeSection,
  setActiveSection,
  id,
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/Uploads/placeholder-image.jpg";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false); // Close mobile menu when resizing to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync activeSection with current route or hash
  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash.replace("#", "");
    
    if (path.includes(`/shop/profile/${id}/all-products`)) {
      setActiveSection("all products");
    } else if (path.includes(`/shop/preview/${id}`)) {
      setActiveSection(hash || "home");
    }
  }, [location, id, setActiveSection]);

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu after clicking a link
    
    // Smooth scroll to section if on the same page
    if (location.pathname.includes(`/shop/preview/${id}`)) {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Format joined date to include month and year
  const joinedDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const navItems = ["Home", "Events", "About", "Contact"];

  return (
    <nav className="bg-[#1c3b3c]/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg py-3 md:py-6 lg:py-8 animate-fadeInDown">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex flex-col items-center">
        {/* Top Section - Logo and Shop Name */}
        <div className="flex flex-col items-center mb-3 md:mb-4 w-full">
          <Link to={`/shop/preview/${id}`} className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <img
                src={getImageUrl(data?.avatar?.url)}
                alt="Shop Logo"
                className={`${isMobile ? 'w-12 h-12 md:w-16 md:h-16' : 'w-16 md:w-20 lg:w-[80px] h-16 md:h-20 lg:h-[80px]'} rounded-full object-cover border-2 border-[#fff]`}
                onError={(e) => (e.target.src = "/Uploads/placeholder-image.jpg")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c3b3c]/30 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <h1
              className={`${isMobile ? 'text-xl md:text-2xl lg:text-3xl' : 'text-2xl md:text-4xl lg:text-5xl'} text-[#fff] tracking-wide`}
              style={{ fontFamily: "'Quesha', serif" }}
            >
              {data?.name || "Shop"}
            </h1>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="absolute right-4 top-4 text-white bg-[#1c3b3c]/50 rounded-full p-2 hover:bg-[#1c3b3c]/80 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        )}

        {/* Navigation and Joined Date */}
        <div className={`relative flex flex-col md:flex-row items-center justify-center w-full ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          {/* Navigation Items */}
          <ul className={`flex ${isMobile ? 'flex-col gap-3 w-full mb-4' : 'flex-row gap-4 md:gap-6 lg:gap-8 items-center'}`}>
            {navItems.map((item) => (
              <li
                key={item}
                className={`cursor-pointer text-white hover:text-[#cc9a00] transition-all duration-300 font-medium ${isMobile ? 'text-base w-full text-center py-2' : 'text-base md:text-lg'} transform hover:scale-110 hover:shadow-md px-3 py-1 rounded-full ${
                  activeSection === item.toLowerCase() 
                    ? "text-[#cc9a00] bg-[#1c3b3c]/20 border-2 border-[#cc9a00]" 
                    : ""
                }`}
              >
                <Link
                  to={`/shop/preview/${id}#${item.toLowerCase()}`}
                  onClick={() => handleNavClick(item.toLowerCase())}
                  className="block w-full"
                >
                  {item}
                </Link>
              </li>
            ))}
            <li
              className={`cursor-pointer font-medium ${isMobile ? 'text-base w-full text-center py-2' : 'text-base md:text-lg'} transform hover:scale-110 hover:shadow-md px-3 py-1 rounded-full text-[#fff] transition-all duration-300 ${
                activeSection === "all products" 
                  ? "text-[#cc9a00] border-2 border-[#cc9a00]" 
                  : ""
              }`}
            >
              <Link
                to={`/shop/profile/${id}/all-products`}
                className={`text-[#fff] hover:text-[#cc9a00] transition block w-full ${
                  activeSection === "all products" ? "text-[#cc9a00]" : ""
                }`}
                onClick={() => handleNavClick("all products")}
              >
                Shop
              </Link>
            </li>
          </ul>

          {/* Joined Date - Responsive Positioning */}
          <span className={`bg-[#fff] text-[#cc9a00] ${isMobile ? 'text-xs' : 'text-sm'} font-medium px-2 md:px-3 py-1 rounded-[20px] ${isMobile ? 'mt-2' : 'mt-0 md:absolute md:right-0'} border border-[#cc9a00]`}>
            Joined {joinedDate}
          </span>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 top-0 left-0 right-0 bottom-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default ShopProfileHeader;