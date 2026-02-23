import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart,AiOutlineEdit } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; // Adjust path to your custom Toast component
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider, Modal } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import styles from "../../styles/styles";
import Ratings from "../Products/Ratings";
import peacImg from "../../Assests/images/peac.png";
import DeleteModal from "../DeleteModal"; // Import the DeleteModal component

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state for DeleteModal
  const [deleteEventId, setDeleteEventId] = useState(null); // New state for event ID to delete
  const [showStockOverlay, setShowStockOverlay] = useState(false);
  const [stockEventId, setStockEventId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const itemsPerPage = 5;
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Custom theme for Material-UI components
  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

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
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${server}/event/admin-all-events`, { withCredentials: true });
        // Sort events by createdAt in descending order (LIFO)
        const sortedEvents = (res.data.events || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setEvents(sortedEvents);
      } catch (error) {
        showToast("error", "Fetch Failed", error.response?.data?.message || "Failed to fetch events.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (wishlist && selectedEvent && wishlist.find((i) => i._id === selectedEvent._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, selectedEvent]);

  const handleDelete = (id) => {
    // Open the delete confirmation modal instead of directly deleting
    setDeleteEventId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${server}/event/admin-delete-event/${deleteEventId}`, { withCredentials: true });
      showToast("success", "Event Deleted", "Event deleted successfully!");
      setEvents((prev) => prev.filter((event) => event._id !== deleteEventId));
      setShowDeleteModal(false);
      setDeleteEventId(null);
    } catch (error) {
      showToast("error", "Delete Failed", error.response?.data?.message || "Failed to delete event.");
      setShowDeleteModal(false);
      setDeleteEventId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteEventId(null);
  };

const handleOpenStockOverlay = (eventId) => {
  setStockEventId(eventId);
  setShowStockOverlay(true);
  setNewStock("");
};

const handleCloseStockOverlay = () => {
  setShowStockOverlay(false);
  setStockEventId(null);
  setNewStock("");
};

