import React, { useState, useEffect } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Toast from "../../../components/Toast"; 
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard";
import { backend_url } from "../../../server";

const ProductCard = ({ data, hideShopLink = false }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data._id));
  }, [wishlist, data._id]);

  const removeFromWishlistHandler = () => {
    setClick(false);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = () => {
    setClick(true);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = () => {
    const isItemExists = cart?.some((i) => i._id === data._id);
    if (isItemExists) {
      showToast("error", "Error", "Item already in cart!");
      return;
    }
    if (data.stock < 1) {
      showToast("error", "Error", "Product stock limited!");
      return;
    }

    const cartData = {
      _id: data._id,
      name: data.name,
      qty: 1,
      discountPrice: data.discountPrice,
      shopId: data.shopId?._id || data.shopId, // Handle string or object
      images: data.images, // Include for cart display
      stock: data.stock, // Include for stock validation
    };

    dispatch(addTocart(cartData));
    showToast("success", "Success", "Item added to cart successfully!");

    if (data.stock > 0 && data.stock <= 5) {
      showToast("info", "Info", `Only ${data.stock} items left in stock!`);
    }
  };

  // Calculate discount percent if originalPrice is available
  const discountPercent = data.originalPrice && data.discountPrice
    ? Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${data._id}`}
      className="block"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="relative w-full h-[330px] max-w-[280px] mx-auto group overflow-hidden rounded-md transition-all duration-300 p-1"
      >
        {/* Hover wrapper for image + text */}
        <div className="w-full h-full rounded-md transition-all duration-300 group-hover:bg-[#FFC30054] group-hover:p-2">
          {/* Image Section */}
          <div className="relative h-[230px] overflow-hidden rounded-md">
            <img
              src={
                data.images?.[0]?.url
                  ? (data.images[0].url.startsWith("blob:") || data.images[0].url.startsWith("http")
                      ? data.images[0].url
                      : `${backend_url}${data.images[0].url}`)
                  : "/Uploads/placeholder-image.jpg"
              }
              alt={data.name || "Product"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Uploads/placeholder-image.jpg";
              }}
            />

            {/* Discount Percent Badge - top-right */}
            {discountPercent > 0 && (
              <div className="absolute top-2 right-2 bg-[#FFC300] text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercent}% OFF
              </div>
            )}

            {/* Heart icon - top-left */}
            <div className="absolute top-2 left-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  click ? removeFromWishlistHandler() : addToWishlistHandler();
                }}
                className="p-2 rounded-full bg-[#D9D9D9C4] hover:bg-[#ccc] text-white"
                title={click ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {click ? (
                  <AiFillHeart size={18} color="red" />
                ) : (
                  <AiOutlineHeart size={18} />
                )}
              </button>
            </div>

            {/* Cart icon - bottom-right */}
            <div className="absolute bottom-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
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

          {/* Title and Price Section */}
          <div className="pt-3 px-3 pb-4 flex items-center justify-between">
            <div className="flex-1 pr-2" style={{ maxWidth: "160px" }}>
              <h4
                className="text-sm font-medium text-gray-900 truncate"
                style={{ width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {data.name || "Unnamed Product"}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{data.discountPrice || "N/A"} ETB</p>
            </div>
            {!hideShopLink && data.shopId && data.shopId._id && (
              <Link
                to={(() => {
                  const template = data.shopId.template || "basic";
                  if (template === "growthplan") return `/shop/growthplan/${data.shopId._id}`;
                  if (template === "proplan") return `/shop/proplan/${data.shopId._id}`;
                  return `/shop/preview/${data.shopId._id}`;
                })()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-right">
                  <span
                    className="inline-block text-[#FFC300] text-xs px-2 py-1 rounded-full group-hover:bg-white group-hover:text-[#FFC300] transition-all duration-300"
                  >
                    Visit Shop
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;