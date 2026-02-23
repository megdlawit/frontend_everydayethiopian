import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineRight,
} from "react-icons/ai";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import Toast from "../Toast";
import { server, backend_url } from "../../server";
import "react-toastify/dist/ReactToastify.css";

const getVideoUrl = (video) => {
  if (!video) return "/Uploads/placeholder-video.mp4";
  if (video.startsWith("blob:") || video.startsWith("http")) return video;
  return `${backend_url}${video.startsWith("/") ? video : `/${video}`}`;
};

const VideoProductShow = ({ shopId }) => {
  const [products, setProducts] = useState([]);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [mutedVideos, setMutedVideos] = useState({});
  const dispatch = useDispatch();
  const [sliderRef, setSliderRef] = useState(null);

  const showToast = (type, title, message) => {
    toast(
      <Toast type={type} title={title} message={message} onClose={() => toast.dismiss()} />,
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

  useEffect(() => {
    const fetchProductsWithVideos = async () => {
      try {
        const response = await axios.get(
          `${server}/product/get-products-with-videos`
        );
        let filteredProducts = response.data.products.filter(
          (p) => p.video && p.video !== ""
        );

        if (shopId) {
          filteredProducts = filteredProducts.filter(
            (p) => p.shopId && p.shopId._id === shopId
          );
        }

        filteredProducts = filteredProducts.filter(
          (p) =>
            p.status === "Active" &&
            !p.name.toLowerCase().includes("sample") &&
            !p.name.toLowerCase().includes("special discount")
        );

        setProducts(filteredProducts);

        const vids = {};
        filteredProducts.forEach((p, idx) => {
          vids[p._id] = idx === 0 ? false : true;
        });
        setMutedVideos(vids);
      } catch (error) {
        console.error("Error fetching products with videos:", error);
      }
    };
    fetchProductsWithVideos();
  }, [shopId]);

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist?.some((i) => i._id === product._id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product));
      showToast("success", "Wishlist Success", "Removed from wishlist!");
    } else {
      dispatch(addToWishlist(product));
      showToast("success", "Wishlist Success", "Added to wishlist!");
    }
  };

  const addToCartHandler = (product) => {
    const isItemExists = cart && cart.find((i) => i._id === product._id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else {
      if (product.stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = {
          ...product,
          qty: 1,
          selectedSize: null,
          selectedColor: null,
          shopId: product.shopId?._id || product.shop?._id,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Updated", "Item added to cart successfully!");
      }
    }
    if (product.stock > 0 && product.stock <= 5) {
      showToast("info", "Low Stock", `Only ${product.stock} items left in stock!`);
    }
  };

  const toggleMute = (productId) => {
    setMutedVideos((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const settings = {
    dots: true,
    infinite: products.length > 1,
    speed: 500,
    slidesToShow: Math.min(products.length, 4),
    slidesToScroll: 1,
    autoplay: products.length > 1,
    autoplaySpeed: 5000,
    arrows: false, 
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: Math.min(products.length, 3) },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(products.length, 2) },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const renderProduct = (product) => (
    <div key={product._id} className="px-2 relative">
      <Link to={`/video-product-page/${product._id}`} className="block">
        <div className="relative w-full h-[460px] max-w-[280px] mx-auto group overflow-hidden rounded-md transition-all duration-300 p-1">
          <div className="w-full h-full rounded-md transition-all duration-300 group-hover:bg-[#FFC30054] group-hover:p-2">
            <div className="relative h-[360px] overflow-hidden rounded-md">
              <video
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                autoPlay
                loop
                muted={mutedVideos[product._id] !== false}
                playsInline
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.poster = "/Uploads/placeholder-image.jpg";
                }}
              >
                <source src={getVideoUrl(product.video)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Mute/Unmute Button */}
              <button
                className="absolute left-2 bottom-2 z-10 bg-[#D9D9D9C4] hover:bg-[#ccc] rounded-full p-2 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute(product._id);
                }}
                title={mutedVideos[product._id] !== false ? "Unmute" : "Mute"}
              >
                {mutedVideos[product._id] !== false ? (
                  <FaVolumeMute size={18} color="#333" />
                ) : (
                  <FaVolumeUp size={18} color="#333" />
                )}
              </button>

              {/* Wishlist Button */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product);
                  }}
                  className="p-2 rounded-full bg-[#D9D9D9C4] hover:bg-[#ccc]"
                  title={
                    wishlist?.some((i) => i._id === product._id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                >
                  {wishlist?.some((i) => i._id === product._id) ? (
                    <AiFillHeart size={18} color="red" />
                  ) : (
                    <AiOutlineHeart size={18} />
                  )}
                </button>
              </div>

              {/* Cart Button */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCartHandler(product);
                  }}
                  className="p-3 rounded-full bg-[#FFC300] text-white hover:scale-110 shadow-md"
                  title="Add to Cart"
                >
                  <AiOutlineShoppingCart size={24} />
                </button>
              </div>

              {/* Mobile Next Arrow */}
              <button
                className="absolute bottom-2 right-2 bg-[#FFC300] text-white rounded-full p-3 sm:hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sliderRef?.slickNext();
                }}
              >
                <AiOutlineRight size={22} />
              </button>
            </div>

            <div className="pt-3 px-3 pb-4 flex items-end justify-between">
              <div className="flex-1 min-w-0">
                <h4
                  className="text-sm font-medium text-gray-900 truncate"
                  style={{ width: "160px" }}
                  title={product.name}
                >
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{product.discountPrice} ETB</p>
              </div>

              {product.shopId && product.shopId._id && (
                <Link
                  to={(() => {
                    const template = product.shopId.template || "basic";
                    if (template === "growthplan") return `/shop/growthplan/${product.shopId._id}`;
                    if (template === "proplan") return `/shop/proplan/${product.shopId._id}`;
                    return `/shop/preview/${product.shopId._id}`;
                  })()}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2"
                >
                  <button
                    className="inline-block text-[#FFC300] text-xs px-2 py-1 rounded-full group-hover:bg-white group-hover:text-[#FFC300] transition-all duration-300"
                    title="Visit Shop"
                  >
                    Visit Shop
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-10">
      {/* ✅ Responsive Title */}
      <h1 className="text-center font-quesha mb-10 text-3xl sm:text-5xl md:text-6xl xl:text-7xl leading-tight">
        Video <span className="text-yellow-600">Highlights</span>
      </h1>

      {products.length > 0 ? (
        products.length === 1 ? (
          <div className="flex justify-center">{renderProduct(products[0])}</div>
        ) : (
          <Slider ref={setSliderRef} {...settings}>
            {products.map((product) => renderProduct(product))}
          </Slider>
        )
      ) : (
        <p className="text-center text-gray-500">No products with videos available.</p>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ top: "80px" }}
      />
    </div>
  );
};

export default VideoProductShow;