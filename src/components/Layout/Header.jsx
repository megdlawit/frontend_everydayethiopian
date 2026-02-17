import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../Assests/images/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 bg-transparent">
        <nav className="flex items-center justify-between max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 min-w-0">
            <img
              src={logo}
              alt="Everyday Ethiopian Logo"
              className="h-6 xs:h-7 sm:h-8 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8 flex-1 justify-center">
            <Link
              to="/about"
              className="text-white hover:text-[#FFB800] text-sm sm:text-base transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/plan"
              className="text-white hover:text-[#FFB800] text-sm sm:text-base transition-colors duration-200"
            >
              Plans
            </Link>
            <Link
              to="/faq"
              className="text-white hover:text-[#FFB800] text-sm sm:text-base transition-colors duration-200"
            >
              Faq
            </Link>
          </div>

          {/* Desktop Auth + CTA */}
          <div className="hidden sm:flex flex-col items-end min-w-0">
            <Link
              to="/shop"
              className="text-[#FFB800] hover:text-[#FFB800]/80 mb-0.5 text-xs sm:text-sm truncate max-w-[140px]"
            >
              Looking To shop? <span className="text-[#FFB800] font-bold">&gt;</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-white hover:text-[#FFB800] flex items-center text-sm truncate transition-colors duration-200"
              >
                Login <span className="ml-0.5 font-bold">&gt;</span>
              </Link>
              <Link
                to="/sign-up"
                className="bg-[#FFB800] text-white px-3 py-2 rounded-full hover:bg-[#FFB800]/90 text-sm transition-all duration-200 whitespace-nowrap"
              >
                Signup
              </Link>
            </div>
          </div>

          {/* Mobile Section: Looking To shop? + Hamburger */}
          <div className="flex items-center md:hidden space-x-3">
            <Link
              to="/shop"
              className="text-[#FFB800] hover:text-[#FFB800]/80 text-sm truncate"
            >
              Looking To shop? <span className="font-bold">&gt;</span>
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none focus:text-[#FFB800] p-1 flex-shrink-0"
              aria-label="Toggle navigation"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/90 backdrop-blur-sm py-4 z-40 overflow-hidden">
            <div className="px-4 flex flex-col space-y-3">
              <Link
                to="/about"
                className="text-white hover:text-[#FFB800] text-sm border-b border-gray-700 pb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/plan"
                className="text-white hover:text-[#FFB800] text-sm border-b border-gray-700 pb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plans
              </Link>
              <Link
                to="/faq"
                className="text-white hover:text-[#FFB800] text-sm border-b border-gray-700 pb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Faq
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
