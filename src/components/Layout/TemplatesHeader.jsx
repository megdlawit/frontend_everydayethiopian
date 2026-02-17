import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { TiHeartFullOutline } from "react-icons/ti";
import { IoIosCart } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { loadSeller } from "../../redux/actions/sellers";
import logo from "../../Assests/images/logo.png";
import "./Header.css";

const TemplatesHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { isSeller } = useSelector((state) => state.seller || {});
  const { isDelivery } = useSelector((state) => state.delivery);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);

  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);

  const homeLink = isAuthenticated ? "/shop" : "/";

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadSeller());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <div className="w-full bg-[#1C3B3E] py-1">
        <div className={`${styles.section} py-1 flex items-center justify-between gap-4`}>
          {/* Logo */}
          <Link to={homeLink} className="flex-shrink-0">
            <img src={logo} alt="Logo" className="h-10" />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Wishlist */}
            <div className="relative cursor-pointer" onClick={() => setOpenWishlist(true)}>
              <TiHeartFullOutline size={24} color="white" />
              <span className="absolute -top-1 -right-2 bg-[#CC9A00] text-white text-xs rounded-full px-1">
                {wishlist?.length || 0}
              </span>
            </div>

            {/* Cart */}
            <div className="relative cursor-pointer" onClick={() => setOpenCart(true)}>
              <IoIosCart size={24} color="white" />
              <span className="absolute -top-1 -right-2 bg-[#CC9A00] text-white text-xs rounded-full px-1">
                {cart?.length || 0}
              </span>
            </div>

            {/* Auth/Seller Buttons */}
            {(isSeller || isDelivery) ? (
              isSeller ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-[#1E3B3C] px-3 py-1 rounded-full font-medium text-xs"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/delivery/dashboard"
                  className="bg-white text-[#1E3B3C] px-3 py-1 rounded-full font-medium text-xs"
                >
                  Dashboard
                </Link>
              )
            ) : isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center"
                title="Profile"
              >
                <FaUser
                  size={24}
                  style={{
                    backgroundColor: "white",
                    color: "#1E3B3C",
                    border: "2px solid #1E3B3C",
                    borderRadius: "50%",
                    padding: "2px",
                  }}
                />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-white text-sm font-medium">
                  Login &gt;
                </Link>
                <div className="flex flex-col items-center gap-1">
                  <Link to="/sign-up" className="text-[#FFC300] text-xs font-medium">
                    Looking To Sell? &gt;
                  </Link>
                  <Link
                    to="/sign-up"
                    className="bg-white text-[#1E3B3C] px-3 py-1 rounded-full font-medium text-xs"
                  >
                    Signup
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart & Wishlist Popups */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
    </>
  );
};

export default TemplatesHeader;