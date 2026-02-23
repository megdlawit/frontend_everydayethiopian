import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { BiSearch } from "react-icons/bi";
import { TiHeartFullOutline } from "react-icons/ti";
import { IoIosCart } from "react-icons/io";
import { FaUser, FaBars, FaTimes, FaHome } from "react-icons/fa";
import Navbar from "./Navbar";
import { getAllCategories } from "../../redux/actions/category";
import { loadSeller } from "../../redux/actions/sellers";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import logo from "../../Assests/images/logo.png";
import "./Header.css";
import { server, backend_url } from "../../server"; 

const Header2 = ({ activeHeading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { isSeller } = useSelector((state) => state.seller || {});
  const { isDelivery } = useSelector((state) => state.delivery);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const homeLink = isAuthenticated ? "/shop" : "/";

  useEffect(() => {
    dispatch(getAllCategories());
    if (isAuthenticated) dispatch(loadSeller());
  }, [dispatch, isAuthenticated]);

  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      try {
        const { data } = await axios.get(
          `${server}/product/search-products?query=${term}`
        );
        setSuggestions(data.products);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setSearchTerm("");
      setSuggestions([]);
      setShowSearch(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product._id}`);
    setSearchTerm("");
    setSuggestions([]);
    setShowSearch(false);
  };

  const truncateName = (name, wordLimit = 3) => {
    const words = name.split(" ");
    if (words.length <= wordLimit) return name;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const getProductImageUrl = (imageUrl) => {
    if (imageUrl) {
      return `${backend_url}/uploads/${imageUrl}`;
    }
    return "";
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      if (isSeller || isDelivery) {
        navigate(isSeller ? "/dashboard" : "/delivery/dashboard");
      } else {
        navigate("/profile");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* -------------------- TOP HEADER -------------------- */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1C3B3E] border-b border-[#223C3F]">
        <div className="px-3 sm:px-6 py-2 sm:py-3 max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to={homeLink} className="flex-shrink-0">
            <img
              src={logo}
              alt="Logo"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="flex items-center border border-white rounded-full px-3 py-1 bg-transparent">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-transparent text-white placeholder-white outline-none text-sm sm:text-base"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="text-white">
                  <BiSearch className="text-xl sm:text-2xl" />
                </button>
              </div>
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[#1C3B3E] border border-white rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center p-2 cursor-pointer hover:bg-[#223C3F] border-b border-[#223C3F] last:border-b-0"
                    >
                      <img
                        src={getProductImageUrl(
                          product.images && product.images[0]?.url
                        )}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                      />
                      <p className="text-white text-sm font-medium truncate">
                        {truncateName(product.name)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop Only: Wishlist & Cart */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className="relative cursor-pointer"
                onClick={() => setOpenWishlist(true)}
              >
                <TiHeartFullOutline size={22} color="#FFC300" />
                <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] rounded-full px-1">
                  {wishlist?.length || 0}
                </span>
              </div>

              <div
                className="relative cursor-pointer"
                onClick={() => setOpenCart(true)}
              >
                <IoIosCart size={22} color="#FFC300" />
                <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] rounded-full px-1">
                  {cart?.length || 0}
                </span>
              </div>
            </div>

            {/* Auth / Dashboard Buttons */}
            {(isSeller || isDelivery) ? (
              <Link
                to={isSeller ? "/dashboard" : "/delivery/dashboard"}
                className="bg-[#FFC300] text-white px-3 py-1.5 rounded-full text-sm hidden md:inline-block"
              >
                Dashboard
              </Link>
            ) : isAuthenticated ? (
              <Link to="/profile" title="Profile" className="hidden md:inline-block">
                <FaUser
                  size={22}
                  style={{
                    backgroundColor: "black",
                    color: "#FFC107",
                    border: "2px solid #FFC107",
                    borderRadius: "50%",
                    padding: "3px",
                  }}
                />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-block text-white text-sm font-medium border border-white px-3 py-1.5 rounded-full"
              >
                Login
              </Link>
            )}

            {/* Mobile: Auth Button */}
            <div className="md:hidden mr-2">
              {isAuthenticated ? (
                (isSeller || isDelivery) ? (
                  <Link
                    to={isSeller ? "/dashboard" : "/delivery/dashboard"}
                    className="text-white text-sm font-medium border border-white px-2 py-1 rounded-full"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" title="Profile">
                    <FaUser
                      size={18}
                      style={{
                        backgroundColor: "black",
                        color: "#FFC107",
                        border: "2px solid #FFC107",
                        borderRadius: "50%",
                        padding: "2px",
                      }}
                    />
                  </Link>
                )
              ) : (
                <Link
                  to="/login"
                  className="text-white text-sm font-medium border border-white px-2 py-1 rounded-full"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger Menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              {menuOpen ? (
                <FaTimes size={22} color="#FFC300" />
              ) : (
                <FaBars size={22} color="#FFC300" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:block border-t border-[#223C3F] bg-[#1C3B3E]">
          <div className="py-1">
            <Navbar active={activeHeading} />
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[60px] md:h-[80px]"></div>

      {/* Bottom Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1C3B3E] border-t border-[#223C3F] z-50 py-2 px-4 flex justify-evenly items-center text-white">
        <Link to={homeLink}><FaHome size={22} /></Link>
        <button onClick={() => setShowSearch(!showSearch)}><BiSearch size={22} /></button>
        <button onClick={() => setOpenWishlist(true)} className="relative">
          <TiHeartFullOutline size={22} color="#FFC300" />
          <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] rounded-full px-1">
            {wishlist?.length || 0}
          </span>
        </button>
        <button onClick={() => setOpenCart(true)} className="relative">
          <IoIosCart size={22} color="#FFC300" />
          <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] rounded-full px-1">
            {cart?.length || 0}
          </span>
        </button>
        <button 
          className="relative"
          onClick={handleProfileClick}
        >
          <FaUser size={22} color={isAuthenticated ? "#FFC300" : "white"} />
        </button>
      </div>

      {/* Mobile Dropdown (only Navbar, no auth links) */}
      {menuOpen && (
        <div className="md:hidden fixed top-[40px] left-0 right-0 bg-[#1C3B3E] border-t border-[#223C3F] animate-slideDown z-40 shadow-lg">
          <div className="flex flex-col items-start px-4 py-3">
            <Navbar active={activeHeading} />
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="md:hidden fixed top-[40px] left-0 right-0 bg-[#1C3B3E] z-40 flex flex-col animate-fadeIn shadow-md border-t border-[#223C3F]">
          <div className="px-4 py-4 flex items-center gap-2">
            <button onClick={() => setShowSearch(false)} className="text-white">
              <FaTimes size={20} />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-transparent border border-white rounded-full px-4 py-2 text-white outline-none"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          {suggestions.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4">
              {suggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="flex items-center p-2 cursor-pointer hover:bg-[#223C3F] border-b border-[#223C3F] last:border-b-0"
                >
                  <img
                    src={getProductImageUrl(
                      product.images && product.images[0]?.url
                    )}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                  <p className="text-white text-sm font-medium truncate">
                    {truncateName(product.name)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart & Wishlist Popups */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </>
  );
};

export default Header2;