const handleSaveStock = async () => {
  if (!newStock || isNaN(newStock) || Number(newStock) < 0) {
    showToast("error", "Invalid Input", "Please enter a valid stock value.");
    return;
  }

  try {
    await axios.put(
      `${server}/event/admin-update-stock/${stockEventId}`,
      { stock: Number(newStock) },
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );

    showToast("success", "Stock Updated", "Stock updated successfully!");

    setEvents((prev) =>
      prev.map((event) =>
        event._id === stockEventId ? { ...event, stock: Number(newStock) } : event
      )
    );

    handleCloseStockOverlay();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      showToast("error", "Authentication Required", "Login to continue");
    } else {
      showToast(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to update stock."
      );
    }
  }
};

  const handleDetailsOpen = async (event) => {
    setSelectedEvent(event);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
    setShowDetailsModal(true);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const incrementCount = () => {
    if (selectedEvent && count < selectedEvent.stock) {
      setCount(count + 1);
    } else if (selectedEvent) {
      showToast("error", "Stock Limit Reached", `Maximum stock limit reached: ${selectedEvent.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      showToast("error", "Item Exists", "Item already in cart!");
    } else if (selectedEvent) {
      if (selectedEvent.stock < 1) {
        showToast("error", "Out of Stock", "Event stock limited!");
      } else if (selectedEvent.status !== "Running" || new Date(selectedEvent.Finish_Date) < new Date()) {
        showToast("error", "Unavailable", "Event is not available for purchase!");
      } else {
        const cartData = {
          ...selectedEvent,
          qty: count,
          selectedSize,
          selectedColor,
          shopId: selectedEvent.shopId?._id || selectedEvent.shopId,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Added to Cart", "Item added to cart successfully!");
      }
      if (selectedEvent.stock > 0 && selectedEvent.stock <= 5) {
        showToast("warn", "Low Stock", `Only ${selectedEvent.stock} items left in stock!`);
      }
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

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!selectedEvent?.shopId) {
        showToast("error", "Seller Info Missing", "Seller information is unavailable.");
        return;
      }
      const groupTitle = selectedEvent._id + user._id;
      const userId = user._id;
      const sellerId = selectedEvent.shopId?._id || selectedEvent.shopId;
      try {
        const res = await axios.post(
          `${server}/conversation/create-new-conversation`,
          { groupTitle, userId, sellerId },
          { withCredentials: true }
        );
        navigate(`/inbox?${res.data.conversation._id}`);
      } catch (error) {
        showToast("error", "Conversation Failed", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Login Required", "Please login to create a conversation");
    }
  };

  const getShopUrl = (shopId) => {
    return shopId ? `/shop/preview/${shopId._id || shopId}` : "#";
  };

  const getCategoryName = (categoryId) => {
    // Note: Category data isn't available in the provided context, so we'll use the event's category field directly
    return categoryId || "Unknown Category";
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.name?.toLowerCase().includes(searchLower) ||
          item._id?.toLowerCase().includes(searchLower);
        const matchesFilter = !isFiltered || item.category;
        return matchesSearch && matchesFilter;
      })
    : [];

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const discountPercent = selectedEvent?.originalPrice && selectedEvent?.originalPrice > selectedEvent?.discountPrice
    ? Math.round(((selectedEvent.originalPrice - selectedEvent.discountPrice) / selectedEvent.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedEvent?.description && selectedEvent.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedEvent.description.slice(0, descriptionLimit) + "..."
    : selectedEvent?.description;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-gray-100">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1C3B3E]">All Events</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm"
                  />
                  <AiOutlineSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
                {/* <button
                  onClick={handleFilterToggle}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-[#1C3B3E] bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CC9A00]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Filter
                </button> */}
              </div>
            </div>
            {filteredEvents.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-[#1C3B3E]">No events found matching your search.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[40px]">Event ID</th>
                          <th className="py-2 px-4 text-left font-medium">Event</th>
                          <th className="py-2 px-4 text-left font-medium">Price</th>
                          <th className="py-2 px-4 text-left font-medium">Stock</th>
                          <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentEvents.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-[#1C3B3E] w-[40px] max-w-[100px] truncate"
                              title={item._id}
                            >
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              <div className="flex items-center gap-2">
                                {item.images && item.images[0] && (
                                  <img
                                    src={item.images[0].url.startsWith('http') ? item.images[0].url : `${backend_url}${item.images[0].url}`}
                                    alt={item.name}
                                    className="h-12 w-12 object-cover rounded"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/Uploads/placeholder-image.jpg";
                                    }}
                                  />
                                )}
                                <span>{item.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              {item.discountPrice ? `${item.discountPrice} ETB` : "N/A"}
                            </td>
                        <td className="py-3 px-4 text-[#1C3B3E]">
  {item.stock === 0 || item.stock == null ? (
    <button
      className="bg-[#CC9A00] text-white px-3 py-1 rounded-full text-xs hover:bg-[#FFD700] transition"
      onClick={() => handleOpenStockOverlay(item._id)}
    >
      Enter Stock
    </button>
  ) : (
    item.stock
  )}
</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleDetailsOpen(item)}>
                                  <AiOutlineEye
                                    size={20}
                                    className="text-gray-600 hover:text-[#CC9A00] cursor-pointer"
                                    title="View Details"
                                  />
                                </button>
                                <button onClick={() => handleDelete(item._id)}>
                                  <AiOutlineDelete
                                    size={20}
                                    className="text-gray-600 hover:text-red-500 cursor-pointer"
                                    title="Delete Event"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ThemeProvider>
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredEvents.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
                {showStockOverlay && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] flex flex-col items-center">
                      <h4 className="text-lg font-semibold mb-4 text-[#1C3B3E]">Enter Stock</h4>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E]"
                        placeholder="Enter stock value"
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-[#CC9A00] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#FFD700] transition"
                          onClick={handleSaveStock}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-200 text-[#1C3B3E] px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
                          onClick={handleCloseStockOverlay}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Render DeleteModal */}
                <DeleteModal
                  open={showDeleteModal}
                  onClose={handleCloseDeleteModal}
                  onConfirm={confirmDelete}
                  title="Delete Event?"
                  description="This action cannot be undone. Are you sure you want to delete this event?"
                />
              </>
            )}
          </div>

          {/* Event Details Modal */}
          <Modal open={showDetailsModal} onClose={handleDetailsClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
              <div className="bg-white w-full max-w-8xl h-[100vh] mt-10 overflow-y-auto relative rounded-2xl shadow-2xl p-6">
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={handleDetailsClose}
                >
                  <AiOutlineClose size={20} />
                </button>
                {selectedEvent && (
                  <div className="w-[90%] mx-auto py-5">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2">
                        <img
                          src={
                            selectedEvent.images[detailsImageIdx]?.url
                              ? selectedEvent.images[detailsImageIdx].url.startsWith('http')
                                ? selectedEvent.images[detailsImageIdx].url
                                : `${backend_url}${selectedEvent.images[detailsImageIdx].url}`
                              : "https://via.placeholder.com/650"
                          }
                          alt={selectedEvent.name || "Event image"}
                          className="w-[550px] h-[500px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/Uploads/placeholder-image.jpg";
                          }}
                        />
                        <div className="relative">
                          <div className="absolute top-[-25rem] w-[550px] flex justify-center">
                            <div className="flex items-center space-x-4">
                              {[...Array(selectedEvent.images.length)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 rounded-full ${
                                    detailsImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                                  }`}
                                  onClick={() => setDetailsImageIdx(i)}
                                  style={{ width: "100px", height: "4px", borderRadius: "2px" }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-center mt-[-5rem]">
                            {selectedEvent.images.map((i, index) => (
                              <div
                                key={index}
                                className={`cursor-pointer mx-2 ${detailsImageIdx === index ? "" : ""}`}
                              >
                                <img
                                  src={
                                    i?.url
                                      ? i.url.startsWith('http')
                                        ? i.url
                                        : `${backend_url}${i.url}`
                                      : "https://via.placeholder.com/140x100"
                                  }
                                  alt={`Thumbnail ${index}`}
                                  className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                                  onClick={() => setDetailsImageIdx(index)}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/Uploads/placeholder-image.jpg";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-10">
                          <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Link to={getShopUrl(selectedEvent.shopId)}>
                                  <img
                                    src={
                                      selectedEvent.shopId?.avatar?.url
                                        ? selectedEvent.shopId.avatar.url.startsWith('http')
                                          ? selectedEvent.shopId.avatar.url
                                          : `${backend_url}${selectedEvent.shopId.avatar.url}`
                                        : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                    }
                                    alt={selectedEvent.shopName || "Shop"}
                                    className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/Uploads/avatar/avatar-1754729528346-341457281.jpg";
                                    }}
                                  />
                                </Link>
                                <div>
                                  <Link to={getShopUrl(selectedEvent.shopId)}>
                                    <h3 className={`${styles.shop_name}`}>
                                      {selectedEvent.shopName || "Unknown Shop"}
                                    </h3>
                                  </Link>
                                  <div className="flex mt-1">
                                    <Ratings rating={selectedEvent?.ratings || 0} />
                                  </div>
                                </div>
                              </div>
                              {/* <button
                                className="text-[#CC9A00] border-2 border-[#CC9A00] py-2 px-4 rounded-full hover:bg-gray-100 bg-transparent"
                                onClick={handleMessageSubmit}
                              >
                                Send Message <AiOutlineMessage className="ml-1 inline" />
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                        <button
                          onClick={() => navigate(`/products?category=${selectedEvent.category}`)}
                          className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                        >
                          <p className="text-sm">{getCategoryName(selectedEvent.category)}</p>
                        </button>
                        <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                          {selectedEvent.name || "Unnamed Event"}
                        </h1>
                        <div className="flex items-center justify-start mt-2">
                          <div className="flex items-center">
                            <h4 className={`${styles.productDiscountPrice}`}>
                              {selectedEvent.discountPrice
                                ? `${selectedEvent.discountPrice} Birr`
                                : "N/A"}
                            </h4>
                            {selectedEvent.originalPrice && (
                              <h3 className={`${styles.price} ml-2`}>
                                {selectedEvent.originalPrice} Birr
                              </h3>
                            )}
                          </div>
                          <div className="ml-20">
                            <Ratings rating={selectedEvent?.ratings || 0} />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Select Size</label>
                          <div className="flex space-x-2 mt-2">
                            {selectedEvent.sizes &&
                            Array.isArray(selectedEvent.sizes) &&
                            selectedEvent.sizes.length > 0 ? (
                              selectedEvent.sizes.map((size) => (
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
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Select Color</label>
                          <div className="flex space-x-2 mt-2">
                            {selectedEvent.colors &&
                            Array.isArray(selectedEvent.colors) &&
                            selectedEvent.colors.length > 0 ? (
                              selectedEvent.colors.map((color) => (
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
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Stock</label>
                          <p className="text-gray-800 mt-2">
                            {selectedEvent.stock === undefined || selectedEvent.stock === null
                              ? "Not set"
                              : selectedEvent.stock}
                          </p>
                        </div>
                        <div className="mt-6 p-4 border border-[#525252] rounded-lg w-3/4">
                          <p className="text-gray-600">
                            {isDescriptionExpanded
                              ? selectedEvent.description
                              : truncatedDescription || "No description available"}
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
                        <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-4 flex items-center w-3/4">
                          <img
                            src={peacImg}
                            alt="Offer"
                            className="w-10 h-10 mr-3 object-contain"
                          />
                          <p className="text-sm font-semibold">
                            {discountPercent
                              ? `Save ${discountPercent}% today. Limited time offer!`
                              : "Great Value! Limited time offer!"}
                          </p>
                        </div> 
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default AllEvents;