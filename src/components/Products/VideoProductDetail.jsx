import React, { useEffect, useState } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { server, backend_url } from "../../server";
import styles from "../../styles/styles";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import Ratings from "./Ratings";
import api from "../../utils/api";
import Header2 from "../Layout/Header2";
import Footer from "../Layout/Footer";
import peac from "../../Assests/images/peac.png";

const VideoProductDetail = ({ data: initialData, isModal = false }) => {
  const { id } = useParams();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.products);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(initialData || null);
  const [category, setCategory] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Helper function to get full media URL
  const getMediaUrl = (url) => {
    if (!url) return null;
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
    const fetchProduct = async () => {
      if (!product) {
        setLoading(true);
        try {
          const res = await axios.get(`${server}/product/detail/${id}`, { withCredentials: true });
          if (res.data.success && res.data.product && res.data.product.video) {
            setProduct(res.data.product);
            if (res.data.product.shop && res.data.product.shop._id) {
              dispatch(getAllProductsShop(res.data.product.shop._id));
              // Fetch total orders for the shop
              try {
                const ordersRes = await axios.get(`${server}/order/get-seller-all-orders/${res.data.product.shop._id}`, { withCredentials: true });
                setTotalOrders(ordersRes.data.orders ? ordersRes.data.orders.length : 0);
              } catch (ordersError) {
                console.error("Failed to fetch shop orders:", ordersError);
                setTotalOrders(0);
              }
            }
            if (res.data.product.category) {
              const categoryRes = await axios.get(`${server}/category/get-category/${res.data.product.category}`, { withCredentials: true });
              if (categoryRes.data.success) {
                setCategory(categoryRes.data.category);
              }
            }
          } else {
            throw new Error("Video product not found or invalid response");
          }
        } catch (error) {
          showToast("error", "Product Fetch Error", error.response?.data?.message || "Failed to fetch video product");
          setProduct(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProduct();

    if (wishlist && wishlist.find((i) => i._id === id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [id, wishlist, dispatch, product]);

  useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setSelectedColor(null);
    }
  }, [product]);

  const incrementCount = () => {
    if (count < product.stock) {
      setCount(count + 1);
    } else {
      showToast("error", "Stock Limit", `Maximum stock limit reached: ${product.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else {
      if (product.stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = {
          ...product,
          qty: count,
          selectedSize,
          selectedColor,
          shopId: product.shop._id,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Updated", "Item added to cart successfully!");
      }
    }
    if (product.stock > 0 && product.stock <= 5) {
      showToast("info", "Low Stock", `Only ${product.stock} items left in stock!`);
    }
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!product.shop || !product.shop._id) {
        showToast("error", "Seller Error", "Seller information is unavailable.");
        return;
      }
      const groupTitle = product._id + user._id;
      const userId = user._id;
      const sellerId = product.shop._id;
      try {
        const res = await axios.post(
          `${server}/conversation/create-new-conversation`,
          { groupTitle, userId, sellerId },
          { withCredentials: true }
        );
        navigate(`/inbox?${res.data.conversation._id}`);
      } catch (error) {
        showToast("error", "Conversation Error", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Authentication Error", "Please login to create a conversation");
    }
  };

  const handleCategoryClick = () => {
    if (category?._id) {
      navigate(`/VideoShoppingPage?category=${category._id}`);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const descriptionLimit = 100;
  const isDescriptionLong = product?.description && product.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? (() => {
        const lastSpace = product.description.slice(0, descriptionLimit).lastIndexOf(" ");
        return product.description.slice(0, lastSpace > 0 ? lastSpace : descriptionLimit) + "...";
      })()
    : product?.description;

  // Calculate discount percent if originalPrice is available
  const discountPercent = product?.originalPrice && product?.discountPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return <div className="w-[90%] mx-auto py-5">Loading...</div>;
  }

  if (!product) {
    return <div className="w-[90%] mx-auto py-5">Video product not found</div>;
  }

  return (
    <div>
      {!isModal && <Header2 />}
      <div className="bg-white">
        <div className="w-[90%] mx-auto py-5">
          <div className="flex flex-col md:flex-row">
            {/* Video Section */}
            <div className="w-full md:w-1/2">
              <div className="relative">
                <video
                  src={getMediaUrl(product.video) || "/Uploads/placeholder-video.mp4"}
                  controls
                  className="w-[650px] h-[600px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "/Uploads/placeholder-video.mp4";
                  }}
                />
                {/* Discount Percent Badge - top-right */}
                {discountPercent > 0 && (
                  <div className="absolute top-2 right-2 bg-[#CC9A00] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {discountPercent}% OFF
                  </div>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="flex justify-center mt-4">
                  {product.images.map((i, index) => (
                    <div key={index} className="cursor-pointer mx-2">
                      <img
                        src={getMediaUrl(i?.url) || "https://via.placeholder.com/140x100"}
                        alt={`Thumbnail ${index}`}
                        className="w-[140px] h-[100px] object-cover border-2 border-white rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* Seller Info and Message */}
              <div className="mt-10">
                <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Link
                        to={
                          product?.shop?.template === "growthplan"
                            ? `/shop/growthplan/${product?.shop._id}`
                            : product?.shop?.template === "proplan"
                            ? `/shop/proplan/${product?.shop._id}`
                            : `/shop/preview/${product?.shop._id}`
                        }
                      >
                        <img
                          src={getMediaUrl(product?.shop?.avatar?.url) || "/Uploads/avatar/avatar-1754729528346-341457281.jpg"}
                          alt={product.shop.name || "Shop"}
                          className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                        />
                      </Link>
                      <div>
                        <Link
                          to={
                            product?.shop?.template === "growthplan"
                              ? `/shop/growthplan/${product?.shop._id}`
                              : product?.shop?.template === "proplan"
                              ? `/shop/proplan/${product?.shop._id}`
                              : `/shop/preview/${product?.shop._id}`
                          }
                        >
                          <h3 className={`${styles.shop_name}`}>{product.shop.name || "Unknown Shop"}</h3>
                        </Link>
                        <div className="flex mt-1">
                          <Ratings rating={product?.ratings} />
                        </div>
                         <p className="text-sm text-[#CC9A00] mt-1 bg-[#FFF6DB] px-2 py-1 rounded-full ">{totalOrders} Successfull Orders </p>
                      </div>
                    </div>
                    <button
                      className="text-[#CC9A00] bg-[#FFF6DB] py-2 px-4 rounded-[16px] border border-[#CC9A00] hover:bg-yellow-100"
                      onClick={handleMessageSubmit}
                    >
                      Send Message <AiOutlineMessage className="ml-1 inline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
              {/* Category Display */}
              {category && (
                <button
                  onClick={handleCategoryClick}
                  className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                >
                  <p className="text-sm">{category.title || "Unknown Category"}</p>
                </button>
              )}
              <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                {product.name || "Unnamed Product"}
              </h1>
              <div className="flex items-center justify-start mt-2">
                <div className="flex items-center">
                  <h4 className={`${styles.productDiscountPrice}`}>
                    {product.discountPrice ? `${product.discountPrice} Birr` : "N/A"}
                  </h4>
                  {/* {product.originalPrice && (
                    <h3 className={`${styles.price} ml-2`}>{product.originalPrice} Birr</h3>
                  )} */}
                </div>
                <div className="ml-20">
                  <Ratings rating={product?.ratings} />
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <label className="text-gray-800 font-light">Select Size</label>
                <div className="flex space-x-2 mt-2">
                  {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                    product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`px-4 py-2 rounded-[16px] ${
                          selectedSize === size
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-800"
                        } hover:bg-gray-200`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No sizes available</p>
                  )}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mt-6">
                <label className="text-gray-800 font-light">Select Color</label>
                <div className="flex space-x-2 mt-2">
                  {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
                    product.colors.map((color) => (
                      <button
                        key={color}
                        className={`px-4 py-2 rounded-[16px] ${
                          selectedColor === color
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-800"
                        } hover:bg-gray-200`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No colors available</p>
                  )}
                </div>
              </div>

              {/* Quantity, Add to Cart, and Wishlist */}
              <div className="mt-6 w-3/4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <button
                      className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                      onClick={decrementCount}
                    >
                      -
                    </button>
                    <span className="mx-4 text-gray-800 font-medium">{count}</span>
                    <button
                      className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                      onClick={incrementCount}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="bg-[#CC9A00] text-white py-3 px-10 rounded-[16px] flex items-center justify-center hover:bg-yellow-500 flex-grow"
                    onClick={() => addToCartHandler(product._id)}
                  >
                    <AiOutlineShoppingCart className="mr-2" /> Add to Cart
                  </button>
                  <div className="relative">
                    {click ? (
                      <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                        <AiFillHeart
                          size={24}
                          className="cursor-pointer"
                          onClick={() => removeFromWishlistHandler(product)}
                          color={click ? "red" : "#333"}
                          title="Remove from wishlist"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                        <AiOutlineHeart
                          size={24}
                          className="cursor-pointer"
                          onClick={() => addToWishlistHandler(product)}
                          color={click ? "red" : "#333"}
                          title="Add to wishlist"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 p-4 border border-[#525252] rounded-lg w-3/4">
                <p className="text-gray-600">
                  {isDescriptionExpanded ? product.description : truncatedDescription || "No description available"}
                  {isDescriptionLong && (
                    <span
                      className="text-[#CC9A00] cursor-pointer ml-2 font-semibold"
                      onClick={toggleDescription}
                    >
                      {isDescriptionExpanded ? "See Less" : "See More"}
                    </span>
                  )}
                </p>
              </div>

              {/* Offer Section */}
              <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-4 flex items-center w-3/4">
                <img
                  src={peac}
                  alt="Offer"
                  className="w-10 h-10 mr-3 object-contain"
                />
                <p className="text-sm font-semibold">
                  {discountPercent > 0 ? `Save ${discountPercent}% today. Limited time offer!` : "Great Value! Limited time offer!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isModal}

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

export default VideoProductDetail;