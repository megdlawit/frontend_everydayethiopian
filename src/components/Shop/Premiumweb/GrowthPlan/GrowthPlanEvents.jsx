import React, { useState } from "react";
import CountDown from "../../../Events/CountDown";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../../Toast";
import { backend_url } from "../../../../server";

const GrowthPlanEvents = ({ data }) => {
  const eventData = Array.isArray(data) ? data[0] : data;
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [mainImage, setMainImage] = useState(eventData.images && eventData.images[0]?.url);

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
      showToast("error", "Item Already Exists", "Item already in cart!");
    } else {
      if (data.stock < 1) {
        showToast("error", "Stock Limited", "Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        showToast("success", "Added to Cart", "Item added to cart successfully!");
      }
    }
  };

  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  if (!eventData || !Array.isArray(eventData.images)) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFC300] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <div className="w-full rounded-xl flex flex-col lg:flex-row items-stretch justify-between px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 gap-6 sm:gap-8 min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
        {/* Left: Text and Countdown Card */}
        <div className="lg:w-1/2 w-full bg-[#1c3b3c] p-4 sm:p-5 lg:p-6 rounded-xl shadow-lg flex flex-col gap-3 sm:gap-4 items-center text-center justify-center relative">
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-[#FFC300] text-white text-xs sm:text-sm lg:text-lg py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 rounded-full z-10">
            25% Off
          </div>
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#fff] font-quesha leading-tight"
          >
            Off <span className="text-[#FFC300]">Percent!</span>
          </h1>
 
          <p className="text-[#fff] text-sm sm:text-base lg:text-xl xl:text-2xl font-light">Limited Time Offer</p>
          <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl text-[#fff] font-medium text-center px-2 sm:px-0">
            {eventData.name}
          </h3>
          <div className="flex gap-1 sm:gap-2 text-[#fff] text-base sm:text-lg lg:text-xl xl:text-2xl font-medium">
            <CountDown data={eventData} />
          </div>
          <button
            onClick={() => addToCartHandler(eventData)}
            className="bg-[#FFC300] hover:bg-opacity-90 text-white px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 rounded-full mt-3 sm:mt-4 w-fit text-sm sm:text-base lg:text-lg min-h-[44px]"
          >
            Shop Now ➜
          </button>
        </div>

        {/* Right: Product Images (Desktop Layout) */}
        <div className="hidden lg:flex lg:w-1/2 w-full p-4 sm:p-5 lg:p-6 items-center justify-center gap-4 sm:gap-5 lg:gap-6 relative">
          {eventData.images && eventData.images.slice(0, 2).map((img, idx) => (
            <div
              key={idx}
              className="rounded-3xl overflow-hidden shadow-md w-[200px] h-[350px] lg:w-[220px] lg:h-[400px] xl:w-[250px] xl:h-[450px] flex-shrink-0 cursor-pointer hover:scale-105 transition-all duration-300 relative"
              onClick={() => handleThumbnailClick(img.url)}
            >
              <div className="absolute inset-2 border-[1px] border-white rounded-3xl pointer-events-none"></div>
              <img
                src={img.url.startsWith('http') ? img.url : `${backend_url}${img.url}`}
                alt={`thumb-${idx}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
            </div>
          ))}
        </div>

        {/* Mobile: Product Images Carousel */}
        <div className="lg:hidden w-full p-4 flex flex-col items-center justify-center gap-4 relative">
          {/* Main Image Display */}
          <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg relative">
            <div className="absolute inset-2 border-[1px] border-white rounded-2xl pointer-events-none"></div>
            <img
              src={mainImage?.startsWith('http') ? mainImage : `${backend_url}${mainImage}`}
              alt="Main product"
              className="w-full h-64 sm:h-72 object-cover"
              onError={(e) => {
                e.target.src = "/Uploads/placeholder-image.jpg";
              }}
            />
          </div>
          
          {/* Thumbnail Strip */}
          <div className="flex gap-2 sm:gap-3 mt-2 overflow-x-auto pb-2 w-full px-2">
            {eventData.images && eventData.images.map((img, idx) => (
              <button
                key={idx}
                className={`flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  mainImage === img.url ? 'ring-2 ring-[#FFC300] ring-offset-2' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => handleThumbnailClick(img.url)}
              >
                <img
                  src={img.url.startsWith('http') ? img.url : `${backend_url}${img.url}`}
                  alt={`thumb-${idx}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  onError={(e) => {
                    e.target.src = "/Uploads/placeholder-image.jpg";
                  }}
                />
              </button>
            ))}
          </div>
          
          {/* Mobile Shop Now Button */}
          <button
            onClick={() => addToCartHandler(eventData)}
            className="lg:hidden bg-[#FFC300] hover:bg-opacity-90 text-white px-6 py-3 rounded-full mt-2 w-full max-w-xs text-base font-medium min-h-[48px]"
          >
            Shop Now ➜
          </button>
        </div>
      </div>

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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Responsive typography for Quesha font */
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
            font-size: 2.75rem !important;
          }
        }
        
        @media (min-width: 1025px) and (max-width: 1280px) {
          .font-quesha {
            font-size: 3.5rem !important;
          }
        }
        
        @media (min-width: 1281px) {
          .font-quesha {
            font-size: 4rem !important;
          }
        }
        
        /* Scrollbar styling for thumbnails */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #FFC300;
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #e0a800;
        }
      `}</style>
    </div>
  );
};

export default GrowthPlanEvents;