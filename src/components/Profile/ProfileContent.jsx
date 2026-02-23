import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import { AiOutlineCamera,AiFillHeart, AiOutlineArrowRight,AiOutlineShoppingCart, AiOutlineHeart, AiOutlineSecurityScan, AiOutlineArrowLeft, AiOutlineDelete, AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineStar, AiFillStar, AiOutlineRightCircle } from "react-icons/ai";
import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { updateUserInformation, loadUser, deleteUserAddress, updateUserAddress } from "../../redux/actions/user";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import { Button } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import { Country, State } from "country-state-city";
import styles from "../../styles/styles";
import peacImg from "../../Assests/images/peac.png";
import Ratings from "../Products/Ratings";

const RefundForm = ({ isOpen, onClose, orderId, item, onSubmit, showToast }) => {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [refundQty, setRefundQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isOpen && item) {
      setRefundQty(1);
      setReason("");
      setImage(null);
      setImagePreview(null);
    }
  }, [isOpen, item]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!/image\/(jpeg|png)/.test(file.type)) {
        showToast("error", "Invalid File Type", "Only JPEG or PNG images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "File Too Large", "Image size must be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!refundQty || refundQty < 1 || refundQty > item.remainingQty) {
      showToast("error", "Invalid Quantity", "Invalid quantity to refund");
      return;
    }
    if (!reason.trim()) {
      showToast("error", "Missing Reason", "Reason is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const refundedItems = [{ _id: item._id, qty: refundQty, reason }];
      formData.append("refundedItems", JSON.stringify(refundedItems));
      if (image) {
        formData.append("refundImages", image);
      }
      const response = await api.put(
        `${server}/order/order-refund/${orderId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      showToast("success", "Refund Submitted", response.data.message || "Refund request submitted successfully!");
      onSubmit();
      handleClose();
    } catch (error) {
      showToast("error", "Refund Failed", error.response?.data?.message || "Failed to request refund");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setReason("");
    setImage(null);
    setImagePreview(null);
    setRefundQty(1);
    onClose();
  };
  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) return `${backend_url}/Uploads/avatar/default_avatar.png`;
    return imageUrl.startsWith("http") ? imageUrl : `${backend_url}${imageUrl}`;
  };
  if (!isOpen || !item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'Avenir LT Std', sans-serif" }}>
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <AiOutlineClose
              size={20}
              onClick={handleClose}
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            />
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl text-gray-900 mb-2">Request a Refund for {item.name}</h2>
          <p className="text-gray-600 text-sm sm:text-base">Provide details for refunding this item</p>
        </div>
        {/* Item Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={getProductImageUrl(item.images && item.images[0]?.url)}
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">Ordered: {item.qty} × Br{item.discountPrice?.toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-gray-600">Previously refunded: {item.qty - item.remainingQty}</p>
              <p className="text-xs sm:text-sm font-medium text-orange-600">Available to refund: {item.remainingQty}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left column - Policy & Eligibility */}
            <div className="lg:col-span-1 space-y-4">
              {/* Refund Policy Card */}
              <div className="rounded-2xl p-3 sm:p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center">
                  <AiOutlineSecurityScan size={18} className="text-[#1C3B3C] mr-2" />
                  Our refund policy
                </h3>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <p>We offer refunds on items returned within 30 days of purchase, provided they are in their original condition and packaging. Please note that certain items, such as personalized products, are not eligible for refunds. For more details, please refer to our full refund policy on our website.</p>
                </div>
              </div>
              {/* Eligibility Card */}
              <div className="rounded-2xl p-3 sm:p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center">
                  <AiOutlineSecurityScan size={18} className="text-[#1C3B3C] mr-2" />
                  Eligibility
                </h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start">
                    <span className="w-4 h-4 bg-[#0C962A] rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-700 leading-relaxed">We offer refunds on items returned within 30 days of purchase, provided they are in their original condition</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 bg-[#0C962A] rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-700 leading-relaxed">We offer refunds on items returned within 30 days of purchase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 bg-[#D10101] rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 flex-shrink-0">✕</span>
                    <span className="text-gray-700 leading-relaxed">We offer refunds on items returned within 30 days of purchase</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Right column - Form fields */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                {/* Quantity to Refund */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Quantity to refund <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={item.remainingQty}
                    value={refundQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setRefundQty(val >= 1 && val <= item.remainingQty ? val : refundQty);
                    }}
                    className="w-full border-2 border-gray-300 rounded-2xl p-3 focus:outline-none focus:border-[#CC9A00] focus:ring-2 focus:ring-[#CC9A00]/20 text-xs text-gray-900"
                    required
                  />
                </div>
                {/* Reason for Refund */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Reason for refund <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full border-2 border-gray-300 rounded-2xl p-3 focus:outline-none focus:border-[#CC9A00] focus:ring-2 focus:ring-[#CC9A00]/20 resize-none h-28 text-xs text-gray-900 placeholder-gray-500 pr-10"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe the issue with the item"
                      required
                    />
                    <div className="absolute bottom-2 right-3 text-gray-400 text-xs">
                      {reason.length}/500
                    </div>
                  </div>
                </div>
                {/* Attach Image */}
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Attach image (optional)
                  </label>
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-5 bg-gray-50 hover:border-[#CC9A00] transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center text-center text-gray-500">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                          <AiOutlineCamera size={16} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-medium">Upload image here, or click to select file</p>
                        <p className="text-xs">Supports: JPEG, PNG. Max size: 5MB</p>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="relative border border-gray-300 rounded-2xl overflow-hidden bg-gray-50 p-2 flex items-center">
                        <img
                          src={imagePreview}
                          alt="Refund Image Preview"
                          className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl mr-3"
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                          <p className="text-xs text-gray-500 mt-1 text-center">Click to replace image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Submit buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 order-2 sm:order-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-[#CC9A00] text-white rounded-full text-xs font-semibold hover:bg-[#B8860B] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2"
              disabled={isSubmitting || !reason.trim() || !refundQty}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Refund</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const ProfileContent = ({ active }) => {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const { orders, isLoading } = useSelector((state) => state.order);
  const { categories } = useSelector((state) => state.category);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar?.url || null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("AA");
  const [address1, setAddress1] = useState("");
  const [addressType, setAddressType] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visibleOld, setVisibleOld] = useState(false);
  const [visibleNew, setVisibleNew] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedRefundItem, setSelectedRefundItem] = useState(null);
  const [selectedRefundOrderId, setSelectedRefundOrderId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [count, setCount] = useState(1);
  // Event modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventDetailsImageIdx, setEventDetailsImageIdx] = useState(0);
  const [isEventDescriptionExpanded, setIsEventDescriptionExpanded] = useState(false);
  const [modalCount, setModalCount] = useState(1);
const [modalClick, setModalClick] = useState(false);
const [modalSelectedSize, setModalSelectedSize] = useState(null);
const [modalSelectedColor, setModalSelectedColor] = useState(null);

const incrementModalCount = () => {
  if (selectedEvent?.stock && modalCount < selectedEvent.stock) {
    setModalCount(modalCount + 1);
  }
};

const decrementModalCount = () => {
  if (modalCount > 1) setModalCount(modalCount - 1);
};

// Wishlist check
// useEffect(() => {
//   if (wishlist?.find((i) => i._id === selectedEvent?._id)) {
//     setModalClick(true);
//   } else {
//     setModalClick(false);
//   }
// }, [wishlist, selectedEvent]);

// Reuse your existing handlers but pass selectedEvent
// const modalAddToCart = () => addToCartHandler(selectedEvent._id); 
// const modalAddToWishlist = () => addToWishlistHandler(selectedEvent);
// const modalRemoveFromWishlist = () => removeFromWishlistHandler(selectedEvent);
  // Address modal states
  const [addressError, setAddressError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];
  const filterOptions = [
    "All",
    "Delivered",
    "Pending",
    "Canceled",
    "Refund Requested",
    "Processing refund",
    "Refund Processed",
    "Refund Success",
  ];
  const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, { ...options, timeout: 10000 });
        return response;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  useEffect(() => {
    if (open) {
      setCity("AA");
    }
  }, [open]);
  useEffect(() => {
    if (error) {
      showToast("error", "Error Occurred", error || "An error occurred");
      dispatch({ type: "clearErrors" });
    }
    if (successMessage) {
      showToast("success", "Success", successMessage);
      dispatch({ type: "clearMessages" });
    }
    if (user?.avatar?.url) {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || server;
      const avatarPath = user.avatar.url.startsWith("http")
        ? user.avatar.url
        : `${baseUrl}/Uploads/avatar/${user.avatar.url.split("/").pop()}`;
      setAvatarUrl(avatarPath);
    } else {
      setAvatarUrl(`${server}/Uploads/avatar/default_avatar.png`);
    }
    if (active === 2 || active === 3) {
      dispatch(getAllOrdersOfUser(user?._id));
    }
  }, [error, successMessage, user, server, dispatch, active]);
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await api.put(`${server}/user/update-avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(loadUser());
      const newAvatarUrl = response.data.user.avatar.url;
      setAvatarUrl(
        newAvatarUrl.startsWith("http")
          ? newAvatarUrl
          : `${server}/Uploads/avatar/${newAvatarUrl.split("/").pop()}`
      );
      showToast("success", "Avatar Updated", "Avatar updated successfully!");
    } catch (error) {
      showToast("error", "Upload Failed", error.response?.data?.message || "Failed to update avatar");
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name || !email || !phoneNumber) {
      showToast("error", "Incomplete Form", "Please fill in all fields.");
      return;
    }
    await dispatch(updateUserInformation(name, email, phoneNumber));
    dispatch(loadUser());
  };
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (city === "" || address1 === "" || addressType === "") {
      showToast("error", "Incomplete Form", "Please fill all required fields!");
      return;
    }
    try {
      console.log("Submitting address:", { country: "ET", city, address1, addressType });
      await dispatch(updateUserAddress("ET", city, address1, addressType));
      setOpen(false);
      resetAddressForm();
      dispatch(loadUser());
    } catch (error) {
      showToast("error", "Address Failed", "Failed to save address");
      console.error("Address submission error:", error);
    }
  };
  const resetAddressForm = () => {
    setCity("AA");
    setAddress1("");
    setAddressType("");
    setStep(1);
    setAddressError("");
    setAddressSuggestions([]);
  };
const confirmDelete = (id) => {
  setAddressToDelete(id);
  setShowDeleteConfirm(true);
};
const handleDelete = () => {
  if (addressToDelete) {
    dispatch(deleteUserAddress(addressToDelete));
    setShowDeleteConfirm(false);
    setAddressToDelete(null);
  }
};
  const handleDeactivate = () => {
    axios
      .put(`${server}/user/deactivate`, {}, { withCredentials: true })
      .then((res) => {
        showToast("success", "Account Deactivated", res.data.message);
        window.location.reload(true);
        navigate("/login");
      })
      .catch((error) => {
        showToast("error", "Deactivation Failed", error.response?.data?.message || "Deactivation failed");
      });
  };
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const filteredRows = useMemo(() => {
    let filteredOrders = orders || [];
    if (active === 3) {
      const refundStatuses = ["Refund Requested", "Processing refund", "Refund Processed", "Refund Success"];
      filteredOrders = filteredOrders.filter((item) => refundStatuses.includes(item.status));
    }
    if (filterStatus !== "All") {
      filteredOrders = filteredOrders.filter((item) => item.status === filterStatus);
    }
    filteredOrders = filteredOrders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filteredOrders.map((item) => {
      // detect any rejected refund in order or its subOrders
      let hasRejected = false;
      const checkList = [];
      if (item.refundRequests && item.refundRequests.length > 0) checkList.push(...item.refundRequests);
      if (item.subOrders && item.subOrders.length > 0) {
        item.subOrders.forEach((s) => {
          if (s.refundRequests && s.refundRequests.length > 0) checkList.push(...s.refundRequests);
        });
      }
      if (checkList.some(r => r.status && /reject/i.test(r.status))) {
        hasRejected = true;
      }

      return {
        id: item._id,
        itemsQty: item.cart.length,
        total: `Br ${item.totalPrice}`,
        status: hasRejected ? "Request Rejected" : item.status,
      };
    });
  }, [orders, active, filterStatus]);
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const getStatusColor = (status) => {
    return {
      Delivered: "bg-green-100 text-green-600",
      Pending: "bg-yellow-100 text-yellow-600",
      Canceled: "bg-red-100 text-red-600",
      "Processing refund": "bg-yellow-100 text-yellow-800",
      "Refund Success": "bg-green-100 text-green-800",
      "Request Rejected": "bg-red-100 text-red-800",
    }[status] || "bg-gray-100 text-gray-600";
  };
  const reviewHandler = async () => {
    try {
      const response = await api.put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: selectedOrderId,
        },
        { withCredentials: true }
      );
      showToast("success", "Review Submitted", response.data.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(1);
      setReviewOpen(false);
    } catch (error) {
      showToast("error", "Review Failed", error.response?.data?.message || "Failed to submit review");
    }
  };
  const handleRefundSubmit = () => {
    dispatch(getAllOrdersOfUser(user._id));
    setShowRefundForm(false);
    setSelectedRefundItem(null);
    setSelectedRefundOrderId(null);
  };
  const handleSendMessage = async () => {
    if (!user) {
      showToast("error", "Login Required", "Please login to send a message");
      return;
    }
    const data = orders && orders.find((item) => item._id === selectedOrderId);
    if (!data?.shop) {
      showToast("error", "Shop Info Missing", "Shop information not available");
      return;
    }
    const sellerId = typeof data.shop === 'object' ? data.shop._id : data.shop;
    if (!sellerId) {
      showToast("error", "Shop ID Missing", "Shop ID not available");
      return;
    }
    try {
      const groupTitle = `order_${data._id}_${user._id}_${sellerId}`;
      const userId = user._id;
      const res = await axios.post(
        `${server}/conversation/create-new-conversation`,
        { groupTitle, userId, sellerId },
        { withCredentials: true }
      );
      // Open message in full page for mobile
      if (window.innerWidth < 768) {
        window.location.href = `/inbox?${res.data.conversation._id}`;
      } else {
        navigate(`/inbox?${res.data.conversation._id}`);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        if (window.innerWidth < 768) {
          window.location.href = `/inbox?${sellerId}`;
        } else {
          navigate(`/inbox?${sellerId}`);
        }
      } else {
        showToast("error", "Message Failed", error.response?.data?.message || "Failed to start conversation");
      }
    }
  };
  const getUserDisplayName = () => {
    return "Abenezer Anbessie";
  };
  const getUserContactInfo = () => {
    return user?.email || user?.phoneNumber || "N/A";
  };
  const fallbackImage = `${server}/Uploads/avatar/default_avatar.png`;
  const getProductImageUrl = (imageUrl) => {
    if (!imageUrl) return fallbackImage;
    return imageUrl.startsWith("http") ? imageUrl : `${backend_url}${imageUrl}`;
  };
  const getPaymentStatusStyle = (status) => {
    if (status?.toLowerCase() === "succeeded") {
      return "bg-[#DCFCE7] text-[#16A34A] rounded-full";
    }
    return "bg-[#FEF9C3] text-[#854D0E] rounded-full";
  };
  const getRefundStatusStyle = (status) => {
    return {
      "Processing refund": "bg-yellow-100 text-yellow-800 rounded-full",
      "Refund Success": "bg-green-100 text-green-800 rounded-full",
      "Request Rejected": "bg-red-100 text-red-800 rounded-full",
    }[status] || "bg-gray-100 text-gray-800 rounded-full";
  };
  const getTrackingStatusStyle = (status) => {
    return {
      Delivered: "bg-green-100 text-green-600",
      Pending: "bg-yellow-100 text-yellow-600",
      Canceled: "bg-red-100 text-red-600",
      "Processing refund": "bg-yellow-100 text-yellow-800",
      "Refund Success": "bg-green-100 text-green-800",
    }[status] || "bg-gray-100 text-gray-600";
  };
  const getRefundImageUrl = (refundImage) => {
    if (!refundImage) return fallbackImage;
    return refundImage.startsWith("http")
      ? refundImage
      : `${server}${refundImage}`;
  };
  const fetchProductDetails = async (productId) => {
    if (!productId) return;
    setProductLoading(true);
    try {
        const { data } = await axios.get(`${server}/product/detail/${productId}`);
        if (data.success) {
            setSelectedProduct(data.product);
        } else {
            console.error("Unexpected response:", data);
        }
    } catch (error) {
        console.error("Failed to load product details", error);
    } finally {
        setProductLoading(false);
    }
  };
  
  const fetchEventDetails = async (eventId) => {
    if (!eventId) return;
    setEventLoading(true);
    try {
      const { data } = await axios.get(`${server}/event/get-event/${eventId}`, { withCredentials: true });
      if (data.success) {
        setSelectedEvent(data.event);
      } else {
        console.error("Unexpected response:", data);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Failed to load event details", error);
      setSelectedEvent(null);
    } finally {
      setEventLoading(false);
    }
  };
  const openProductModal = (productId) => {
    fetchProductDetails(productId);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setCount(1);
    setShowProductModal(true);
  };
  const openEventModal = (eventId) => {
    fetchEventDetails(eventId);
    setEventDetailsImageIdx(0);
    setIsEventDescriptionExpanded(false);
    setShowEventModal(true);
  };
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setCount(1);
  };
  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setEventDetailsImageIdx(0);
    setIsEventDescriptionExpanded(false);
  };
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };
  const toggleEventDescription = () => {
    setIsEventDescriptionExpanded(!isEventDescriptionExpanded);
  };
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.title : "Unknown";
  };
  const discountPercent = selectedProduct?.originalPrice && selectedProduct?.originalPrice > selectedProduct?.discountPrice
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.discountPrice) / selectedProduct.originalPrice) * 100)
    : null;
  const descriptionLimit = 100;
  const isDescriptionLong = selectedProduct?.description && selectedProduct.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedProduct.description.slice(0, descriptionLimit) + "..."
    : selectedProduct?.description;
  // Address modal functions
  const validateAddress = (value) => {
    if (value.length < 5) {
      setAddressError("Please enter a detailed address (e.g., street name, house number).");
      return false;
    }
    setAddressError("");
    return true;
  };
  const validateAddressGeocode = async () => {
    try {
      const fullQuery = `${address1}, ${State.getStateByCodeAndCountry(city, "ET")?.name || city}, Ethiopia`;
      const geoRes = await fetchWithRetry(
        `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=1&addressdetails=1`,
        { withCredentials: true }
      );
      if (geoRes.data.length > 0) {
        showToast("success", "Address Validated", "Address validated successfully!");
        return true;
      } else {
        setAddressError("Invalid address. Try providing landmarks or more details.");
        return false;
      }
    } catch (error) {
      setAddressError("Failed to validate address. Please check your input or network.");
      return false;
    }
  };
  const fetchSuggestionsDebounced = debounce(async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const fullQuery = `${query}, ${State.getStateByCodeAndCountry(city, "ET")?.name || city}, Ethiopia`;
      const res = await fetchWithRetry(
        `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=10&addressdetails=1`,
        { withCredentials: true }
      );
      setAddressSuggestions(res.data);
    } catch (error) {
      console.error("Suggestion fetch error:", error);
      setAddressSuggestions([]);
      showToast("info", "Suggestions Warning", "Could not fetch address suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, 500);
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress1(value);
    validateAddress(value);
    fetchSuggestionsDebounced(value);
  };
  const selectSuggestion = (item) => {
    let detailedAddress = '';
    if (item.address?.house_number) detailedAddress += item.address.house_number + ' ';
    if (item.address?.road) detailedAddress += item.address.road + ', ';
    if (item.address?.neighbourhood) detailedAddress += item.address.neighbourhood + ', ';
    if (item.address?.suburb) detailedAddress += item.address.suburb + ', ';
    if (item.address?.city_district) detailedAddress += item.address.city_district + ', ';
    detailedAddress = detailedAddress.trim().replace(/,$/, '') || item.display_name.split(', ').slice(0, 3).join(', ');
    setAddress1(detailedAddress);
    setAddressSuggestions([]);
    validateAddressGeocode();
  };
  const getCurrentLocation = async () => {
    if (isLoadingLocation) return;
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetchWithRetry(
              `${server}/order/reverse-geocode?lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { withCredentials: true }
            );
            const data = res.data;
            if (data.address) {
              const newCountry = "Ethiopia";
              let newCity = "AA";
              let newAddress = '';
              if (data.address.house_number) newAddress += data.address.house_number + ' ';
              if (data.address.road) newAddress += data.address.road + ', ';
              if (data.address.neighbourhood) newAddress += data.address.neighbourhood + ', ';
              if (data.address.suburb) newAddress += data.address.suburb + ', ';
              if (data.address.city_district) newAddress += data.address.city_district + ', ';
              newAddress = newAddress.trim().replace(/,$/, '') || data.display_name.split(', ').slice(0, 3).join(', ');
              setCity(newCity);
              setAddress1(newAddress);
              setAddressError("");
              showToast("success", "Location Fetched", "Location fetched and address filled successfully!");
              await validateAddressGeocode();
            } else {
              setAddressError("No address found for this location.");
              showToast("error", "Location Error", "No address found for this location.");
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error.response?.data || error);
            setAddressError("Failed to fetch address from location.");
            showToast("error", "Reverse Geocode Error", "Failed to fetch address from location.");
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          showToast("error", "Geolocation Error", "Failed to get current location. Please enable location services and try again.");
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      showToast("error", "Browser Error", "Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  };
  // Order Card Component for Mobile
  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500">Order ID</p>
          <p className="text-sm font-medium text-gray-900">{order.id.slice(0, 8)}...</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>
     
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Items</p>
          <p className="text-sm font-medium text-gray-900">{order.itemsQty}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-medium text-gray-900">{order.total}</p>
        </div>
      </div>
     
      <button
        onClick={() => setSelectedOrderId(order.id)}
        className="w-full bg-[#FFC300] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#E6B800] transition-colors"
      >
        View Details
      </button>
    </div>
  );
  // Address Card Component for Mobile
  const AddressCard = ({ address }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">{address.addressType || "Default"}</h4>
            <button
              onClick={() => confirmDelete(address._id)}
              className="text-red-500 hover:text-red-700"
            >
              <AiOutlineDelete size={16} />
            </button>
          </div>
         
          <div className="space-y-1 text-xs text-gray-600">
            <p>{address.address1}</p>
            <p>{State.getStateByCodeAndCountry(address.city, "ET")?.name || address.city}, {address.country || "Ethiopia"}</p>
          </div>
        </div>
      </div>
    </div>
  );
  if (active === 1) {
    return (
      <div className="min-h-screen bg-[#FFF] flex justify-center items-start py-4 sm:py-10 px-4">
        <div className="w-full max-w-6xl space-y-6" style={{ fontFamily: "'Avenir LT Std', sans-serif" }}>
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl " style={{ color: "#1c3b3c" }}>
              User profile
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your details, view your tier status, and update your information.
            </p>
          </div>
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={avatarUrl || `${server}/Uploads/avatar/default_avatar.png`}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#FFC300]"
                  onError={(e) => {
                    e.target.src = `${server}/Uploads/avatar/default_avatar.png`;
                  }}
                />
                <label
                  htmlFor="image"
                  className="absolute -bottom-1 -right-1 bg-gray-100 p-1.5 sm:p-2 rounded-full cursor-pointer"
                >
                  <AiOutlineCamera className="text-gray-600 text-sm sm:text-base" />
                  <input type="file" id="image" className="hidden" onChange={handleImage} />
                </label>
              </div>
              <p className="font-semibold text-base sm:text-lg text-gray-800 text-center">
                {user?.name || "Full name "}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                {user?.phoneNumber || "+251 --------"}
              </p>
            </div>
            {/* General Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-4 sm:mb-6">General information</h3>
              <form className="grid grid-cols-1 gap-3 sm:gap-4" onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-sm sm:text-base"
                />
              </form>
            </div>
          </div>
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-4">Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-sm sm:text-base"
                placeholder="Email"
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-sm sm:text-base"
                placeholder="Phone number"
              />
            </div>
            <div className="flex justify-center mt-4 sm:mt-6">
              <button
                type="button"
                onClick={handleUpdate}
                className="w-full sm:w-auto px-6 py-2 sm:py-3 border border-[#FFC300] text-[#FFC300] rounded-lg shadow-sm hover:bg-[#FFC300] hover:text-white transition-colors text-sm sm:text-base"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (active === 2 || active === 3) {
    const selectedOrder = selectedOrderId ? orders?.find((item) => item._id === selectedOrderId) : null;
    const isDelivered = selectedOrder?.status === "Delivered";
    // determine if any refund request was rejected for this order
    let orderHasRejected = false;
    const _check = [];
    if (selectedOrder?.refundRequests && selectedOrder.refundRequests.length > 0) _check.push(...selectedOrder.refundRequests);
    if (selectedOrder?.subOrders && selectedOrder.subOrders.length > 0) {
      selectedOrder.subOrders.forEach(s => {
        if (s.refundRequests && s.refundRequests.length > 0) _check.push(...s.refundRequests);
      });
    }
    if (_check.some(r => r.status && /reject/i.test(r.status))) orderHasRejected = true;
    const displayStatus = orderHasRejected ? "Request Rejected" : selectedOrder?.status;
    return (
      <div className="min-h-screen bg-[#FFF] flex justify-center items-start py-4 sm:py-10 px-3 sm:px-4">
        <div className="w-full max-w-7xl" style={{ fontFamily: "'Avenir LT Std', sans-serif" }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
            {/* Header with Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl text-gray-900">
                {active === 2 ? "All Orders" : "Refund Orders"}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC300] w-full sm:w-auto"
                >
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setFilterStatus("All");
                    setCurrentPage(1);
                  }}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium w-full sm:w-auto"
                >
                  Clear Filter
                </button>
              </div>
            </div>
            {/* Orders Display - Cards for Mobile, Table for Desktop */}
            <div className="lg:hidden">
              {/* Mobile Cards View */}
              {paginatedRows.length > 0 ? (
                <div className="space-y-4">
                  {paginatedRows.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-700 text-sm">No orders found</p>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              {/* Desktop Table View */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-gray-500 text-xs sm:text-sm">
                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Order ID</th>
                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Status</th>
                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Items</th>
                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Total</th>
                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRows.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-2 sm:px-4 text-gray-900 text-xs sm:text-sm">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{order.itemsQty}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{order.total}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <Button onClick={() => setSelectedOrderId(order.id)}>
                            <AiOutlineEye size={18} className="text-gray-400 hover:text-gray-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 sm:mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
                >
                  Previous
                </button>
                <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                          currentPage === page
                            ? "bg-[#FFC300] text-white"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {/* Order Details Modal */}
          {selectedOrderId && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 lg:p-0 z-50 font-avenir lg:mt-10">
             <div className="relative bg-gray-50 w-full max-w-full lg:max-w-full lg:rounded-none rounded-xl shadow-lg overflow-y-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(120vh-4rem)]">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="absolute top-2 right-2 text-white bg-[#F3F4F6] hover:bg-[#1B3B3E] rounded-full p-2 transition-colors duration-200 z-10"
                  title="Close"
                >
                  <AiOutlineClose className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B3B3E] hover:text-white" />
                </button>
                <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6">
                      {/* Order Header */}
                      <div
                        className="bg-white rounded-t-xl p-3 sm:p-4 mb-4"
                        style={{ borderBottom: "1px solid #CC9A00" }}
                      >
                        <h2 className="text-lg sm:text-xl font-semibold text-black">
                          Order ID:{" "}
                          <span className="text-black ">#{selectedOrder._id?.slice(0, 8) || "N/A"}</span>
                        </h2>
                        <p className="text-sm text-black mt-1">
                          Placed on: {selectedOrder.createdAt?.slice(0, 10) || "N/A"}
                        </p>
                      </div>
                      {/* Order Status */}
                      <div className="bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white rounded-xl p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Status</h3>
                        <p className="text-gray-200 mb-2">
                          <span className={`font-medium px-3 py-1 rounded-full text-sm ${getTrackingStatusStyle(displayStatus)}`}>
                            {displayStatus || "Unknown"}
                          </span>
                        </p>
                        {selectedOrder.status === "Delivered" && (
                          <p className="text-gray-200 text-sm">Delivered On: {selectedOrder.deliveredAt?.slice(0, 10) || "N/A"}</p>
                        )}
                        {(orderHasRejected || ["Processing refund", "Refund Success"].includes(selectedOrder.status)) && (
                          <p className="text-gray-200 text-sm">Refund Status: {orderHasRejected ? "Request Rejected" : selectedOrder.status}</p>
                        )}
                      </div>
                      {/* Order Items */}
                      <div className="border-t pt-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Items</h3>
                       
                        {/* Mobile Card View for Order Items */}
                        <div className="lg:hidden space-y-4">
                          {selectedOrder.cart?.length > 0 ? (
                            selectedOrder.cart.map((item, index) => {
                              const shopId = item.shopId;
                              let refundRequests = [];
                              let remainingQty = item.qty;
                              let pendingRefund = false;
                              let subOrderId = null;
                             
                              if (selectedOrder.subOrders?.length > 0) {
                                const sub = selectedOrder.subOrders.find(s => s.shop?.toString() === shopId?.toString());
                                if (sub) {
                                  subOrderId = sub._id;
                                  refundRequests = sub.refundRequests || [];
                                  const refundedQty = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString() && r.status === "Refund Success").reduce((sum, r) => sum + r.refundedQty, 0);
                                  remainingQty = item.qty - refundedQty;
                                  pendingRefund = refundRequests.some(r => r.itemId?.toString() === item._id?.toString() && ["Pending", "Vendor Approved"].includes(r.status));
                                }
                              } else {
                                subOrderId = selectedOrder._id;
                                refundRequests = selectedOrder.refundRequests || [];
                                const refundedQty = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString() && r.status === "Refund Success").reduce((sum, r) => sum + r.refundedQty, 0);
                                remainingQty = item.qty - refundedQty;
                                pendingRefund = refundRequests.some(r => r.itemId?.toString() === item._id?.toString() && ["Pending", "Vendor Approved"].includes(r.status));
                              }
                              const refundForItem = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString());

                              return (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-start gap-3 mb-3">
                                    {/* <img
                                      src={getProductImageUrl(item.images && item.images[0]?.url)}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded"
                                    /> */}
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                      <p className="text-xs text-gray-500">ID: {item._id?.slice(0, 6)}</p>
                                      {item.selectedSize && (
                                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                                      )}
                                      {item.selectedColor && (
                                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                                      )}
                                            {refundForItem && refundForItem.length > 0 && (
                                              (() => {
                                                const rejected = refundForItem.filter(r => r.status && /reject/i.test(r.status));
                                                if (rejected.length > 0) {
                                                  return (
                                                    <div className="mt-1">
                                                      {rejected.map((r, idx) => (
                                                        <p key={idx} className="text-xs text-red-600">Rejected: {r.reason || "No reason provided"}</p>
                                                      ))}
                                                    </div>
                                                  );
                                                }
                                                return null;
                                              })()
                                            )}
                                    </div>
                                  </div>
                                 
                                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                    <div>
                                      <span className="text-gray-500">Qty:</span>
                                      <span className="ml-1 font-medium">{item.qty || 1}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Price:</span>
                                      <span className="ml-1 font-medium">Br{item.discountPrice?.toFixed(2) || "0.00"}</span>
                                    </div>
                                  </div>
                                 
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => item.isEvent ? openEventModal(item._id) : openProductModal(item._id)}
                                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-xs font-medium"
                                    >
                                      View Details
                                    </button>
                                    {isDelivered && (
                                      <>
                                        {!item.isReviewed ? (
                                          <button
                                            className="flex-1 bg-[#CC9A00] text-white py-2 rounded text-xs font-medium"
                                            onClick={() => {
                                              setReviewOpen(true);
                                              setSelectedItem(item);
                                            }}
                                          >
                                            Review
                                          </button>
                                        ) : (
                                          <span className="flex-1 bg-gray-100 text-gray-600 py-2 rounded text-xs text-center">Reviewed</span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                 
                                  {isDelivered && (
                                    <div className="mt-3">
                                      {pendingRefund ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                          Pending Refund
                                        </span>
                                      ) : remainingQty <= 0 ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                          Fully Refunded
                                        </span>
                                      ) : !item.isEvent && remainingQty > 0 && subOrderId ? (
                                        <button
                                          className="w-full bg-[#CC9A00] text-white py-2 rounded text-xs font-medium mt-2"
                                          onClick={() => {
                                            setSelectedRefundItem({ ...item, remainingQty });
                                            setSelectedRefundOrderId(subOrderId);
                                            setShowRefundForm(true);
                                          }}
                                        >
                                          Request Refund
                                        </button>
                                      ) : null}
                                    </div>
                                  )}
                                  {/* Show any refund requests for this item (accepted/rejected/processing) */}
                                  {refundForItem.length > 0 && (
                                    <div className="mt-3 space-y-2 text-xs">
                                      {refundForItem.map((r, ri) => (
                                        <div key={ri} className="p-2 border rounded bg-white">
                                          <div className="flex justify-between items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${r.status === "Refund Success" ? "bg-green-100 text-green-800" : r.status === "Vendor Approved" ? "bg-blue-100 text-blue-800" : r.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                                              {r.status}
                                            </span>
                                            <span className="text-gray-500 text-xs">Qty: {r.refundedQty || 1}</span>
                                          </div>
                                          {r.reason && <p className="text-gray-700 mt-1">{r.reason}</p>}
                                          {r.refundImage && (
                                            <img src={getRefundImageUrl(r.refundImage)} alt="refund" className="w-20 h-20 object-cover rounded mt-2" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-700 text-sm">No items available</p>
                            </div>
                          )}
                        </div>
                        {/* Desktop Table View for Order Items */}
                        <div className="hidden lg:block">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead>
                                <tr className="bg-gray-50 text-gray-600 text-xs sm:text-sm">
                                  <th className="py-2 px-2 sm:px-4 text-left font-medium">Product</th>
                                  <th className="py-2 px-2 sm:px-4 text-left font-medium">Qty</th>
                                  <th className="py-2 px-2 sm:px-4 text-left font-medium">Price</th>
                                  <th className="py-2 px-2 sm:px-4 text-left font-medium">Detail</th>
                                  {isDelivered && (
                                    <>
                                      <th className="py-2 px-2 sm:px-4 text-left font-medium">Review</th>
                                      {/** Only show Refund header when there are refundable (non-event) items */}
                                      {selectedOrder.cart?.some(i => !i.isEvent) && (
                                        <th className="py-2 px-2 sm:px-4 text-left font-medium">Refund</th>
                                      )}
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {selectedOrder.cart?.length > 0 ? (
                                  selectedOrder.cart.map((item, index) => {
                                    const shopId = item.shopId;
                                    let refundRequests = [];
                                    let remainingQty = item.qty;
                                    let pendingRefund = false;
                                    let subOrderId = null;
                                    if (selectedOrder.subOrders?.length > 0) {
                                      const sub = selectedOrder.subOrders.find(s => s.shop?.toString() === shopId?.toString());
                                      if (sub) {
                                        subOrderId = sub._id;
                                        refundRequests = sub.refundRequests || [];
                                        const refundedQty = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString() && r.status === "Refund Success").reduce((sum, r) => sum + r.refundedQty, 0);
                                        remainingQty = item.qty - refundedQty;
                                        pendingRefund = refundRequests.some(r => r.itemId?.toString() === item._id?.toString() && ["Pending", "Vendor Approved"].includes(r.status));
                                      }
                                    } else {
                                      subOrderId = selectedOrder._id;
                                      refundRequests = selectedOrder.refundRequests || [];
                                      const refundedQty = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString() && r.status === "Refund Success").reduce((sum, r) => sum + r.refundedQty, 0);
                                      remainingQty = item.qty - refundedQty;
                                      pendingRefund = refundRequests.some(r => r.itemId?.toString() === item._id?.toString() && ["Pending", "Vendor Approved"].includes(r.status));
                                    }
                                    const refundForItem = refundRequests.filter(r => r.itemId?.toString() === item._id?.toString());
                                    return (
                                      <tr key={index} className="hover:bg-gray-50 transition">
                                        <td className="py-3 px-2 sm:px-4">
                                          <div className="flex items-center gap-2">
                                           
                                            <div>
                                              <p className="text-gray-900 font-semibold text-xs sm:text-sm">
                                                {item.name || "Unknown Item"}
                                              </p>
                                              <p className="text-gray-500 text-xs">
                                                ID: {item._id?.slice(0, 6) || "N/A"}
                                              </p>
                                                  {item.selectedSize && (
                                                    <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                                                  )}
                                                  {item.selectedColor && (
                                                    <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                                                  )}
                                                {refundForItem && refundForItem.length > 0 && (
                                                  (() => {
                                                    const rejected = refundForItem.filter(r => r.status && /reject/i.test(r.status));
                                                    if (rejected.length > 0) {
                                                      return (
                                                        <div className="mt-1">
                                                          {rejected.map((r, idx) => (
                                                            <p key={idx} className="text-xs text-red-600">Rejected: {r.reason || "No reason provided"}</p>
                                                          ))}
                                                        </div>
                                                      );
                                                    }
                                                    return null;
                                                  })()
                                                )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{item.qty || 1}</td>
                                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                                          Br{item.discountPrice?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                          <button
                                            onClick={() => item.isEvent ? openEventModal(item._id) : openProductModal(item._id)}
                                            className="text-[#CC9A00] hover:text-[#E6B800] p-1"
                                            title={`View details for ${item.name || "Item"}`}
                                          >
                                            <AiOutlineEye size={16} />
                                          </button>
                                        </td>
                                        {isDelivered && (
                                          <>
                                            <td className="py-3 px-2 sm:px-4">
                                              {!item.isReviewed ? (
                                                <button
                                                  className="bg-[#CC9A00] text-white px-2 sm:px-4 py-1 rounded-full hover:bg-[#E6B800] transition-colors duration-200 text-xs sm:text-sm"
                                                  onClick={() => {
                                                    setReviewOpen(true);
                                                    setSelectedItem(item);
                                                  }}
                                                >
                                                  Write Review
                                                </button>
                                              ) : (
                                                <span className="text-gray-600 text-xs sm:text-sm">Reviewed</span>
                                              )}
                                            </td>
                                            {/** Only render Refund cell if there are refundable (non-event) items in the order */}
                                            {selectedOrder.cart?.some(i => !i.isEvent) ? (
                                              <td className="py-3 px-2 sm:px-4">
                                                {refundForItem.length > 0 ? (
                                                  <div className="space-y-2 text-xs">
                                                    {refundForItem.map((r, ri) => (
                                                      <div key={ri} className="p-2 border rounded bg-white">
                                                        <div className="flex items-center justify-between">
                                                          <span className={`px-2 py-1 rounded-full ${r.status === "Refund Success" ? "bg-green-100 text-green-800" : r.status === "Vendor Approved" ? "bg-blue-100 text-blue-800" : r.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"} text-xs`}>{r.status}</span>
                                                          <span className="text-gray-500 text-xs">Qty: {r.refundedQty || 1}</span>
                                                        </div>
                                                        {r.reason && <p className="text-gray-700 mt-1">Reason: {r.reason}</p>}
                                                        {r.refundImage && (
                                                          <img src={getRefundImageUrl(r.refundImage)} alt="refund" className="w-20 h-20 object-cover rounded mt-2" />
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : pendingRefund ? (
                                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                    Pending
                                                  </span>
                                                ) : remainingQty <= 0 ? (
                                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    Refunded
                                                  </span>
                                                ) : !item.isEvent && remainingQty > 0 && subOrderId ? (
                                                  <button
                                                    className="bg-[#CC9A00] text-white px-2 sm:px-4 py-1 rounded-full hover:bg-[#E6B800] transition-colors duration-200 text-xs sm:text-sm"
                                                    onClick={() => {
                                                      setSelectedRefundItem({ ...item, remainingQty });
                                                      setSelectedRefundOrderId(subOrderId);
                                                      setShowRefundForm(true);
                                                    }}
                                                  >
                                                    Refund
                                                  </button>
                                                ) : (
                                                  <span className="text-gray-400 text-xs">N/A</span>
                                                )}
                                              </td>
                                            ) : null}
                                          </>
                                        )}
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={(() => {
                                      const base = 4; // Product, Qty, Price, Detail
                                      const extra = isDelivered ? (selectedOrder.cart?.some(i => !i.isEvent) ? 2 : 1) : 0; // Review + optional Refund
                                      return base + extra;
                                    })()} className="py-4 px-4 text-gray-700 text-center text-sm">
                                      No items available
                                    </td>
                                  </tr>
                                )}
                                <tr className="bg-white font-semibold">
                                  <td className="py-3 px-2 sm:px-4 text-right text-sm" colSpan={(() => {
                                    const base = 4;
                                    const extra = isDelivered ? (selectedOrder.cart?.some(i => !i.isEvent) ? 2 : 1) : 0;
                                    return base + extra - 1; // leave one column for total value
                                  })()}>
                                    Total:
                                  </td>
                                  <td className="py-3 px-2 sm:px-4 text-[#1C3B3C] text-sm sm:text-base">
                                    Br{selectedOrder.totalPrice?.toFixed(2) || "0.00"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Right Column - Shipping & Payment */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                      {/* Shipping Details */}
                      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Shipping Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Name:</span>
                            <span className="text-gray-600">{getUserDisplayName()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Address:</span>
                            <span className="text-gray-600 text-right">{selectedOrder.shippingAddress?.address1 || "N/A"}</span>
                          </div>
                          {selectedOrder.shippingAddress?.address2 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium"></span>
                              <span className="text-gray-600">{selectedOrder.shippingAddress?.address2}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">City:</span>
                            <span className="text-gray-600">{selectedOrder.shippingAddress?.city || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Country:</span>
                            <span className="text-gray-600">{selectedOrder.shippingAddress?.country || "ET"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Payment Info */}
                      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Amount Due (Birr)</h3>
                        <p className="text-2xl sm:text-3xl text-[#1C3B3C] mb-2">
                          Br{selectedOrder.totalPrice?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-gray-600 text-sm mb-4">Due on: {new Date().toLocaleDateString()}</p>
                       
                        <h3 className="text-lg sm:text-xl font-semibold mb-3">Payment Info</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status:</span>
                            <span
                              className={`font-medium px-3 py-1 rounded-full text-xs ${getPaymentStatusStyle(
                                selectedOrder.paymentInfo?.status
                              )}`}
                            >
                              {selectedOrder.paymentInfo?.status || "Not Paid"}
                            </span>
                          </div>
                          {(orderHasRejected || ["Processing refund", "Refund Success"].includes(selectedOrder.status)) && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Refund Status:</span>
                              <span
                                className={`font-medium px-3 py-1 rounded-full text-xs ${getRefundStatusStyle(orderHasRejected ? "Request Rejected" : selectedOrder.status)}`}
                              >
                                {orderHasRejected ? "Request Rejected" : selectedOrder.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                     
                      <button
                        className="w-full bg-[#CC9A00] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-[#E6B800] transition-colors duration-200 text-sm sm:text-base"
                        onClick={handleSendMessage}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                  {/* Review Modal */}
                  {reviewOpen && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setReviewOpen(false)}>
                      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-lg mx-auto relative" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "'Avenir LT Std', sans-serif" }}>
                        <button
                          onClick={() => setReviewOpen(false)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <AiOutlineClose size={20} />
                        </button>
                        <div className="bg-gradient-to-r from-[#1C3B3C] to-[#41666A] rounded-t-2xl p-4 text-white mb-4 sm:mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={getProductImageUrl(selectedItem.images && selectedItem.images[0]?.url)}
                                alt={selectedItem.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 object-cover"
                              />
                              <div>
                                <h3 className="font-semibold text-sm">{selectedItem.name || "Product Name"}</h3>
                                <p className="text-xs opacity-90">Product ID: {selectedItem._id?.slice(0, 8) || "N/A"}</p>
                              </div>
                            </div>
                            <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium">Review</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                rating >= i ? (
                                  <AiFillStar
                                    key={i}
                                    className="cursor-pointer text-yellow-400"
                                    size={24}
                                    onClick={() => setRating(i)}
                                  />
                                ) : (
                                  <AiOutlineStar
                                    key={i}
                                    className="cursor-pointer text-yellow-400"
                                    size={24}
                                    onClick={() => setRating(i)}
                                  />
                                )
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Write your review..."
                              className="w-full border border-gray-300 rounded-2xl p-3 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 resize-none h-32 text-sm"
                            />
                          </div>
                         
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            <button
                              onClick={() => setReviewOpen(false)}
                              className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={reviewHandler}
                              className="px-4 py-2 bg-yellow-400 text-white rounded-full text-sm hover:bg-yellow-300 transition-colors"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <RefundForm
                    isOpen={showRefundForm}
                    onClose={() => setShowRefundForm(false)}
                    orderId={selectedRefundOrderId}
                    item={selectedRefundItem}
                    onSubmit={handleRefundSubmit}
                    showToast={showToast}
                  />
                  {/* Product Details Modal */}
               {showProductModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[60] p-0 sm:p-4 pt-20 lg:items-center lg:pt-0">
    <div className="bg-white w-full max-w-none max-h-[calc(120vh-5rem)] overflow-y-auto relative rounded-none shadow-none lg:max-w-8xl lg:max-h-[300vh] lg:rounded-2xl lg:shadow-2xl">
      <button
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-[#FFF5CC] transition z-[70] flex items-center justify-center text-black lg:absolute lg:top-2 lg:right-2 lg:w-8 lg:h-8 lg:bg-gray-100 lg:shadow-none"
        onClick={closeProductModal}
      >
        <AiOutlineClose size={20} />
      </button>
      {productLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading product details...</p>
        </div>
      ) : selectedProduct ? (
        <div className="w-full p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Images & Video */}
            <div className="w-full lg:w-1/2">
              <div className="flex flex-col items-center">
                {/* Video Display (if available) */}
                {selectedProduct.video && (
                  <div className="w-full max-w-md mb-4">
                    <video
                      src={`${backend_url}${selectedProduct.video}`}
                      controls
                      className="w-full rounded-lg shadow-md"
                      poster={selectedProduct.images && selectedProduct.images[0]?.url ? `${backend_url}${selectedProduct.images[0].url}` : null}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {/* Images Carousel */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <>
                    <img
                      src={
                        selectedProduct.images[detailsImageIdx]?.url
                          ? `${backend_url}${selectedProduct.images[detailsImageIdx].url}`
                          : "https://via.placeholder.com/650"
                      }
                      alt={selectedProduct.name || "Product image"}
                      className="w-full max-w-md h-auto max-h-96 object-cover rounded-lg border-2 border-white"
                    />
                    <div className="mt-4 w-full max-w-md">
                      <div className="flex justify-center gap-2 mb-4">
                        {selectedProduct.images.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all ${
                              detailsImageIdx === i ? "bg-[#CC9A00] w-8" : "bg-gray-300 w-4"
                            }`}
                            onClick={() => setDetailsImageIdx(i)}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-2 overflow-x-auto">
                        {selectedProduct.images.map((i, index) => (
                          <div
                            key={index}
                            className="cursor-pointer flex-shrink-0"
                          >
                            <img
                              src={
                                i?.url
                                  ? `${backend_url}${i.url}`
                                  : "https://via.placeholder.com/140x100"
                              }
                              alt={`Thumbnail ${index}`}
                              className="w-16 h-12 sm:w-20 sm:h-14 object-cover border-2 border-white rounded-lg"
                              onClick={() => setDetailsImageIdx(index)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Product Details */}
            <div className="w-full lg:w-1/2 lg:pl-6">
              <button
                onClick={() => navigate(`/products?category=${selectedProduct.category}`)}
                className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
              >
                {getCategoryName(selectedProduct.category)}
              </button>
              <h1 className="text-xl sm:text-2xl text-[#1c3b3c] mb-2">
                {selectedProduct.name || "Unnamed Product"}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl text-[#1c3b3c]">
                    {selectedProduct.discountPrice
                      ? `${selectedProduct.discountPrice} Birr`
                      : "N/A"}
                  </h4>
                  {selectedProduct.originalPrice && (
                    <h3 className="text-gray-500 line-through text-sm">
                      {selectedProduct.originalPrice} Birr
                    </h3>
                  )}
                </div>
                <Ratings rating={selectedProduct?.ratings || 0} />
              </div>
              {/* Product Details Sections */}
              <div className="space-y-4">
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div>
                    <label className="text-gray-800 font-medium text-sm">Select Size</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          className="px-3 py-2 bg-gray-100 text-gray-800 rounded-[16px] hover:bg-gray-200 text-sm"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div>
                    <label className="text-gray-800 font-medium text-sm">Select Color</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          className="px-3 py-2 bg-gray-100 text-gray-800 rounded-[16px] hover:bg-gray-200 text-sm"
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-gray-800 font-medium text-sm">Stock</label>
                  <p className="text-gray-800 mt-1">
                    {selectedProduct.stock === undefined || selectedProduct.stock === null
                      ? "Not set"
                      : selectedProduct.stock}
                  </p>
                </div>
                <div className="border border-[#525252] rounded-lg p-3">
                  <p className="text-gray-600 text-sm">
                    {isDescriptionExpanded
                      ? selectedProduct.description
                      : truncatedDescription || "No description available"}
                    {isDescriptionLong && (
                      <span
                        className="text-[#CC9A00] cursor-pointer ml-1"
                        onClick={toggleDescription}
                      >
                        {isDescriptionExpanded ? " See Less" : " See More"}
                      </span>
                    )}
                  </p>
                </div>
                {discountPercent && (
                  <div className="bg-[#FFF6DB] text-[#CC9A00] rounded-lg p-3 flex items-center">
                    <img
                      src={peacImg}
                      alt="Offer"
                      className="w-8 h-8 mr-3 object-contain"
                    />
                    <p className="text-sm font-semibold">
                      Save {discountPercent}% today. Limited time offer!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Failed to load product details.</p>
        </div>
      )}
    </div>
  </div>
)}
                  {/* Event Details Modal */}
                {showEventModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
    <div className="bg-white w-full max-w-9xl max-h-[100vh] overflow-y-auto relative rounded-2xl shadow-2xl">
      <button
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
        onClick={closeEventModal}
      >
        <AiOutlineClose size={24} />
      </button>

      {eventLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading event details...</p>
        </div>
      ) : selectedEvent ? (
        <div className="w-full p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Images & Video */}
            <div className="w-full lg:w-1/2 relative">
              {/* Video (if available) */}
              {selectedEvent.video && (
                <video
                  src={`${backend_url}${selectedEvent.video}`}
                  controls
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md mb-6 object-cover"
                  poster={selectedEvent.images?.[0]?.url ? `${backend_url}${selectedEvent.images[0].url}` : null}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Main Image */}
              <img
                src={
                  selectedEvent.images?.[eventDetailsImageIdx]?.url
                    ? `${backend_url}${selectedEvent.images[eventDetailsImageIdx].url}`
                    : "https://via.placeholder.com/650"
                }
                alt={selectedEvent.name || "Event image"}
                className="w-full max-w-2xl h-auto max-h-[600px] mx-auto rounded-lg border-2 border-white object-cover"
              />

              {/* Indicators */}
              {selectedEvent.images?.length > 1 && (
                <div className="flex justify-center mt-6 gap-4">
                  {selectedEvent.images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full cursor-pointer ${
                        eventDetailsImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                      }`}
                      style={{ width: "60px", height: "4px" }}
                      onClick={() => setEventDetailsImageIdx(i)}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnails */}
              {selectedEvent.images?.length > 1 && (
                <div className="flex justify-center mt-6 flex-wrap gap-3">
                  {selectedEvent.images.map((i, index) => (
                    <img
                      key={index}
                      src={i?.url ? `${backend_url}${i.url}` : "https://via.placeholder.com/140x100"}
                      alt={`Thumbnail ${index}`}
                      className="w-20 h-16 object-cover rounded-lg border-2 border-white cursor-pointer"
                      onClick={() => setEventDetailsImageIdx(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full lg:w-1/2">
              <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                {selectedEvent.name || "Unnamed Event"}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                <div className="flex items-center">
                  <h4 className={`${styles.productDiscountPrice}`}>
                    {selectedEvent.discountPrice || selectedEvent.price ? `${selectedEvent.discountPrice || selectedEvent.price} Birr` : "N/A"}
                  </h4>
                  {selectedEvent.originalPrice && (
                    <h3 className={`${styles.price} ml-3`}>{selectedEvent.originalPrice} Birr</h3>
                  )}
                </div>
                <Ratings rating={selectedEvent?.ratings || 0} />
              </div>

              {/* Date & Time + Location */}
              {/* <div className="mt-6 space-y-4">
                <div>
                  <label className="text-gray-800 font-light block mb-1">Date & Time</label>
                  <p className="text-gray-800">{selectedEvent.dateTime || "Not set"}</p>
                </div>
                <div>
                  <label className="text-gray-800 font-light block mb-1">Location</label>
                  <p className="text-gray-800">{selectedEvent.location || "Not set"}</p>
                </div>
              </div> */}

              {/* Size Selection */}
              {selectedEvent.sizes?.length > 0 && (
                <div className="mt-6">
                  <label className="text-gray-800 font-light block mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.sizes.map((size) => (
                      <button
                        key={size}
                        className={`px-4 py-2 rounded-[16px] text-sm ${
                          modalSelectedSize === size ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                        } hover:bg-gray-300`}
                        onClick={() => setModalSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {selectedEvent.colors?.length > 0 && (
                <div className="mt-6">
                  <label className="text-gray-800 font-light block mb-2">Select Color</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.colors.map((color) => (
                      <button
                        key={color}
                        className={`px-4 py-2 rounded-[16px] text-sm ${
                          modalSelectedColor === color ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                        } hover:bg-gray-300`}
                        onClick={() => setModalSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Cart + Wishlist */}
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center">
                  <button
                    className="w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center hover:bg-gray-200"
                    onClick={decrementModalCount}
                  >
                    -
                  </button>
                  <span className="mx-4 text-lg font-medium">{modalCount}</span>
                  <button
                    className="w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center hover:bg-gray-200"
                    onClick={incrementModalCount}
                  >
                    +
                  </button>
                </div>

                <button
                  className="bg-[#CC9A00] text-white py-3 px-8 rounded-[16px] flex items-center hover:bg-yellow-600 text-base"
                  // onClick={modalAddToCart}
                >
                  <AiOutlineShoppingCart className="mr-2" size={20} /> Add to Cart
                </button>

                <div className="w-12 h-12 bg-gray-50 rounded-[16px] flex items-center justify-center cursor-pointer">
                  {modalClick ? (
                    <AiFillHeart
                      size={28}
                      color="red"
                      // onClick={modalRemoveFromWishlist}
                    />
                  ) : (
                    <AiOutlineHeart
                      size={28}
                      // onClick={modalAddToWishlist}
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 p-4 border border-[#525252] rounded-lg">
                <p className="text-gray-600">
                  {isEventDescriptionExpanded
                    ? selectedEvent.description
                    : selectedEvent.description?.slice(0, 100) + "..."}
                  {selectedEvent.description?.length > 100 && (
                    <span
                      className="text-[#CC9A00] cursor-pointer ml-2"
                      onClick={toggleEventDescription}
                    >
                      {isEventDescriptionExpanded ? "See Less" : "See More"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Failed to load event details.</p>
        </div>
      )}
    </div>
  </div>
)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  if (active === 6) {
    const passwordChangeHandler = async (e) => {
      e.preventDefault();
      try {
        const res = await api.put(
          `${server}/user/update-user-password`,
          { oldPassword, newPassword, confirmPassword },
          { withCredentials: true }
        );
        showToast("success", "Password Updated", res.data.message || "Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        showToast("error", "Password Update Failed", error.response?.data?.message || "Failed to update password");
      }
    };
    return (
      <div className="w-full">
        <div className="relative min-h-screen w-full flex flex-col items-center font-[Avenir LT Std] text-sm overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10 w-full max-w-xl border border-1 rounded-3xl sm:rounded-[50px] z-10 text-center mt-4 sm:mt-6 mb-6 sm:mb-10 bg-white mx-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-6 sm:mb-8 font-normal font-[Quesha]">Change Password</h2>
            <form className="flex flex-col items-center gap-4 sm:gap-5 w-full" onSubmit={passwordChangeHandler}>
              <div className="relative w-full max-w-sm text-left">
                <label className="block mb-1 ml-2 text-gray-700 text-sm">Old Password</label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-3 text-[#FAC50C]" size={15} />
                  <input
                    type={visibleOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black text-sm"
                    placeholder="Enter your old password"
                    required
                  />
                  {visibleOld ? (
                    <AiOutlineEye
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleOld(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleOld(true)}
                    />
                  )}
                </div>
              </div>
              <div className="relative w-full max-w-sm text-left">
                <label className="block mb-1 ml-2 text-gray-700 text-sm">New Password</label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-3 text-[#FAC50C]" size={15} />
                  <input
                    type={visibleNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black text-sm"
                    placeholder="Enter your new password"
                    required
                  />
                  {visibleNew ? (
                    <AiOutlineEye
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleNew(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleNew(true)}
                    />
                  )}
                </div>
              </div>
              <div className="relative w-full max-w-sm text-left">
                <label className="block mb-1 ml-2 text-gray-700 text-sm">Confirm Password</label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-4 top-3 text-[#FAC50C]" size={15} />
                  <input
                    type={visibleConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black text-sm"
                    placeholder="Confirm your new password"
                    required
                  />
                  {visibleConfirm ? (
                    <AiOutlineEye
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleConfirm(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-3 top-3 cursor-pointer text-gray-400"
                      size={15}
                      onClick={() => setVisibleConfirm(true)}
                    />
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#CC9A00] text-white px-6 py-3 rounded-full transition hover:bg-yellow-400 w-full max-w-sm mx-auto text-sm sm:text-base"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
 
  if (active === 7) {
    return (
      <div className="w-full px-4 sm:px-8 pt-1 mt-6 sm:mt-10 bg-white">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">My Addresses</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium w-full sm:w-auto"
              >
                Add New Address
              </button>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden">
            {user && user.addresses?.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((address) => (
                  <AddressCard key={address._id} address={address} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700 text-sm">You have no saved addresses!</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-500 text-xs sm:text-sm">
                    <th className="py-2 px-2 sm:px-4 text-left font-medium">Address Type</th>
                    <th className="py-2 px-2 sm:px-4 text-left font-medium">Country</th>
                    <th className="py-2 px-2 sm:px-4 text-left font-medium">City</th>
                    <th className="py-2 px-2 sm:px-4 text-left font-medium">Address</th>
                    <th className="py-2 px-2 sm:px-4 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {user && user.addresses?.length > 0 ? (
                    user.addresses.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{item.addressType || "Default"}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{item.country || "Ethiopia"}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{State.getStateByCodeAndCountry(item.city, "ET")?.name || item.city || "N/A"}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">{item.address1 || "N/A"}</td>
                        <td className="py-2 px-2 sm:px-4 text-left">
                         <button onClick={() => confirmDelete(item._id)}>
  <AiOutlineDelete size={18} className="text-gray-600 hover:text-red-500 cursor-pointer" />
</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 px-4 text-center text-gray-700 text-sm">
                        You have no saved addresses!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

{showDeleteConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete address?</h2>
      <p className="text-sm text-gray-600 mb-4 sm:mb-6">
        This will delete the selected address. You won't be able to undo this action.
      </p>
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition text-sm order-1 sm:order-2"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

        {/* Address Modal */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto relative rounded-2xl shadow-2xl">
              <button
                className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
                onClick={() => {
                  setOpen(false);
                  resetAddressForm();
                }}
              >
                <AiOutlineClose />
              </button>
              <div className="text-center my-4 sm:my-6">
                <img src={peacImg} alt="Peac Logo" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 animate-bounce" />
                <div className="w-3/4 sm:w-1/2 mx-auto bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 2) * 100}%` }}></div>
                </div>
                <p className="text-gray-500 text-sm mt-2">Step {step} of 2</p>
              </div>
              
              {step === 1 && (
                <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                  <h6 className="text-2xl sm:text-3xl lg:text-4xl text-center font-['Quesha'] text-gray-800 mb-4 sm:mb-6">Enter Address</h6>
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className={`mt-4 p-3 rounded-lg w-full max-w-xs flex items-center justify-center text-sm ${
                      isLoadingLocation ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#1F2937] text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoadingLocation ? 'Loading Location...' : 'Use Current Location'}
                  </button>
                  <div className="mt-4 w-full max-w-md relative">
                    <label className="block text-gray-600 mb-2 text-sm">Address</label>
                    <input
                      type="text"
                      value={address1}
                      onChange={handleAddressChange}
                      className={`block w-full px-4 sm:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left text-sm ${
                        addressError ? "border-red-500" : ""
                      }`}
                      placeholder="E.g., Bole Road, House No. 123, landmark"
                    />
                    {addressError && <p className="text-red-500 text-xs mt-1">{addressError}</p>}
                    {isLoadingSuggestions && <p className="text-gray-500 text-xs mt-1">Searching...</p>}
                    {addressSuggestions.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                        {addressSuggestions.map((item, index) => (
                          <li
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                            onClick={() => selectSuggestion(item)}
                          >
                            {item.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end w-full max-w-md">
                    <button
                      className="px-4 sm:px-6 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition text-sm"
                      onClick={nextStep}
                    >
                      <AiOutlineArrowRight className="mr-2" /> Next
                    </button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                  <h6 className="text-2xl sm:text-3xl lg:text-4xl font-['Quesha'] text-gray-800 mb-4 sm:mb-6">Select Address Type and Review</h6>
                  <div className="mt-4 w-full max-w-md">
                    <label className="block text-gray-600 mb-2 text-sm">Address Type</label>
                    <select
                      value={addressType}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left text-sm"
                    >
                      <option value="">Choose address type</option>
                      {addressTypeData.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-6 w-full max-w-md">
                    <h6 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Review Address Details</h6>
                    <div className="bg-[#faf9f6] p-4 rounded-lg text-sm">
                      <p><strong>Country:</strong> Ethiopia</p>
                      <p><strong>City:</strong> {State.getStateByCodeAndCountry(city, "ET")?.name || city || "N/A"}</p>
                      <p><strong>Address:</strong> {address1 || "N/A"}</p>
                      <p><strong>Address Type:</strong> {addressType || "N/A"}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between w-full max-w-md">
                    <button
                      className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                      onClick={prevStep}
                    >
                      <AiOutlineArrowLeft size={16} />
                    </button>
                    <button
                      className="px-4 sm:px-6 py-2 bg-[#FFC300] text-white rounded-full text-sm font-semibold hover:bg-[#FFD700]"
                      onClick={handleAddressSubmit}
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (active === 9) {
    return (
      <div className="w-full px-4 sm:px-8 pt-1 mt-6 sm:mt-10 bg-white">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Deactivate Account</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* <button
                onClick={() => setShowDeactivateConfirm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-600 rounded-lg text-red-600 bg-transparent hover:bg-red-50 text-sm font-medium w-full sm:w-auto"
              >
                Deactivate Account
              </button> */}
            </div>
          </div>
          <div className="p-4 bg-[#faf9f6] rounded-lg">
            <p className="text-gray-700 text-sm sm:text-base">
              Deactivating your account will permanently remove your profile and associated data. This action cannot be undone.
            </p>
            <p className="text-gray-700 mt-2 text-sm sm:text-base">
              If you are sure you want to proceed, click the "Deactivate Account" button above to confirm.
            </p>
          </div>
        </div>

        {showDeactivateConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Account Deactivation</h2>
              <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                Are you sure you want to deactivate your account? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition text-sm order-2 sm:order-1"
                  onClick={() => setShowDeactivateConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-sm order-1 sm:order-2"
                  onClick={() => {
                    handleDeactivate();
                    setShowDeactivateConfirm(false);
                  }}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProfileContent;