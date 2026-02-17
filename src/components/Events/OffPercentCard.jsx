import React, { useState, useEffect, Component } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast";
import { server, backend_url } from "../../server";

const OffPercentCard = ({ data: initialData, eventId, hideShopLink = false }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/Uploads/placeholder-image.jpg";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

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

  useEffect(() => {
    if (!initialData && eventId) {
      setLoading(true);
      fetch(`${server}/event/get-event/${eventId}`)
        .then((res) => res.json())
        .then((res) => {
          setData(res.event || null);
          setLoading(false);
        })
        .catch(() => {
          setData(null);
          setLoading(false);
        });
    }
  }, [eventId, initialData]);

  useEffect(() => {
    if (data?._id) {
      setClick(wishlist?.some((i) => i._id === data._id) || false);
    }
  }, [wishlist, data]);

  if (loading) {
    return (
      <div className="relative w-full h-[330px] max-w-[280px] mx-auto rounded-md bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative w-full h-[330px] max-w-[280px] mx-auto rounded-md bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No Event Data</p>
      </div>
    );
  }

  // Calculate discount percent if originalPrice is available
  const discountPercent =
    data.originalPrice && data.discountPrice
      ? Math.round(
          ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
        )
      : data.discountPercent || 0;

  const removeFromWishlistHandler = () => {
    setClick(false);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = () => {
    setClick(true);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = () => {
    const exists = cart?.some((i) => i._id === data._id);
    if (exists) {
      showToast("error", "Cart Error", "Event already in cart!");
    } else if (data.stock < 1) {
      showToast("error", "Stock Error", "Event tickets limited!");
    } else {
      dispatch(addTocart({ ...data, qty: 1 }));
      showToast("success", "Cart Updated", "Event added to cart successfully!");
    }
  };

  const handleCardClick = () => {
    navigate(`/event/${data._id}`);
  };

  return (
    <div
      className="relative w-full h-[330px] max-w-[280px] mx-auto group overflow-hidden rounded-md transition-all duration-300 p-1 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="w-full h-full rounded-md transition-all duration-300 group-hover:bg-[#FFC30054] group-hover:p-2">
        <div className="relative h-[230px] overflow-hidden rounded-md">
          <img
            src={getImageUrl(data.images?.[0]?.url)}
            alt={data.name || "Event"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/Uploads/placeholder-image.jpg";
            }}
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-[#FFC300] text-white text-xs font-bold px-2 py-1 rounded-full">
              {discountPercent}% OFF
            </div>
          )}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
            {click ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlistHandler();
                }}
                className="p-2 rounded-full bg-[#D9D9D9C4] hover:bg-[#ccc] text-white"
                title="Remove from Wishlist"
              >
                <AiFillHeart size={18} color="red" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToWishlistHandler();
                }}
                className="p-2 rounded-full bg-[#D9D9D9C4] hover:bg-[#ccc] text-white"
                title="Add to Wishlist"
              >
                <AiOutlineHeart size={18} />
              </button>
            )}
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCartHandler();
              }}
              className="p-3 rounded-full bg-[#FFC300] text-white hover:scale-110 shadow-md"
              title="Add to Cart"
            >
              <AiOutlineShoppingCart size={24} />
            </button>
          </div>
        </div>
        <div className="pt-3 px-3 pb-4 flex items-center justify-between">
          <div style={{ maxWidth: "150px" }}>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {data.name || "Unnamed Event"}
            </h4>
            <div className="text-sm text-gray-600 mt-1">
              {data.originalPrice && (
                <span className="line-through text-gray-400 mr-2">
                  {data.originalPrice} ETB
                </span>
              )}
              <span>{data.discountPrice ? `${data.discountPrice} ETB` : "N/A"}</span>
            </div>
          </div>
          {!hideShopLink && data.shopId && (
            <Link
              to={
                data.shopId.isPremium
                  ? `/shop/premiumpreview/${data.shopId._id || data.shopId}`
                  : `/shop/preview/${data.shopId._id || data.shopId}`
              }
              className="flex items-center space-x-1 group/link"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-end">
                <span className="inline-block text-[#FFC300] text-xs px-2 py-1 rounded-full group-hover:bg-white group-hover:text-[#FFC300] transition-all duration-300">
                  Visit Shop
                </span>
              </div>
            </Link>
          )}
        </div>
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

export default OffPercentCard;