import React, { useState } from "react";
import CountDown from "./CountDown";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa"; // ✅ Add this icon
import { backend_url } from "../../server";

const EventCard = ({ data, onNext }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState(
    data.images && data.images[0]?.url
  );

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false,
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  const addToCartHandler = (data) => {
    const isItemExists = cart && cart.find((i) => i._id === data._id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else {
      if (data.stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Updated", "Item added to cart successfully!");
      }
    }
  };

  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  return (
    <div
      onClick={() => navigate(`/event/${data._id}`)}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="w-full my-12 relative">
        <div
          className="
            w-full bg-gradient-to-b from-[#4A9CA4] to-[#1C3B3E]
            rounded-xl shadow-xl overflow-visible
            flex flex-col md:flex-row items-center md:items-start
            px-4 sm:px-8 md:px-16 py-8 md:py-10 relative
            min-h-[400px]
          "
        >
          {/* Left: Text */}
          <div className="w-full md:w-1/2 text-white flex flex-col gap-4 sm:gap-6 md:ml-10 text-center md:text-left">
            <h1
              className="text-[42px] sm:text-[56px] md:text-[72px] leading-none"
              style={{ fontFamily: "Quesha", color: "#FFE180" }}
            >
              Popular Offers
            </h1>
            <h2
              className="text-[24px] sm:text-[32px] md:text-[40px]"
              style={{
                fontFamily: "Avenir LT Std, sans-serif",
                fontWeight: 400,
              }}
            >
              {data.name}
            </h2>
            <div className="flex justify-center md:justify-start items-center gap-3 mt-2">
              <span className="line-through text-gray-300 text-base sm:text-lg">
                {data.originalPrice || "N/A"} Br.
              </span>
              <span className="text-yellow-400 text-lg sm:text-xl font-bold">
                {data.discountPrice || "N/A"} Br.
              </span>
            </div>

            {/* ✅ Countdown (visible only on mobile/tablet) */}
            <div className="block md:hidden mt-4">
              <CountDown data={data} hideOnExpire={true} />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                addToCartHandler(data);
              }}
              className="
                w-fit px-4 py-1.5 mt-4 border border-yellow-400 text-yellow-400
                rounded-full hover:bg-yellow-400 hover:text-[#004d4d]
                transition mx-auto md:mx-0
              "
            >
              Get Deal
            </button>
          </div>

          {/* Right: Image */}
          <div className="w-full md:w-1/2 flex flex-col items-center mt-8 md:mt-[-88px] relative -z10">
            <div className="rounded-lg overflow-hidden border-[3px] border-yellow-300 shadow-xl">
              <img
                src={getImageUrl(mainImage)}
                alt={data.name}
                className="w-[90vw] sm:w-[420px] h-[240px] sm:h-[300px] object-cover rounded-md"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {data.images &&
                data.images.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img.url)}
                    alt="thumb"
                    onClick={() => handleThumbnailClick(img.url)}
                    className="w-24 h-20 object-cover rounded cursor-pointer border border-gray-400 hover:scale-105 transition"
                  />
                ))}
            </div>
          </div>

          {/* Desktop Countdown */}
          <div
            className="
              hidden md:flex
              absolute left-1/2 transform -translate-x-1/2
              z-20 mt-[16rem] px-6 pt-4 pb-4
            "
          >
            <CountDown data={data} hideOnExpire={true} />
          </div>

{/* ✅ Mobile Next Arrow */}
<button
  onClick={(e) => {
    e.stopPropagation();
    if (onNext) onNext();
  }}
  className="
    absolute bottom-4 right-4
    bg-[#FFC300] text-white
    w-12 h-12 rounded-full
    shadow-lg hover:scale-110 active:scale-95
    transition-all duration-300 ease-in-out
    flex items-center justify-center md:hidden
    text-2xl z-1
  "
>
  &gt;
</button>


        </div>

        {/* Fonts */}
        <style jsx>{`
          @font-face {
            font-family: "Quesha";
          }
          @font-face {
            font-family: "Avenir LT Std";
            src: url("/fonts/AvenirLTStd.otf") format("opentype");
          }
        `}</style>
      </div>

      {/* Toastify */}
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
          top: "80px",
        }}
      />
    </div>
  );
};

export default EventCard;