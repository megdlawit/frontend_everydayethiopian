import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import peac from '../../../../Assests/images/peac.png';

const HeroHeader = ({ shop, onNav, isEditing, onLogoChange, activeSection, isAllProductsPage = false }) => {
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  console.log('HeroHeader props:', { onNav, isEditing, activeSection, shopId: shop?._id, isAllProductsPage });

  const handleNav = (section) => {
    console.log('HandleNav called with section:', section);
    if (typeof onNav === 'function') {
      onNav(section);
      setShowMobileMenu(false); // Close mobile menu after navigation
    } else {
      console.error('onNav is not a function');
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Mobile menu items
  const menuItems = ['home', 'video', 'events', 'shop', 'about', 'contact'];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:flex absolute top-6 left-0 right-0 z-50 px-4 md:px-8 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          {isEditing ? (
            <div
              className="relative group"
              onMouseEnter={() => setShowLogoTooltip(true)}
              onMouseLeave={() => setShowLogoTooltip(false)}
            >
              <img
                src={shop?.logo || "/Uploads/placeholder-image.jpg"}
                alt="Shop Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                style={{ minWidth: 48, minHeight: 48 }}
                onError={(e) => {
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
              <label
                htmlFor="heroHeaderShopImage"
                className="absolute bottom-0 right-0 text-white p-1 md:p-2 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 z-20"
                style={{ background: `linear-gradient(to right, #FAC50C, #FAC50Ccc)` }}
                aria-label="Change Shop Image"
              >
                <FaCamera size={12} className="md:size-14" />
                <input
                  type="file"
                  id="heroHeaderShopImage"
                  className="hidden"
                  accept="image/*"
                  onChange={onLogoChange}
                />
              </label>
              {showLogoTooltip && (
                <div className="hidden md:block absolute top-0 left-full ml-4 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-right z-30">
                  <img
                    src={peac}
                    alt="Peacock"
                    className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                    aria-hidden="true"
                  />
                  <p className="font-medium">Change logo here!</p>
                </div>
              )}
            </div>
          ) : (
            shop?.logo && (
              <img
                src={shop.logo || "/Uploads/placeholder-image.jpg"}
                alt="Shop Logo"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-[#FAC50C] bg-white shadow"
                style={{ minWidth: 48, minHeight: 48 }}
                onError={(e) => {
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
            )
          )}
          {shop?.name && (
            <span
              className="text-lg md:text-2xl lg:text-4xl"
              style={{
                fontFamily: "'Quesha', sans-serif",
                color: isAllProductsPage ? '#1c3b3c' : 'white',
              }}
            >
              {shop.name}
            </span>
          )}
        </div>

        <div className="bg-[#1c3b3c] rounded-full px-4 py-2 md:px-6 md:py-3">
          <nav className="flex gap-x-2 md:gap-x-5 items-center text-white/90 text-xs md:text-sm font-medium">
            {menuItems.map((section) => (
              <button
                key={section}
                style={section === activeSection ? { backgroundColor: 'white', color: 'black', fontWeight: 'bold' } : { backgroundColor: 'transparent' }}
                className={`rounded-full px-2 py-1 md:px-4 md:py-1 transition-all duration-200 ${
                  section === activeSection
                    ? 'bg-white !text-black font-bold'
                    : 'text-white/90 hover:text-white bg-transparent'
                }`}
                onClick={() => handleNav(section)}
                disabled={!shop?._id}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="bg-white text-[#cc9a00] text-xs md:text-sm font-medium rounded-[20px] border border-[#cc9a00] px-3 py-1 md:px-4 md:py-1 ml-0 whitespace-nowrap">
            Joined{' '}
            {shop?.createdAt
              ? new Date(shop.createdAt).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1c3b3c] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          {/* Logo and Shop Name */}
          <div className="flex items-center gap-3">
            {shop?.logo && (
              <img
                src={shop.logo || "/Uploads/placeholder-image.jpg"}
                alt="Shop Logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FAC50C] bg-white shadow"
                onError={(e) => {
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
            )}
            {shop?.name && (
              <span
                className="text-base md:text-lg font-medium"
                style={{
                  fontFamily: "'Quesha', sans-serif",
                  color: 'white',
                }}
              >
                {shop.name}
              </span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <button className="bg-white text-[#cc9a00] text-xs font-medium rounded-[20px] border border-[#cc9a00] px-2 py-1 whitespace-nowrap">
              Joined{' '}
              {shop?.createdAt
                ? new Date(shop.createdAt).toLocaleString('default', {
                    month: 'short',
                    year: 'numeric',
                  })
                : ''}
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col gap-1 p-2"
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-[#1c3b3c] shadow-lg rounded-b-lg mt-1 animate-slide-down">
            <nav className="flex flex-col p-4">
              {menuItems.map((section) => (
                <button
                  key={section}
                  className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    section === activeSection
                      ? 'bg-white text-[#1c3b3c] font-bold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => handleNav(section)}
                  disabled={!shop?._id}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Add some spacing for mobile header */}
      <div className="lg:hidden h-16"></div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        @media (max-width: 640px) {
          /* Ensure buttons are tappable on mobile */
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </>
  );
};

export default HeroHeader;