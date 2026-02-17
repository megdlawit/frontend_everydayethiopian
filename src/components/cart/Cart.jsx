import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart, removeFromCart } from "../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import { backend_url } from "../../server";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false, // disable react-toastify default icon
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-[9999] font-[Aviner Lt Std]">
      {/* Floating cart icon at top left */}
      {/* <div className="fixed top-4 left-4 z-[10000]">
        <FiShoppingCart size={35} className="text-[#FFC300]" />
      </div> */}

      {/* Cart Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[80%] md:w-[60%] lg:w-[30%] bg-white flex flex-col overflow-y-scroll justify-between shadow-sm">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end fixed top-3 right-3">
              <RxCross1
                size={18}
                className="cursor-pointer absolute top-2 right-2 text-[#FFC300] hover:opacity-75 transition"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <h5>Cart Items is empty!</h5>
          </div>
        ) : (
          <>
            <div>
              {/* Header */}
              <div className="flex justify-between items-center p-4">
                <div className="flex items-center">
                  <FiShoppingCart size={30} className="text-[#FFC300]" />
                  <h5 className="pl-2 text-[18px] font-[500]">
                    {cart && cart.length} items
                  </h5>
                </div>
                <RxCross1
                  size={18}
                  className="cursor-pointer text-[#FFC300] hover:opacity-75 transition"
                  onClick={() => setOpenCart(false)}
                />
              </div>

              {/* Cart Items */}
              <div className="mt-4 px-2">
                {cart.map((i, index) => (
                  <CartSingle
                    key={index}
                    data={i}
                    quantityChangeHandler={quantityChangeHandler}
                    removeFromCartHandler={removeFromCartHandler}
                    showToast={showToast}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="px-3 mb-14">
              <div className="flex flex-row justify-between items-center gap-2">
                <Link to="/cart-details">
                  <div className="flex-1 sm:w-[95px] text-[#FFC300] border border-[#FFC300] rounded-full py-2 px-4 sm:px-0 text-center hover:bg-[#fff4cc] transition text-sm">
                    Cart Detail
                  </div>
                </Link>
                <Link to="/checkout">
                  <div className="flex-1 sm:w-[95px] text-white bg-[#FFC300] rounded-full py-2 px-4 sm:px-0 text-center hover:bg-[#e6b800] transition text-sm">
                    Checkout
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          top: "80px", // give some space from top like in your image
        }}
      />
    </div>
  );
};

const CartSingle = ({
  data,
  quantityChangeHandler,
  removeFromCartHandler,
  showToast,
  index,
}) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
    if (data.stock < value) {
      showToast("error", "Stock Limit", "Product stock limited!");
    } else {
      setValue(value + 1);
      quantityChangeHandler({ ...data, qty: value + 1 });
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    quantityChangeHandler({ ...data, qty: value === 1 ? 1 : value - 1 });
  };

  // Helper function to normalize URLs
  const normalizeUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  const videoSrc = normalizeUrl(data?.video);
  const hasVideo = !!videoSrc;
  const posterSrc = data?.images && data.images.length > 0 ? normalizeUrl(data.images[0].url) : null;

  return (
    <div
      className={`relative border border-gray border-[1px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center shadow-lg rounded-md mx-2 ${
        index !== 0 ? "mt-4" : ""
      }`}
    >
      {/* Close Icon */}
      <RxCross1
        className="absolute top-2 right-2 cursor-pointer text-[#D10101] hover:opacity-80 transition"
        size={18}
        onClick={() => removeFromCartHandler(data)}
      />

      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center">
        {hasVideo ? (
          <video
            src={videoSrc}
            poster={posterSrc}
            className="w-full sm:w-[120px] h-32 sm:h-[100px] object-cover rounded-[5px] mb-3 sm:mb-0 sm:mr-4"
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={(e) => {
              e.target.play().catch((error) => {
                console.error("Video play failed:", error);
              });
            }}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0; // Reset to start for next hover
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={posterSrc || "/placeholder-image.jpg"}
            alt="Product"
            className="w-full sm:w-[120px] h-32 sm:h-[100px] object-cover rounded-[5px] mb-3 sm:mb-0 sm:mr-4"
          />
        )}

        <div className="flex-1 w-full sm:w-auto flex flex-col space-y-2">
          <h1 className="text-[16px] font-[400] truncate">{data.name}</h1>
          <h4 className="font-[400] text-[13px] text-[#00000082]">
            {data.discountPrice} Birr X {value}
          </h4>
          <h4 className="font-[400] text-[15px] text-[#1e1e1e] mb-2">
            {totalPrice} Birr
          </h4>

          {/* Counter */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <button
              className="w-6 h-6 border border-[#FFC300] text-[#FFC300] rounded-full flex items-center justify-center hover:bg-[#fff4cc] transition"
              onClick={() => decrement(data)}
            >
              <HiOutlineMinus size={12} />
            </button>
            <span className="text-[14px] font-[500] min-w-[20px] text-center">{value}</span>
            <button
              className="w-6 h-6 border border-[#FFC300] text-[#FFC300] rounded-full flex items-center justify-center hover:bg-[#fff4cc] transition"
              onClick={() => increment(data)}
            >
              <HiPlus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;