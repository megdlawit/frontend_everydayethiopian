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
import peac from "../../Assests/images/peac.png";

const ProductDetails = ({ data: initialData }) => {
  const { id } = useParams();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.products);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(initialData || null);
  const [category, setCategory] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/650";
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
          if (res.data.success && res.data.product) {
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
            throw new Error("Product not found or invalid response");
          }
        } catch (error) {
          showToast("error", "Product Fetch Error", error.response?.data?.message || "Failed to fetch product");
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

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const avg = totalRatings / totalReviewsLength || 0;
  const averageRating = avg.toFixed(2);

  const discountPercent = product?.originalPrice && product.originalPrice > product.discountPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : null;

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!process.env.REACT_APP_ADMIN_ID) {
        showToast("error", "Admin Error", "Admin information is unavailable.");
        return;
      }
      const groupTitle = `${product.name} - ${product.discountPrice} Birr`;
      const userId = user._id;
      const adminId = process.env.REACT_APP_ADMIN_ID; // Use admin ID instead of seller ID
      const images = product.images[0]?.url ? [product.images[0].url] : [];
      try {
        const res = await axios.post(
          `${server}/conversation/create-new-conversation`,
          { groupTitle, userId, adminId, images },
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
      navigate(`/products?category=${category._id}`);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const descriptionLimit = 100;
  const isDescriptionLong = product?.description && product.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? product.description.slice(0, descriptionLimit) + "..."
    : product?.description;

  if (loading) {
    return <div className="w-[90%] mx-auto py-5">Loading...</div>;
  }

  if (!product) {
    return <div className="w-[90%] mx-auto py-5">Product not found</div>;
  }

  return (
    <div className="bg-white">
      <div className="w-[90%] mx-auto py-5 mt-10 ">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 relative">
            <img
              src={getImageUrl(product.images[select]?.url)}
              alt={product.name || "Product image"}
              className="w-full md:w-[650px] h-64 md:h-[600px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
            />
            <div className="relative md:absolute md:top-[-28rem] w-full md:w-[650px] flex justify-center mx-auto md:mx-0 mt-4 md:mt-0">
              <div className="flex items-center space-x-1 md:space-x-4">
                {[...Array(product.images.length)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 md:h-2 rounded-full cursor-pointer ${
                      select === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                    }`}
                    onClick={() => setSelect(i)}
                    style={{ width: "60px", height: "4px", borderRadius: "2px" }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-4 md:mt-[-8rem] flex-wrap gap-2 md:gap-0 md:flex-nowrap">
              {product.images.map((i, index) => (
                <div
                  key={index}
                  className="cursor-pointer mx-1 md:mx-2"
                >
                  <img
                    src={getImageUrl(i?.url)}
                    alt={`Thumbnail ${index}`}
                    className="w-20 h-16 md:w-[140px] md:h-[100px] object-cover border-2 border-white rounded-lg"
                    onClick={() => setSelect(index)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 md:mt-10 w-full md:w-3/4 mx-auto md:mx-0">
              <div className="bg-white border border-[#B4B4B4] rounded-lg p-3 md:p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                        src={getImageUrl(product?.shop?.avatar?.url || "/Uploads/avatar/avatar-1754729528346-341457281.jpg")}
                        alt={product.shop.name || "Shop"}
                        className="w-[50px] h-[50px] rounded-full mr-3 object-cover flex-shrink-0"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={
                          product?.shop?.template === "growthplan"
                            ? `/shop/growthplan/${product?.shop._id}`
                            : product?.shop?.template === "proplan"
                            ? `/shop/proplan/${product?.shop._id}`
                            : `/shop/preview/${product?.shop._id}`
                        }
                      >
                        <h3 className={`${styles.shop_name} truncate`}>{product.shop.name || "Unknown Shop"}</h3>
                      </Link>
                      <div className="flex mt-1">
                        <Ratings rating={product?.ratings} />
                      </div>
                      <p className="text-sm text-[#CC9A00] mt-1 bg-[#FFF6DB] px-2 py-1 rounded-full truncate">{totalOrders} Successful Orders</p>
                    </div>
                  </div>
                  <button
                    className="text-[#CC9A00] bg-[#FFF6DB] py-2 px-4 rounded-[16px] border border-[#CC9A00] hover:bg-yellow-100 w-full md:w-auto flex items-center justify-center"
                    onClick={handleMessageSubmit}
                  >
                    Send Message <AiOutlineMessage className="ml-1 inline" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
            {category && (
              <button
                onClick={handleCategoryClick}
                className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-full md:w-fit hover:bg-gray-200 cursor-pointer text-left md:text-left"
              >
                <p className="text-sm">{category.title || "Unknown Category"}</p>
              </button>
            )}
            <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
              {product.name || "Unnamed Product"}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start mt-2 gap-2 sm:gap-0 md:ml-0">
              <div className="flex items-center">
                <h4 className={`${styles.productDiscountPrice}`}>
                  {product.discountPrice ? `${product.discountPrice} Birr` : "N/A"}
                </h4>
              </div>
              <div className="sm:ml-5 md:ml-20">
                <Ratings rating={product?.ratings} />
              </div>
            </div>

            {product.isPreorder && (
              (() => {
                const days = product.estimatedOrderDays
                  ? product.estimatedOrderDays
                  : product.estimatedOrderDate
                  ? Math.max(0, Math.ceil((new Date(product.estimatedOrderDate) - Date.now()) / (24 * 60 * 60 * 1000)))
                  : null;
                return (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="bg-[#FFF5CC] text-[#CC9A00] px-3 py-1 rounded-full text-sm font-medium">Pre-order</span>
                    <span className="text-gray-600 text-sm">{days ? `Estimated: ${days} day${days > 1 ? 's' : ''}` : 'Estimated date: TBA'}</span>
                  </div>
                );
              })()
            )}

            <div className="mt-6">
              <label className="text-gray-800 font-light block mb-2">Select Size</label>
              <div className="flex flex-wrap gap-2 md:space-x-2">
                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                  product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-3 py-2 rounded-[16px] text-sm ${
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

            <div className="mt-6">
              <label className="text-gray-800 font-light block mb-2">Select Color</label>
              <div className="flex flex-wrap gap-2 md:space-x-2">
                {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
                  product.colors.map((color) => (
                    <button
                      key={color}
                      className={`px-3 py-2 rounded-[16px] text-sm ${
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

            <div className="mt-6 w-full md:w-3/4">
              <div className="flex flex-row items-center justify-center md:justify-start gap-2 md:gap-4 md:space-x-4">
                <div className="flex items-center">
                  <button
                    className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                    onClick={decrementCount}
                  >
                    -
                  </button>
                  <span className="mx-2 md:mx-4 text-gray-800 font-medium">{count}</span>
                  <button
                    className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                    onClick={incrementCount}
                  >
                    +
                  </button>
                </div>
                <button
                  className="bg-[#CC9A00] text-white py-3 px-6 md:px-10 rounded-[16px] flex items-center justify-center hover:bg-yellow-500 flex-grow md:flex-none text-sm md:text-base"
                  onClick={() => addToCartHandler(product._id)}
                >
                  <AiOutlineShoppingCart className="mr-2" /> Add to Cart
                </button>
                <div className="relative flex-shrink-0">
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

            <div className="mt-6 p-4 border border-[#525252] rounded-lg w-full md:w-3/4">
              <p className="text-gray-600">
                {isDescriptionExpanded ? product.description : truncatedDescription || "No description available"}
                {isDescriptionLong && (
                  <span
                    className="text-[#CC9A00] cursor-pointer ml-2"
                    onClick={toggleDescription}
                  >
                    {isDescriptionExpanded ? "See Less" : "See More"}
                  </span>
                )}
              </p>
            </div>

            <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-4 flex items-center w-full md:w-3/4">
              <img
                src={peac}
                alt="Offer"
                className="w-10 h-10 mr-3 object-contain flex-shrink-0"
              />
              <p className="text-sm font-semibold flex-1">
                {discountPercent ? `Save ${discountPercent}% today. Limited time offer!` : "Great Value! Limited time offer!"}
              </p>
            </div>
          </div>
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
          top: "80px", 
        }}
      />
    </div>
  );
};

export default ProductDetails;