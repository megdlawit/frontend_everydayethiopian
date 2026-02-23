import React, { useEffect, useState, Component } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllEventsShop } from "../../redux/actions/event";
import { server, backend_url } from "../../server";
import styles from "../../styles/styles";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import Ratings from "../Products/Ratings";
import api from "../../utils/api";
import Header2 from "../Layout/Header2";
import peac from "../../Assests/images/peac.png";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[90%] mx-auto py-5 text-red-600">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const EventDetails = ({ data: initialData }) => {
  const { id } = useParams();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { events } = useSelector((state) => state.events);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(initialData || null);
  const [shop, setShop] = useState(null);
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
    const fetchEvent = async () => {
      if (!event) {
        setLoading(true);
        try {
          const res = await axios.get(`${server}/event/get-event/${id}`, {
            withCredentials: true,
          });
          if (res.data.success && res.data.event) {
            setEvent(res.data.event);
            const shopId = res.data.event.shopId?._id || res.data.event.shopId;
            if (shopId) {
              try {
                const shopRes = await axios.get(`${server}/shop/get-shop/${shopId}`, {
                  withCredentials: true,
                });
                if (shopRes.data.success && shopRes.data.shop) {
                  setShop(shopRes.data.shop);
                } else {
                  showToast("error", "Shop Error", "Shop data not found");
                }
              } catch (shopError) {
                showToast("error", "Shop Fetch Error", "Failed to fetch shop details");
              }
              dispatch(getAllEventsShop(shopId));
              // Fetch total orders for the shop
              try {
                const ordersRes = await axios.get(`${server}/order/get-seller-all-orders/${shopId}`, { withCredentials: true });
                setTotalOrders(ordersRes.data.orders ? ordersRes.data.orders.length : 0);
              } catch (ordersError) {
                console.error("Failed to fetch shop orders:", ordersError);
                setTotalOrders(0);
              }
            } else {
              showToast("error", "Shop Error", "Shop information unavailable");
            }
            if (res.data.event.category) {
              const categoryRes = await axios.get(`${server}/category/get-category/${res.data.event.category}`, {
                withCredentials: true,
              });
              if (categoryRes.data.success) {
                setCategory(categoryRes.data.category);
              }
            }
          } else {
            throw new Error("Event not found or invalid response");
          }
        } catch (error) {
          showToast("error", "Event Fetch Error", error.response?.data?.message || "Failed to fetch event");
          setEvent(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEvent();

    if (wishlist && wishlist.find((i) => i._id === id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [id, wishlist, dispatch, event]);

  useEffect(() => {
    if (event) {
      setSelectedSize(null);
      setSelectedColor(null);
    }
  }, [event]);

  const incrementCount = () => {
    if (event && count < event.stock) {
      setCount(count + 1);
    } else if (event) {
      showToast("error", "Stock Limit", `Maximum stock limit reached: ${event.stock}`);
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
    } else if (event) {
      if (event.stock < 1) {
        showToast("error", "Stock Error", "Event stock limited!");
      } else if (event.status !== "Running" || new Date(event.Finish_Date) < new Date()) {
        showToast("error", "Event Error", "Event is not available for purchase!");
      } else {
        const cartData = {
          ...event,
          qty: count,
          selectedSize,
          selectedColor,
          shopId: event.shopId?._id || event.shopId,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Updated", "Item added to cart successfully!");
      }
      if (event.stock > 0 && event.stock <= 5) {
        showToast("info", "Low Stock", `Only ${event.stock} items left in stock!`);
      }
    }
  };

  const getShopUrl = (shop, shopId) => {
    const id = shopId?._id || shopId;
    if (shop && shop._id) {
      return shop.template === "growthplan"
        ? `/shop/growthplan/${shop._id}`
        : shop.template === "proplan"
        ? `/shop/proplan/${shop._id}`
        : `/shop/preview/${shop._id}`;
    }
    return id ? `/shop/preview/${id}` : "#";
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!event?.shopId || !shop?._id) {
        showToast("error", "Seller Error", "Seller information is unavailable.");
        return;
      }
      const groupTitle = event._id + user._id;
      const userId = user._id;
      const sellerId = shop._id;
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
      navigate(`/products?category=${category._id}`);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const descriptionLimit = 100;
  const isDescriptionLong = event?.description && event.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? event.description.slice(0, descriptionLimit) + "..."
    : event?.description;

  if (loading) {
    return <div className="w-[90%] mx-auto py-5">Loading...</div>;
  }

  if (!event) {
    return <div className="w-[90%] mx-auto py-5">Event not found</div>;
  }

  return (
    <ErrorBoundary>
      <div className="bg-white">
        <Header2 />
        <div className="w-[90%] mx-auto py-5 mt-10">
          <div className="flex flex-col md:flex-row">
            {/* Event Image Section */}
            <div className="w-full md:w-1/2 relative">
              <img
                src={getImageUrl(event.images[select]?.url)}
                alt={event.name || "Event image"}
                className="w-full md:w-[650px] h-64 md:h-[600px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
              />
              <div className="relative md:absolute md:top-[-28rem] w-full md:w-[650px] flex justify-center mx-auto md:mx-0 mt-4 md:mt-0">
                <div className="flex items-center space-x-1 md:space-x-4">
                  {[...Array(event.images.length)].map((_, i) => (
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
                {event.images.map((i, index) => (
                  <div key={index} className="cursor-pointer mx-1 md:mx-2">
                    <img
                      src={getImageUrl(i?.url)}
                      alt={`Thumbnail ${index}`}
                      className="w-20 h-16 md:w-[140px] md:h-[100px] object-cover border-2 border-white rounded-lg"
                      onClick={() => setSelect(index)}
                    />
                  </div>
                ))}
              </div>
              {/* Seller Info and Message */}
              <div className="mt-6 md:mt-10 w-full md:w-3/4 mx-auto md:mx-0">
                <div className="bg-white border border-[#B4B4B4] rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                      <Link to={getShopUrl(shop, event?.shopId)}>
                        <img
                          src={getImageUrl(shop?.avatar?.url || "/Uploads/avatar/avatar-1754729528346-341457281.jpg")}
                          alt={shop?.name || "Shop"}
                          className="w-[50px] h-[50px] rounded-full mr-3 object-cover flex-shrink-0"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={getShopUrl(shop, event?.shopId)}>
                          <h3 className={`${styles.shop_name} truncate`}>{shop?.name || event?.shopName || "Unknown Shop"}</h3>
                        </Link>
                        <div className="flex mt-1">
                          <Ratings rating={event?.ratings} />
                        </div>
                      <p className="text-sm text-[#CC9A00] mt-1 bg-[#FFF6DB] px-2 py-1 rounded-full truncate">{totalOrders} Successful Orders</p>
                      </div>
                    </div>
                    <button
                      className="text-[#CC9A00] bg-[#FFF6DB] py-2 px-4 rounded-[16px] border border-[#CC9A00] hover:bg-yellow-100 w-full md:w-auto flex items-center justify-center"
                      onClick={handleMessageSubmit}
                      disabled={!shop && !event?.shopId}
                    >
                      Send Message <AiOutlineMessage className="ml-1 inline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
              {/* Category Display */}
              {category && (
                <button
                  onClick={handleCategoryClick}
                  className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-full md:w-fit hover:bg-gray-200 cursor-pointer text-left md:text-left"
                >
                  <p className="text-sm">{category.title || "Unknown Category"}</p>
                </button>
              )}
              <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                {event.name || "Unnamed Event"}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start mt-2 gap-2 sm:gap-0 md:ml-0">
                <div className="flex items-center">
                  <h4 className={`${styles.productDiscountPrice}`}>
                    {event.discountPrice ? `${event.discountPrice} Birr` : "N/A"}
                  </h4>
                  {event.originalPrice && (
                    <h3 className={`${styles.price} ml-2`}>{event.originalPrice} Birr</h3>
                  )}
                </div>
                <div className="sm:ml-5 md:ml-20">
                  <Ratings rating={event?.ratings} />
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <label className="text-gray-800 font-light block mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2 md:space-x-2">
                  {event.sizes && Array.isArray(event.sizes) && event.sizes.length > 0 ? (
                    event.sizes.map((size) => (
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

              {/* Color Selection */}
              <div className="mt-6">
                <label className="text-gray-800 font-light block mb-2">Select Color</label>
                <div className="flex flex-wrap gap-2 md:space-x-2">
                  {event.colors && Array.isArray(event.colors) && event.colors.length > 0 ? (
                    event.colors.map((color) => (
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

              {/* Quantity, Add to Cart, and Wishlist */}
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
                    className="bg-[#CC9A00] text-white py-2 px-6 md:px-10 rounded-[16px] flex items-center justify-center hover:bg-yellow-500 flex-grow md:flex-none text-sm md:text-base"
                    onClick={() => addToCartHandler(event._id)}
                    disabled={event.status !== "Running" || new Date(event.Finish_Date) < new Date()}
                  >
                    <AiOutlineShoppingCart className="mr-2" /> Add to Cart
                  </button>
                  <div className="relative flex-shrink-0">
                    {click ? (
                      <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                        <AiFillHeart
                          size={24}
                          className="cursor-pointer"
                          onClick={() => removeFromWishlistHandler(event)}
                          color={click ? "red" : "#333"}
                          title="Remove from wishlist"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                        <AiOutlineHeart
                          size={24}
                          className="cursor-pointer"
                          onClick={() => addToWishlistHandler(event)}
                          color={click ? "red" : "#333"}
                          title="Add to wishlist"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 p-4 border border-[#525252] rounded-lg w-full md:w-3/4">
                <p className="text-gray-600">
                  {isDescriptionExpanded ? event.description : truncatedDescription || "No description available"}
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

              {/* Countdown Timer with Peacock Design */}
              <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 w-full md:w-[30rem] flex flex-col md:flex-row md:items-center md:justify-between">
                <img
                  src={peac}
                  alt="Peacock Offer"
                  className="w-12 h-12 mx-auto md:ml-20 md:mx-0 object-contain"
                />
                <div className="bg-white border border-[#263238] rounded-lg p-2 w-[10rem] mx-auto md:mx-0 text-center mt-2 md:mt-0 md:ml-[-6rem] md:bg-transparent md:border-0 md:p-0">
                  <p className="text-[#263238] text-sm font-light">Don't miss this event</p>
                </div>
                <p className="text-lg flex-grow text-center mt-2 md:mt-0">14 days 14 hr 45 min 44 sec</p>
              </div>
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
    </ErrorBoundary>
  );
};

export default EventDetails;