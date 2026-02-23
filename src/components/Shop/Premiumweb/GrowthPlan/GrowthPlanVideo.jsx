import React, { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../../../redux/actions/wishlist";
import { addTocart } from "../../../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../../Toast"; 
import ProductDetailsCard from "../../../Products/ProductDetails";
import api from "../../../../utils/api";
import { backend_url } from "../../../../server";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GrowthPlanVideo = ({ shopId, products: overrideProducts }) => {
  const [products, setProducts] = useState([]);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [openProductId, setOpenProductId] = useState(null);
  const [mutedVideos, setMutedVideos] = useState({});
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

  const getVideoUrl = (video) => {
    if (!video) return "/Uploads/placeholder-video.mp4";
    if (video.startsWith("blob:") || video.startsWith("http")) return video;
    return `${backend_url}${video.startsWith("/") ? video : `/${video}`}`;
  };

  useEffect(() => {
    if (overrideProducts) {
      const limitedProducts = overrideProducts.slice(0, 4).map((p) => ({
        ...p,
        video: getVideoUrl(p.newVideoPreview || p.video),
      }));
      setProducts(limitedProducts);
      const vids = {};
      limitedProducts.forEach((p, idx) => {
        vids[p._id] = idx === 0 ? false : true;
      });
      setMutedVideos(vids);
      return;
    }
    const fetchProductsWithVideos = async () => {
      try {
        const response = await axios.get(`${backend_url}/product/get-products-with-videos`);
        let filteredProducts = response.data.products;
        if (shopId) {
          filteredProducts = filteredProducts.filter(
            (p) => p.shopId && (p.shopId._id === shopId || p.shopId === shopId)
          );
        }
        const limitedProducts = filteredProducts.slice(0, 4).map((p) => ({
          ...p,
          video: getVideoUrl(p.video),
        }));
        setProducts(limitedProducts);
        const vids = {};
        limitedProducts.forEach((p, idx) => {
          vids[p._id] = idx === 0 ? false : true;
        });
        setMutedVideos(vids);
      } catch (error) {
        console.error("Error fetching products with videos:", error);
        showToast("error", "Load Failed", "Failed to load video products.");
      }
    };
    fetchProductsWithVideos();
  }, [shopId, overrideProducts]);

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist?.some((i) => i._id === product._id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product));
      showToast("success", "Removed from Wishlist", "Removed from wishlist!");
    } else {
      dispatch(addToWishlist(product));
      showToast("success", "Added to Wishlist", "Added to wishlist!");
    }
  };

  const addToCartHandler = (product) => {
    const exists = cart?.some((i) => i._id === product._id);
    if (exists) {
      showToast("error", "Already in Cart", "Item already in cart!");
    } else if (product.stock < 1) {
      showToast("error", "Out of Stock", "Product stock limited!");
    } else {
      dispatch(addTocart({ ...product, qty: 1 }));
      showToast("success", "Added to Cart", "Item added to cart successfully!");
    }
  };

  const toggleMute = (productId) => {
    setMutedVideos((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const sliderSettings = {
    dots: true,
    infinite: products.length > 1,
    speed: 500,
    slidesToShow: Math.min(products.length, 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(products.length, 3),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(products.length, 2),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-10">
      {products.length > 0 ? (
        <Slider {...sliderSettings}>
          {products.map((product) => (
            <div key={product._id} className="px-2">
              <div
                className="relative w-full h-[400px] max-w-[350px] mx-auto group overflow-hidden transition-all duration-300 p-2"
                onClick={() => setOpenProductId(product._id)}
              >
                <div className="relative h-[400px] overflow-hidden">
                  <video
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    autoPlay
                    loop
                    muted={mutedVideos[product._id] !== false}
                    playsInline
                    onError={(e) => {
                      console.error(`Video failed to load for product ${product._id}: ${e.target.src}`);
                      e.target.poster = "/Uploads/placeholder-image.jpg";
                    }}
                    src={getVideoUrl(product.newVideoPreview || product.video)}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <button
                    className="absolute left-2 bottom-5 z-10 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all"
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
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(product);
                      }}
                      className="p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-90 text-white"
                      title={wishlist?.some((i) => i._id === product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {wishlist?.some((i) => i._id === product._id) ? (
                        <AiFillHeart size={18} color="red" />
                      ) : (
                        <AiOutlineHeart size={18} />
                      )}
                    </button>
                  </div>
                  <div className="group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartHandler(product);
                      }}
                      className="absolute bottom-2 right-2 p-3 rounded-full bg-yellow-400 text-white hover:scale-110 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Add to Cart"
                    >
                      <AiOutlineShoppingCart size={24} />
                    </button>
                  </div>
                </div>
              </div>
              {openProductId === product._id && (
                <ProductDetailsCard setOpen={() => setOpenProductId(null)} data={product} />
              )}
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-gray-500">No products with videos available.</p>
      )}
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
          top: "80px", 
        }}
      />
    </div>
  );
};

export default GrowthPlanVideo;