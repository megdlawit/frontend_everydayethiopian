import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose, AiOutlineShoppingCart, AiFillHeart, AiOutlineHeart, AiOutlineMessage } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllEventsShop, deleteEvent, updateEvent } from "../../redux/actions/event";
import { addTocart } from "../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import Loader from "../Layout/Loader";
import { Button, Modal, Input, createTheme, ThemeProvider } from "@material-ui/core";
import axios from "axios";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; 
import Pagination from "../Pagination";
import CreateEvent from "./CreateEvent";
import DeleteModal from "../DeleteModal"; 
import peacImg from "../../Assests/images/peac.png";
import { server, backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";

const AllEvents = () => {
  const { events, isLoading, success, error } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    images: [],
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    startDate: "",
    finishDate: "",
    sizes: [],
    colors: [],
  });
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const itemsPerPage = 5;

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

  useEffect(() => {
    if (seller?._id) {
      if (/^[0-9a-fA-F]{24}$/.test(seller._id)) {
        dispatch(getAllEventsShop(seller._id));
      } else {
        console.error("Invalid seller ID:", seller._id);
        showToast("error", "Error", "Invalid shop ID. Please try again.");
      }
    } else {
      console.error("Seller ID is undefined");
      showToast("error", "Error", "Shop ID is not available. Please log in again.");
    }
  }, [dispatch, seller?._id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${server}/category/get-all-categories`);
        if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
          showToast("error", "Error", "No categories found or invalid response format.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        showToast("error", "Error", "Failed to fetch categories. Please try again later.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
      dispatch({ type: "clearErrors" });
    }
    if (success) {
      showToast("success", "Success", "Event updated successfully!");
      dispatch({ type: "clearSuccess" });
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (wishlist && selectedEvent && wishlist.find((i) => i._id === selectedEvent._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, selectedEvent]);

  const handleOpen = (event) => {
    if (event && event._id) {
      setSelectedEvent(event);
      setFormData({
        name: event.name || "",
        description: event.description || "",
        category: event.category || "",
        tags: event.tags || "",
        originalPrice: event.originalPrice || "",
        discountPrice: event.discountPrice || "",
        startDate: event.start_Date ? new Date(event.start_Date).toISOString().split('T')[0] : "",
        finishDate: event.Finish_Date ? new Date(event.Finish_Date).toISOString().split('T')[0] : "",
        sizes: Array.isArray(event.sizes) ? event.sizes : [],
        colors: Array.isArray(event.colors) ? event.colors : [],
        images: event.images ? event.images.map(img => img.url) : [],
      });
      setMainImageIdx(0);
      setStep(1);
      setOpen(true);
    } else {
      console.error("Event object does not contain id:", event);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      images: [],
      name: "",
      description: "",
      category: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      startDate: "",
      finishDate: "",
      sizes: [],
      colors: [],
    });
    setStep(1);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const handleDetailsOpen = (event) => {
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

  const handleDelete = (id) => {
    setDeleteEventId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteEvent(deleteEventId));
      await dispatch(getAllEventsShop(seller?._id));
      showToast("success", "Success", "Event deleted successfully!");
      setShowDeleteModal(false);
      setDeleteEventId(null);
    } catch (error) {
      showToast("error", "Error", error.message || "Failed to delete event.");
      setShowDeleteModal(false);
      setDeleteEventId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteEventId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.category || !formData.discountPrice || !formData.startDate || !formData.finishDate || formData.images.length === 0) {
      showToast("error", "Error", "Please fill all required fields and upload images.");
      return;
    }

    const updatedFormData = new FormData();
    formData.images.forEach((image) => {
      if (typeof image === "string") {
        updatedFormData.append("existingImages", image);
      } else {
        updatedFormData.append("images", image);
      }
    });
    updatedFormData.append("name", formData.name);
    updatedFormData.append("description", formData.description);
    updatedFormData.append("category", formData.category);
    updatedFormData.append("tags", formData.tags);
    updatedFormData.append("originalPrice", formData.originalPrice || 0);
    updatedFormData.append("discountPrice", formData.discountPrice);
    updatedFormData.append("start_Date", formData.startDate);
    updatedFormData.append("Finish_Date", formData.finishDate);
    updatedFormData.append("sizes", JSON.stringify(formData.sizes));
    updatedFormData.append("colors", JSON.stringify(formData.colors));
    updatedFormData.append("shopId", seller._id);

    try {
      await dispatch(updateEvent(selectedEvent._id, updatedFormData));
      handleClose();
      dispatch(getAllEventsShop(seller._id));
      showToast("success", "Success", "Event updated successfully!");
    } catch (error) {
      console.error('Error updating event:', error);
      showToast("error", "Error", error.message || "Failed to update event.");
    }
  };

  const handleImageChange = (e, index = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormData((prev) => {
      const newImages = [...prev.images];
      if (index !== null) {
        if (files[0]) {
          newImages[index] = files[0];
        }
      } else {
        const availableSlots = 10 - newImages.length;
        const imagesToAdd = files.slice(0, availableSlots);
        newImages.push(...imagesToAdd);
      }
      return { ...prev, images: newImages };
    });
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      showToast("error", "Error", "Item already in cart!");
    } else if (selectedEvent) {
      if (selectedEvent.stock < 1) {
        showToast("error", "Error", "Event stock limited!");
      } else if (selectedEvent.status !== "Running" || new Date(selectedEvent.Finish_Date) < new Date()) {
        showToast("error", "Error", "Event is not available for purchase!");
      } else {
        const cartData = {
          ...selectedEvent,
          qty: count,
          selectedSize,
          selectedColor,
          shopId: selectedEvent.shopId?._id || selectedEvent.shopId,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Success", "Item added to cart successfully!");
      }
      if (selectedEvent.stock > 0 && selectedEvent.stock <= 5) {
        showToast("info", "Info", `Only ${selectedEvent.stock} items left in stock!`);
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
        showToast("error", "Error", "Seller information is unavailable.");
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
        showToast("error", "Error", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Error", "Please login to create a conversation");
    }
  };

  const getShopUrl = (shopId) => {
    return shopId ? `/shop/preview/${shopId._id || shopId}` : "#";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.title : "Unknown Category";
  };

  const filteredEvents = events ? events.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || item._id.toLowerCase().includes(searchLower);
    const matchesFilter = !isFiltered || item.category;
    return matchesSearch && matchesFilter;
  }) : [];

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const toggleCreate = () => setIsCreateOpen(!isCreateOpen);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const addCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, customSize] });
      setCustomSize("");
      setShowCustomSizeInput(false);
    }
  };

  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData({ ...formData, colors: [...formData.colors, customColor] });
      setCustomColor("");
      setShowCustomColorInput(false);
    }
  };

  const toggleSelection = (item, array) => {
    setFormData((prev) => ({
      ...prev,
      [array]: prev[array].includes(item) ? prev[array].filter((i) => i !== item) : [...prev[array], item]
    }));
  };

  const incrementCount = () => {
    if (selectedEvent && count < selectedEvent.stock) {
      setCount(count + 1);
    } else if (selectedEvent) {
      showToast("error", "Error", `Maximum stock limit reached: ${selectedEvent.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const discountPercent = selectedEvent?.originalPrice && selectedEvent?.originalPrice > selectedEvent?.discountPrice
    ? Math.round(((selectedEvent.originalPrice - selectedEvent.discountPrice) / selectedEvent.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedEvent?.description && selectedEvent.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedEvent.description.slice(0, descriptionLimit) + "..."
    : selectedEvent?.description;

  // Mobile Card Component
  const EventCard = ({ event }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {event.images && event.images[0] && (
            <img
              src={event.images[0].url.startsWith('http') ? event.images[0].url : `${backend_url}${event.images[0].url}`}
              alt={event.name}
              className="h-16 w-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Uploads/placeholder-image.jpg";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{event.name}</h3>
            <p className="text-xs text-gray-500 mt-1">ID: {event._id.slice(-8)}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-900">{event.discountPrice} br</span>
              <span className="text-sm text-gray-600">Stock: {event.stock}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500">
          Dates: {event.start_Date ? new Date(event.start_Date).toLocaleDateString() : "N/A"} - {event.Finish_Date ? new Date(event.Finish_Date).toLocaleDateString() : "N/A"}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleDetailsOpen(event)}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <AiOutlineEye size={18} />
          </button>
          <button 
            onClick={() => handleOpen(event)}
            className="p-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <AiOutlineEdit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(event._id)}
            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <AiOutlineDelete size={18} />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Category: {getCategoryName(event.category)}
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-2 md:mx-8 pt-1 mt-4 md:mt-10 bg-white font-avenir">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-md">
            {/* Header Section - Responsive */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                  <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
                
                {/* Filter and Create Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleFilterToggle}
                    className={`flex items-center gap-2 px-4 py-2 border ${isFiltered ? 'border-[#FFC300] bg-[#FFF5CC] text-[#FFC300]' : 'border-gray-200 text-gray-700 bg-white'} rounded-lg hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                    </svg>
                    Filter
                  </button>
                  <button
                    onClick={toggleCreate}
                    className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center"
                  >
                    <AiOutlinePlusCircle size={16} />
                    Create Event
                  </button>
                </div>
              </div>
            </div>

            {/* Events List - Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {currentEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No events found matching your criteria.
                  </div>
                ) : (
                  currentEvents.map((item) => (
                    <EventCard key={item._id} event={item} />
                  ))
                )}
              </div>
            ) : (
              /* Desktop Table */
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
                      {currentEvents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-gray-500">
                            No events found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        currentEvents.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate" title={item._id}>
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <div className="flex items-center gap:2">
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
                                <span className="ml-2">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.discountPrice} br</td>
                            <td className="py-3 px-4 text-gray-700">{item.stock}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleDetailsOpen(item)}>
                                  <AiOutlineEye size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
                                </button>
                                <button onClick={() => handleOpen(item)}>
                                  <AiOutlineEdit size={20} className="text-gray-600 hover:text-green-500 cursor-pointer" />
                                </button>
                                <button onClick={() => handleDelete(item._id)}>
                                  <AiOutlineDelete size={20} className="text-gray-600 hover:text-red-500 cursor-pointer" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </ThemeProvider>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
              <DeleteModal
                open={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDelete}
                title="Delete Event?"
                description="This action cannot be undone. Are you sure you want to delete this event?"
              />
            </div>
          </div>

          {/* Event Details Modal - Responsive */}
          <Modal open={showDetailsModal} onClose={handleDetailsClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
              <div className={`bg-white w-full max-w-8xl ${isMobile ? 'h-[95vh] mt-2 rounded-2xl' : 'h-[100vh] mt-10'} overflow-y-auto relative shadow-2xl p-4 md:p-6`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
                  onClick={handleDetailsClose}
                >
                  <AiOutlineClose size={20} />
                </button>
                {selectedEvent && (
                  <div className={`w-full ${isMobile ? 'py-2' : 'md:w-[90%] mx-auto py-4 md:py-5'}`}>
                    <div className={`${isMobile ? 'flex flex-col' : 'flex flex-col lg:flex-row'}`}>
                      {/* Event Images */}
                      <div className={`${isMobile ? 'w-full mb-4' : 'w-full lg:w-1/2 mb-6 lg:mb-0'}`}>
                        <img
                          src={
                            selectedEvent.images[detailsImageIdx]?.url
                              ? selectedEvent.images[detailsImageIdx].url.startsWith('http')
                                ? selectedEvent.images[detailsImageIdx].url
                                : `${backend_url}${selectedEvent.images[detailsImageIdx].url}`
                              : "https://via.placeholder.com/650"
                          }
                          alt={selectedEvent.name || "Event image"}
                          className={`${isMobile ? 'w-full h-[250px]' : 'w-full max-w-[500px] h-[300px] md:h-[400px] lg:h-[500px] mx-auto'} border-2 border-white rounded-lg object-cover`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/Uploads/placeholder-image.jpg";
                          }}
                        />
                        <div className="relative mt-4">
                          <div className={`flex justify-center ${isMobile ? '-mt-6' : '-mt-8 md:-mt-12 lg:-mt-20'}`}>
                            <div className="flex items-center space-x-2 md:space-x-4 bg-black bg-opacity-50 rounded-full px-3 py-2">
                              {[...Array(selectedEvent.images.length)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`${isMobile ? 'h-1.5' : 'h-1.5 md:h-2'} rounded-full cursor-pointer ${
                                    detailsImageIdx === i ? "bg-[#CC9A00]" : "bg-white"
                                  }`}
                                  onClick={() => setDetailsImageIdx(i)}
                                  style={{ width: isMobile ? "30px" : "40px" }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className={`flex justify-center mt-4 ${isMobile ? 'space-x-1' : 'space-x-2 md:space-x-4'}`}>
                            {selectedEvent.images.map((i, index) => (
                              <div
                                key={index}
                                className="cursor-pointer"
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
                                  className={`${isMobile ? 'w-12 h-10' : 'w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16'} object-cover border-2 border-white rounded-lg`}
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
                        
                        {/* Shop Info */}
                        <div className={`${isMobile ? 'mt-4' : 'mt-6 md:mt-10'}`}>
                          <div className={`bg-white border border-[#B4B4B4] rounded-lg p-4 w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
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
                                    className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} rounded-full mr-3 object-cover`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/Uploads/avatar/avatar-1754729528346-341457281.jpg";
                                    }}
                                  />
                                </Link>
                                <div>
                                  <Link to={getShopUrl(selectedEvent.shopId)}>
                                    <h3 className={`${styles.shop_name} ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                                      {selectedEvent.shopName || "Unknown Shop"}
                                    </h3>
                                  </Link>
                                  <div className="flex mt-1">
                                    <Ratings rating={selectedEvent?.ratings || 0} />
                                  </div>
                                </div>
                              </div>
                              <button
                                className={`text-[#CC9A00] border-2 border-[#CC9A00] py-2 px-3 ${isMobile ? 'text-xs' : 'md:px-4 text-sm'} rounded-full hover:bg-gray-100 bg-transparent`}
                                onClick={handleMessageSubmit}
                              >
                                Send Message <AiOutlineMessage className="ml-1 inline" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className={`${isMobile ? 'w-full mt-4' : 'w-full lg:w-1/2 lg:pl-6'}`}>
                        <button
                          onClick={() => navigate(`/products?category=${selectedEvent.category}`)}
                          className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
                        >
                          {getCategoryName(selectedEvent.category)}
                        </button>
                        <h1 className={`${styles.productTitle} ${isMobile ? 'text-lg' : 'text-xl md:text-2xl lg:text-3xl'}`} style={{ color: "#1c3b3c" }}>
                          {selectedEvent.name || "Unnamed Event"}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center">
                            <h4 className={`${styles.productDiscountPrice} ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
                              {selectedEvent.discountPrice
                                ? `${selectedEvent.discountPrice} Birr`
                                : "N/A"}
                            </h4>
                            {selectedEvent.originalPrice && (
                              <h3 className={`${styles.price} ml-2 ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                                {selectedEvent.originalPrice} Birr
                              </h3>
                            )}
                          </div>
                          <div>
                            <Ratings rating={selectedEvent?.ratings || 0} />
                          </div>
                        </div>

                        {/* Event Dates */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Event Dates</label>
                          <p className="text-gray-800 mt-2">
                            {selectedEvent.start_Date ? new Date(selectedEvent.start_Date).toLocaleDateString() : "N/A"} 
                            {" - "}
                            {selectedEvent.Finish_Date ? new Date(selectedEvent.Finish_Date).toLocaleDateString() : "N/A"}
                          </p>
                        </div>

                        {/* Size Selection */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Select Size</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedEvent.sizes &&
                            Array.isArray(selectedEvent.sizes) &&
                            selectedEvent.sizes.length > 0 ? (
                              selectedEvent.sizes.map((size) => (
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
                              <p className="text-gray-500 text-sm">No sizes available</p>
                            )}
                          </div>
                        </div>

                        {/* Color Selection */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Select Color</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedEvent.colors &&
                            Array.isArray(selectedEvent.colors) &&
                            selectedEvent.colors.length > 0 ? (
                              selectedEvent.colors.map((color) => (
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
                              <p className="text-gray-500 text-sm">No colors available</p>
                            )}
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Stock</label>
                          <p className="text-gray-800 mt-2">
                            {selectedEvent.stock === undefined || selectedEvent.stock === null
                              ? "Not set"
                              : selectedEvent.stock}
                          </p>
                        </div>

                        {/* Description */}
                        <div className={`mt-4 md:mt-6 p-4 border border-[#525252] rounded-lg w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                          <p className="text-gray-600 text-sm md:text-base">
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

                        {/* Offer Banner */}
                        <div className={`mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 ${isMobile ? '' : 'md:p-4'} flex items-center w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                          <img
                            src={peacImg}
                            alt="Offer"
                            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'} mr-3 object-contain`}
                          />
                          <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} font-semibold`}>
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

          {/* Edit Event Modal - Responsive */}
          <Modal open={open} onClose={handleClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-0">
              <div className={`bg-white ${isMobile ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={handleClose}
                >
                  <AiOutlineClose />
                </button>
                <div className="text-center my-4">
                  <img src={peacImg} alt="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
                  <div className={`${isMobile ? 'w-3/4' : 'w-1/2'} mx-auto bg-gray-100 rounded-full h-2.5`}>
                    <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 8) * 100}%` }}></div>
                  </div>
                  <p className="text-gray-500 text-sm">Step {step} of 8</p>
                </div>
                
                {step === 1 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-center font-['Quesha'] text-gray-800 mb-6`}>What's the name of your event?</h6>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
                      placeholder="Enter event name..."
                    />
                    <div className={`mt-4 flex justify-end ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>Choose a category for your event</h6>
                    <div className={`mt-4 grid ${isMobile ? 'grid-cols-2 gap-3 w-5/6' : 'grid-cols-4 gap-4 w-3/4'}`}>
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            formData.category === cat._id
                              ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                              : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                          } ${isMobile ? 'text-sm' : ''}`}
                          onClick={() => setFormData({ ...formData, category: cat._id })}
                        >
                          {cat.title}
                        </button>
                      ))}
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'min-h-[calc(85vh-150px)] mt-4' : 'min-h-[calc(85vh-200px)] mt-8'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-2`}>Select sizes and colors</h6>
                    <div className={`${isMobile ? 'w-5/6' : 'w-3/4 max-w-5xl'} flex flex-col items-center`}>
                      <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col ${isMobile ? '' : 'ml-[8rem]'}`}>
                        <div className={`flex ${isMobile ? 'flex-col' : 'w-full'}`}>
                          <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Sizes:</label>
                          <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                            {["Small", "Medium", "Large", "ExtraLarge"].map((size) => (
                              <button
                                key={size}
                                className={`px-4 py-2 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
                                  formData.sizes.includes(size)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(size, "sizes")}
                              >
                                {size}
                              </button>
                            ))}
                            {formData.sizes
                              .filter((size) => !["Small", "Medium", "Large", "ExtraLarge"].includes(size))
                              .map((size) => (
                                <button
                                  key={size}
                                  className={`px-4 py-2 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                                  onClick={() => toggleSelection(size, "sizes")}
                                >
                                  {size}
                                </button>
                              ))}
                          </div>
                        </div>
                        {showCustomSizeInput && (
                          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} mt-2 w-full justify-start ${isMobile ? 'pl-0' : 'pl-[25%]'}`}>
                            <input
                              type="text"
                              value={customSize}
                              onChange={(e) => setCustomSize(e.target.value)}
                              placeholder="Custom size..."
                              className="px-4 py-2 rounded-full border border-gray-100"
                            />
                            <button
                              onClick={addCustomSize}
                              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center"
                            >
                              <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
                            </button>
                          </div>
                        )}
                        {!showCustomSizeInput && (
                          <button
                            onClick={() => setShowCustomSizeInput(true)}
                            className={`mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center ${isMobile ? '' : 'ml-[25%]'}`}
                          >
                            <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
                          </button>
                        )}
                      </div>

                      <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col items-start ${isMobile ? '' : 'ml-[8rem]'}`}>
                        <div className={`flex ${isMobile ? 'flex-col' : 'items-start w-full'}`}>
                          <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Colors:</label>
                          <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                            {["White", "Gray", "Black", "Orange"].map((color) => (
                              <button
                                key={color}
                                className={`px-4 py-2 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
                                  formData.colors.includes(color)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(color, "colors")}
                              >
                                {color}
                              </button>
                            ))}
                            {formData.colors
                              .filter((color) => !["White", "Gray", "Black", "Orange"].includes(color))
                              .map((color) => (
                                <button
                                  key={color}
                                  className={`px-4 py-2 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                                  onClick={() => toggleSelection(color, "colors")}
                                >
                                  {color}
                                </button>
                              ))}
                          </div>
                        </div>
                        {showCustomColorInput && (
                          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} mt-2 w-full justify-start ${isMobile ? 'pl-0' : 'pl-[25%]'}`}>
                            <input
                              type="text"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              placeholder="Custom color..."
                              className="px-4 py-2 rounded-full border border-gray-300"
                            />
                            <button
                              onClick={addCustomColor}
                              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center"
                            >
                              <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                            </button>
                          </div>
                        )}
                        {!showCustomColorInput && (
                          <button
                            onClick={() => setShowCustomColorInput(true)}
                            className={`mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center ${isMobile ? '' : 'ml-[25%]'}`}
                          >
                            <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Set your pricing</h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <p className="text-gray-600 float-left">Original Price</p>
                      <div className={`flex flex-wrap justify-between mt-6 ${isMobile ? 'gap-1' : 'md:mt-10 gap-2'}`}>
                        {["800", "1000", "1500", "2000", "2500"].map((price) => (
                          <button
                            key={price}
                            className={`px-3 py-2 rounded-full border transition-all ${isMobile ? 'text-xs w-[calc(33%-0.25rem)] mb-2' : ''} ${
                              formData.originalPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setFormData({ ...formData, originalPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Custom price..."
                      />
                    </div>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <p className="text-gray-600 float-left">Discount Price</p>
                      <div className={`flex flex-wrap justify-between mt-6 ${isMobile ? 'gap-1' : 'md:mt-10 gap-2'}`}>
                        {["800", "1000", "1500", "2000", "2500"].map((price) => (
                          <button
                            key={price}
                            className={`px-3 py-2 rounded-full border transition-all ${isMobile ? 'text-xs w-[calc(33%-0.25rem)] mb-2' : ''} ${
                              formData.discountPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setFormData({ ...formData, discountPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Custom price..."
                      />
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Describe your event</h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-3/4'}`}>
                      <p className="text-gray-600 float-left">Description</p>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 block w-full h-40 px-4 md:px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                        placeholder="Enter description..."
                      />
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Upload event images</h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <input
                        type="file"
                        id="upload"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="upload"
                        className={`flex items-center justify-center w-full py-4 md:py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 ${formData.images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <AiOutlinePlusCircle size={isMobile ? 20 : 30} className="text-gray-600" />
                        <span className="ml-2 text-gray-600 text-sm md:text-base">Upload Images (Max 10)</span>
                      </label>
                      <div className="mt-4 flex gap-3 md:gap-4 justify-center flex-wrap">
                        {formData.images.map((image, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={typeof image === "string" ? (image.startsWith("http") ? image : `${backend_url}${image}`) : URL.createObjectURL(image)}
                              alt="preview"
                              className={`${isMobile ? 'h-[100px] w-[100px]' : 'h-[150px] w-[150px]'} object-cover rounded-lg border border-gray-300`}
                            />
                            <input
                              type="file"
                              id={`replace-${idx}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, idx)}
                            />
                            <label
                              htmlFor={`replace-${idx}`}
                              className="absolute bottom-2 right-2 bg-[#FFC300] text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-[#FFD700]"
                            >
                              Replace
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 7 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>Select start and end dates</h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <label className="block text-gray-600 mb-2 float-left w-full text-left">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full px-4 md:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      />
                    </div>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <label className="block text-gray-600 mb-2 float-left w-full text-left">End Date</label>
                      <input
                        type="date"
                        value={formData.finishDate}
                        onChange={(e) => setFormData({ ...formData, finishDate: e.target.value })}
                        min={formData.startDate}
                        className="block w-full px-4 md:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        disabled={!formData.startDate}
                      />
                    </div>
                    <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 8 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'min-h-[calc(98vh-100px)] p-4 mt-4' : 'h-[calc(98vh-150px)] p-8 mt-[10rem]'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-4`}>Review your event</h6>
                    <div className={`w-full ${isMobile ? 'px-2' : 'w-[90%]'} mx-auto py-5`}>
                      {(() => {
                        const discountP = formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.discountPrice)
                          ? Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountPrice)) / parseFloat(formData.originalPrice)) * 100)
                          : null;
                        return (
                          <div className={`flex flex-col ${isMobile ? '' : 'md:flex-row'}`}>
                            <div className={`${isMobile ? 'w-full mb-4' : 'w-full md:w-1/2'}`}>
                              <img
                                src={
                                  formData.images.length > 0 && formData.images[mainImageIdx]
                                    ? typeof formData.images[mainImageIdx] === "string"
                                      ? formData.images[mainImageIdx].startsWith("http")
                                        ? formData.images[mainImageIdx]
                                        : `${backend_url}${formData.images[mainImageIdx]}`
                                      : URL.createObjectURL(formData.images[mainImageIdx])
                                    : "https://via.placeholder.com/650"
                                }
                                alt="main preview"
                                className={`${isMobile ? 'w-full h-[250px]' : 'w-[550px] h-[500px] mx-auto md:mx-0'} border-2 border-white rounded-lg object-cover`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/Uploads/placeholder-image.jpg";
                                }}
                              />
                              <div className="relative">
                                <div className={`flex justify-center ${isMobile ? '-mt-4' : 'absolute top-[-25rem] w-[550px]'}`}>
                                  <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                                    {[...Array(formData.images.length)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`${isMobile ? 'h-1.5' : 'h-2'} rounded-full ${
                                          mainImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                                        }`}
                                        onClick={() => setMainImageIdx(i)}
                                        style={{ width: isMobile ? "30px" : "100px", borderRadius: "2px" }}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                                <div className={`flex justify-center ${isMobile ? 'mt-4' : 'mt-[-5rem]'}`}>
                                  {formData.images.map((image, index) => (
                                    <div
                                      key={index}
                                      className={`cursor-pointer ${isMobile ? 'mx-1' : 'mx-2'}`}
                                    >
                                      <img
                                        src={
                                          typeof image === "string"
                                            ? image.startsWith("http")
                                              ? image
                                              : `${backend_url}${image}`
                                            : URL.createObjectURL(image)
                                        }
                                        alt={`Thumbnail ${index}`}
                                        className={`${isMobile ? 'w-12 h-10' : 'w-[100px] h-[70px]'} object-cover border-2 border-white rounded-lg`}
                                        onClick={() => setMainImageIdx(index)}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "/Uploads/placeholder-image.jpg";
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {!isMobile && (
                                <div className="mt-10">
                                  <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Link to={`/shop/preview/${seller?._id}`}>
                                          <img
                                            src={
                                              seller?.avatar?.url
                                                ? seller.avatar.url.startsWith('http')
                                                  ? seller.avatar.url
                                                  : `${backend_url}${seller.avatar.url}`
                                                : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                            }
                                            alt={seller?.name || "Shop"}
                                            className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "/Uploads/avatar/avatar-1754729528346-341457281.jpg";
                                            }}
                                          />
                                        </Link>
                                        <div>
                                          <Link to={`/shop/preview/${seller?._id}`}>
                                            <h3 className={`${styles.shop_name}`}>
                                              {seller?.name || "Unknown Shop"}
                                            </h3>
                                          </Link>
                                          <div className="flex mt-1">
                                            <Ratings rating={0} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className={`${isMobile ? 'w-full mt-4' : 'w-full md:w-1/2 md:pl-10 mt-5 md:mt-0'}`}>
                              <button
                                onClick={() => navigate(`/products?category=${formData.category}`)}
                                className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
                              >
                                {getCategoryName(formData.category)}
                              </button>
                              <h1 className={`${styles.productTitle} ${isMobile ? 'text-lg' : ''}`} style={{ color: "#1c3b3c" }}>
                                {formData.name || "Unnamed Event"}
                              </h1>
                              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-start'} mt-2 space-y-2 ${isMobile ? '' : 'space-y-0'}`}>
                                <div className="flex items-center">
                                  <h4 className={`${styles.productDiscountPrice} ${isMobile ? 'text-base' : ''}`}>
                                    {formData.discountPrice ? `${formData.discountPrice} Birr` : "N/A"}
                                  </h4>
                                  {formData.originalPrice && (
                                    <h3 className={`${styles.price} ml-2 ${isMobile ? 'text-sm' : ''}`}>
                                      {formData.originalPrice} Birr
                                    </h3>
                                  )}
                                </div>
                                <div className={`${isMobile ? '' : 'ml-20'}`}>
                                  <Ratings rating={0} />
                                </div>
                              </div>
                              <div className="mt-4 md:mt-6">
                                <label className="text-gray-800 font-light">Event Dates</label>
                                <p className="text-gray-800 mt-2 text-sm md:text-base">
                                  {formData.startDate} to {formData.finishDate}
                                </p>
                              </div>
                              <div className="mt-4 md:mt-6">
                                <label className="text-gray-800 font-light">Available Sizes</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {formData.sizes && Array.isArray(formData.sizes) && formData.sizes.length > 0 ? (
                                    formData.sizes.map((size) => (
                                      <span
                                        key={size}
                                        className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm"
                                      >
                                        {size}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">No sizes available</p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 md:mt-6">
                                <label className="text-gray-800 font-light">Available Colors</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {formData.colors && Array.isArray(formData.colors) && formData.colors.length > 0 ? (
                                    formData.colors.map((color) => (
                                      <span
                                        key={color}
                                        className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm"
                                      >
                                        {color}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">No colors available</p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 md:mt-6">
                                <label className="text-gray-800 font-light">Stock</label>
                                <p className="text-gray-800 mt-2 text-sm md:text-base">Set by Admin</p>
                              </div>
                              <div className={`mt-4 md:mt-6 p-4 border border-[#525252] rounded-lg w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                                <p className="text-gray-600 text-sm md:text-base">
                                  {formData.description || "No description provided"}
                                </p>
                              </div>
                              <div className={`mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 ${isMobile ? '' : 'md:p-4'} flex items-center w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                                <img
                                  src={peacImg}
                                  alt="Offer"
                                  className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} mr-3 object-contain`}
                                />
                                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>
                                  {discountP
                                    ? `Save ${discountP}% today. Limited time offer!`
                                    : "Great Value! Limited time offer!"}
                                </p>
                              </div>
                              {isMobile && (
                                <div className="mt-6">
                                  <div className="bg-white border border-[#B4B4B4] rounded-lg p-4">
                                    <div className="flex items-center">
                                      <Link to={`/shop/preview/${seller?._id}`}>
                                        <img
                                          src={
                                            seller?.avatar?.url
                                              ? seller.avatar.url.startsWith('http')
                                                ? seller.avatar.url
                                                : `${backend_url}${seller.avatar.url}`
                                              : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                          }
                                          alt={seller?.name || "Shop"}
                                          className="w-10 h-10 rounded-full mr-3 object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/Uploads/avatar/avatar-1754729528346-341457281.jpg";
                                          }}
                                        />
                                      </Link>
                                      <div>
                                        <Link to={`/shop/preview/${seller?._id}`}>
                                          <h3 className={`${styles.shop_name} text-sm`}>
                                            {seller?.name || "Unknown Shop"}
                                          </h3>
                                        </Link>
                                        <div className="flex mt-1">
                                          <Ratings rating={0} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      <div className={`mt-6 flex ${isMobile ? 'flex-col-reverse gap-4' : 'justify-between'} ${isMobile ? 'w-full' : 'w-[90%]'}`}>
                        <button
                          className={`${isMobile ? 'w-full' : 'w-8 h-8'} bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition ${isMobile ? 'py-2' : ''}`}
                          onClick={prevStep}
                        >
                          <AiOutlineArrowLeft size={20} />
                          {isMobile && <span className="ml-2">Back</span>}
                        </button>
                        <button
                          className={`bg-[#CC9A00] text-white ${isMobile ? 'w-full py-3' : 'py-3 px-10'} rounded-full flex items-center justify-center hover:bg-yellow-500`}
                          onClick={handleEditSubmit}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
          <CreateEvent isOpen={isCreateOpen} onClose={toggleCreate} />
        </div>
      )}
    </>
  );
};

export default AllEvents;