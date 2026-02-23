import React, { useEffect, useState } from "react";
import { BsEye, BsX, BsInfoCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { server, backend_url } from "../../server";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import { getAllOrdersOfAdmin, updateAdminOrderStatus } from "../../redux/actions/order";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import peacImg from "../../Assests/images/peac.png";

const AdminOrderDetails = ({ orderId, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { categories } = useSelector((state) => state.category);
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [deliveryList, setDeliveryList] = useState([]);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [deliveryRequest, setDeliveryRequest] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [rejectReasons, setRejectReasons] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [count, setCount] = useState(1);

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

  const baseStatusOptions = [
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const refundStatusOptions = ["Pending", "Vendor Approved", "Rejected", "Refund Success"];

  const getAvailableStatuses = () => {
    if (data?.status === "Delivered") {
      return [];
    }
    return baseStatusOptions.filter(option => {
      const statusOrder = { Processing: 0, Shipped: 1, Delivered: 2 };
      return statusOrder[option] > statusOrder[data?.status || "Processing"];
    });
  };

  const statusOptions = getAvailableStatuses();

  const canUpdateStatus = statusOptions.length > 0 && !["Refund Requested", "Refund Processed"].includes(data?.status);
  const hasRefundRequests = (data?.refundRequests?.length > 0) || (data?.isMaster && data.subOrders?.some(sub => sub.refundRequests?.length > 0));
  const hasPendingRefunds = (data?.refundRequests?.some(r => ["Pending", "Vendor Approved"].includes(r.status))) || (data?.isMaster && data.subOrders?.some(sub => sub.refundRequests?.some(r => ["Pending", "Vendor Approved"].includes(r.status))));
  const canManageRefund = hasPendingRefunds || data?.status === "Refund Requested";
  const canViewRefundStatus = (user?.role === "Admin") && (hasRefundRequests || ["Refund Requested", "Processing refund", "Refund Success", "Delivered"].includes(data?.status));

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  useEffect(() => {
    if (data) {
      setStatus(data.status || "");
      if (hasRefundRequests) {
        setActiveSection("Manage Refund");
      } else {
        setActiveSection("Update Order Status");
      }
    }
  }, [data?.status, hasRefundRequests]);

  const fetchOrderData = async () => {
    try {
      const { data: orderData } = await axios.get(`${server}/order/get-order/${orderId}`, {
        withCredentials: true,
      });
      setData(orderData.order);
      if (orderData.order?.user?._id && (!orderData.order.user.name || !orderData.order.user.email)) {
        setIsUserLoading(true);
        const { data: userResponse } = await axios.get(
          `${server}/user/user-info/${orderData.order.user._id}`,
          { withCredentials: true }
        );
        setUserData(userResponse.user);
        setIsUserLoading(false);
      } else {
        setUserData(orderData.order.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        showToast("error", "Fetch Failed", "Failed to fetch order data.");
      }
    }
  };

  const orderUpdateHandler = async () => {
    if (!status || status === data?.status) {
      showToast("error", "Invalid Status", "Please select a different status.");
      return;
    }
    try {
      await dispatch(updateAdminOrderStatus(orderId, status));
      showToast("success", "Status Updated", "Order status updated successfully!");
      dispatch(getAllOrdersOfAdmin());
      onClose();
    } catch (error) {
      showToast("error", "Update Failed", error.response?.data?.message || "Failed to update order status.");
    }
  };

  const refundActionHandler = async (newStatus, targetOrderId, refundRequestIndex) => {
    const reasonKey = `${targetOrderId}_${refundRequestIndex}`;
    const rejectReason = rejectReasons[reasonKey];
    if (newStatus === "Rejected" && !rejectReason?.trim()) {
      showToast("error", "Missing Reason", "Please provide a reject reason.");
      return;
    }

    try {
      await axios.put(
        `${server}/order/order-refund-success/${targetOrderId}`,
        {
          refundRequestIndex,
          status: newStatus,
          ...(newStatus === "Rejected" && { rejectReason }),
        },
        { withCredentials: true }
      );

      showToast("success", "Refund Processed", `Refund ${newStatus === "Refund Success" ? "accepted" : "rejected"} successfully!`);

      setRejectReasons(prev => {
        const newState = { ...prev };
        delete newState[reasonKey];
        return newState;
      });

      await fetchOrderData();
    } catch (error) {
      showToast("error", "Refund Failed", error.response?.data?.message || `Failed to ${newStatus === "Refund Success" ? "accept" : "reject"} refund.`);
    }
  };

  const openItemDetails = async (item) => {
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setCount(1);

    // If item has a product id, fetch canonical product details to ensure images are correct
    if (item?._id) {
      setShowItemModal(true);
      setSelectedItem(null);
      try {
        const { data: res } = await axios.get(`${server}/product/detail/${item._id}`);
        if (res?.product) {
          setSelectedItem(res.product);
          return;
        }
      } catch (error) {
        // fallback to using provided item data
        console.warn("Failed to fetch product detail, falling back to cart item:", error?.message || error);
      }
    }

    // Normalize local item images (fallback path formats)
    const normalizedImages = [];
    if (item?.images) {
      if (Array.isArray(item.images)) {
        item.images.forEach((img) => {
          if (!img) return;
          if (typeof img === "string") normalizedImages.push({ url: img });
          else if (img.url) normalizedImages.push({ url: img.url });
        });
      }
    }
    if (item?.image && typeof item.image === "string") normalizedImages.push({ url: item.image });

    const newItem = { ...item, images: normalizedImages };
    setSelectedItem(newItem);
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setCount(1);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.title : "Unknown";
  };

  const discountPercent = selectedItem?.originalPrice && selectedItem?.originalPrice > selectedItem?.discountPrice
    ? Math.round(((selectedItem.originalPrice - selectedItem.discountPrice) / selectedItem.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedItem?.description && selectedItem.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedItem.description.slice(0, descriptionLimit) + "..."
    : selectedItem?.description;

  const getStatusColor = (status) => {
    const normalizedStatus = status === "completed" ? "Delivered" : status === "declined" ? "Canceled" : status;
    return {
      Pending: "bg-yellow-100 text-yellow-800",
      "Transferred to delivery partner": "bg-blue-100 text-blue-800",
      Canceled: "bg-red-100 text-red-800",
      Delivered: "bg-green-100 text-green-800",
      "Processing refund": "bg-yellow-100 text-yellow-800",
      "Refund Success": "bg-green-100 text-green-800",
      Processing: "bg-yellow-100 text-yellow-800",
      Shipping: "bg-blue-100 text-blue-800",
      Received: "bg-blue-100 text-blue-800",
      "On the way": "bg-blue-100 text-blue-800",
      "Refund Requested": "bg-yellow-100 text-yellow-800",
      "Refund Processed": "bg-green-100 text-green-800",
    }[normalizedStatus] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusStyle = (status) => {
    if (status?.toLowerCase() === "succeeded") {
      return "bg-[#DCFCE7] text-[#16A34A] rounded-full";
    }
    return "bg-[#FEF9C3] text-[#854D0E] rounded-full";
  };

  const getUserDisplayName = () => {
    if (isUserLoading) return "Loading...";
    if (userData?.name) return userData.name;
    if (data?.user?.name) return data.user.name;
    return "Guest User";
  };

  const getUserContactInfo = () => {
    if (isUserLoading) return "Loading...";
    if (userData?.email) return userData.email;
    if (userData?.phoneNumber) return userData.phoneNumber;
    if (data?.user?.email) return data.user.email;
    if (data?.user?.phoneNumber) return data.user.phoneNumber;
    return "N/A";
  };

  const getRefundImageUrl = (refundImage) => {
    if (!refundImage) return `${backend_url.replace(/\/$/, '')}/Uploads/refund_images/default_refund_image.png`;
    if (refundImage.startsWith("http")) return refundImage;
    return `${backend_url.replace(/\/$/, '')}/${refundImage.replace(/^\//, '')}`;
  };

  const isVideoUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    // check file extension OR typical upload folders for videos/events
    const extMatch = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
    const pathMatch = /Uploads\/(videos|events)|\/videos\//i.test(url);
    return extMatch || pathMatch;
  };

  const getMediaUrl = (url) => {
    if (!url) return `${backend_url.replace(/\/$/, '')}/uploads/placeholder-image.jpg`;
    if (url.startsWith("http")) return url;
    // normalize /Uploads/ -> /uploads/ to match backend static mount
    const normalized = url.replace(/^\/?Uploads\//i, "uploads/").replace(/^\//, "");
    return `${backend_url.replace(/\/$/, '')}/${normalized}`;
  };

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  const renderRefundRequests = () => {
    // ... (unchanged, same as original)
    const masterRefunds = data?.refundRequests || [];
    const subOrders = data?.subOrders || [];

    const anySubRefunds = subOrders.some(sub => sub.refundRequests?.length > 0);
    if (masterRefunds.length === 0 && !anySubRefunds) {
      return <p className="text-gray-200">No refund requests for this order.</p>;
    }

    return (
      <>
        {masterRefunds.length > 0 && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h5 className="text-white font-semibold mb-3">Master Order Refunds</h5>
            {masterRefunds.map((req, index) => {
              const reasonKey = `${data._id}_${index}`;
              const isPending = req.status === "Pending";
              const imageSrc = getRefundImageUrl(req.image);
              return (
                <div key={`master-${index}`} className="bg-gray-800 p-6 rounded-xl mb-4 shadow-md border border-gray-600">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {req.image && (
                        <img
                          src={imageSrc}
                          alt={`Refund Image for ${req.itemId}`}
                          className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageModal(imageSrc)}
                          onError={(e) => (e.target.src = `${backend_url.replace(/\/$/, '')}/uploads/refund_images/default_refund_image.png`)}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BsInfoCircle className="w-5 h-5 text-yellow-400" />
                        <p className="text-white font-medium">Item ID: {req.itemId?.slice(-8) || "N/A"}</p>
                      </div>
                      <p className="text-gray-200 mb-2">Quantity: <span className="font-semibold">{req.refundedQty}</span> out of <span className="font-semibold">{req.originalQty}</span></p>
                      <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-400 mb-3">
                        <p className="text-yellow-200 font-medium mb-1 flex items-center gap-2">
                          <BsInfoCircle className="w-4 h-4" />
                          Refund Reason
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">{req.reason}</p>
                      </div>
                      <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(req.status)}`}>
                        Status: {req.status}
                      </p>
                      {req.rejectReason && (
                        <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30 mb-2">
                          <p className="text-red-300 text-sm flex items-center gap-2">
                            <BsX className="w-4 h-4" />
                            Reject Reason: {req.rejectReason}
                          </p>
                        </div>
                      )}
                      {canManageRefund && isPending && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 p-3 bg-gray-900/50 rounded-lg">
                          <button
                            onClick={() => refundActionHandler("Refund Success", data._id, index)}
                            className="bg-[#FFB800] text-white rounded-full hover:bg-[#FFB800]/90 font-medium w-[7rem] h-[3rem] transition-colors duration-200"
                          >
                            Accept
                          </button>
                          <div className="flex flex-col gap-2 flex-1 sm:flex-none">
                            <div className="flex gap-2">
                              <button
                                onClick={() => refundActionHandler("Rejected", data._id, index)}
                                className="bg-transparent border-2 border-[#FFB800] text-[#FFB800] rounded-full hover:bg-[#FFB800]/90 hover:text-white font-medium w-[7rem] h-[3rem] transition-colors duration-200"
                              >
                                Reject
                              </button>
                              <textarea
                                value={rejectReasons[reasonKey] || ""}
                                onChange={(e) => setRejectReasons(prev => ({ ...prev, [reasonKey]: e.target.value }))}
                                placeholder="Enter reject reason..."
                                className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white focus:outline-none focus:border-[#CC9A00] w-full sm:w-64 h-20 resize-none"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subOrders.map((sub) => (
          sub.refundRequests?.length > 0 && (
            <div key={sub._id} className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h5 className="text-white font-semibold mb-3">Sub-Order from Shop: {sub.shop?.name || sub.shop || "N/A"}</h5>
              {sub.refundRequests.map((req, index) => {
                const reasonKey = `${sub._id}_${index}`;
                const isPending = req.status === "Pending";
                const imageSrc = getRefundImageUrl(req.image);
                return (
                  <div key={index} className="bg-gray-800 p-6 rounded-xl mb-4 shadow-md border border-gray-600">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {req.image && (
                          <img
                            src={imageSrc}
                            alt={`Refund Image for ${req.itemId}`}
                            className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageModal(imageSrc)}
                            onError={(e) => (e.target.src = `${backend_url.replace(/\/$/, '')}/uploads/refund_images/default_refund_image.png`)}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BsInfoCircle className="w-5 h-5 text-yellow-400" />
                          <p className="text-white font-medium">Item ID: {req.itemId?.slice(-8) || "N/A"}</p>
                        </div>
                        <p className="text-gray-200 mb-2">Quantity: <span className="font-semibold">{req.refundedQty}</span> out of <span className="font-semibold">{req.originalQty}</span></p>
                        <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-400 mb-3">
                          <p className="text-yellow-200 font-medium mb-1 flex items-center gap-2">
                            <BsInfoCircle className="w-4 h-4" />
                            Refund Reason
                          </p>
                          <p className="text-gray-300 text-sm leading-relaxed">{req.reason}</p>
                        </div>
                        <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(req.status)}`}>
                          Status: {req.status}
                        </p>
                        {req.rejectReason && (
                          <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/30 mb-2">
                            <p className="text-red-300 text-sm flex items-center gap-2">
                              <BsX className="w-4 h-4" />
                              Reject Reason: {req.rejectReason}
                            </p>
                          </div>
                        )}
                        {canManageRefund && isPending && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-4 p-3 bg-gray-900/50 rounded-lg">
                            <button
                              onClick={() => refundActionHandler("Refund Success", sub._id, index)}
                              className="bg-[#FFB800] text-white rounded-full hover:bg-[#FFB800]/90 font-medium w-[7rem] h-[3rem] transition-colors duration-200"
                            >
                              Accept
                            </button>
                            <div className="flex flex-col gap-2 flex-1 sm:flex-none">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => refundActionHandler("Rejected", sub._id, index)}
                                  className="bg-transparent border-2 border-[#FFB800] text-[#FFB800] rounded-full hover:bg-[#FFB800]/90 hover:text-white font-medium w-[7rem] h-[3rem] transition-colors duration-200"
                                >
                                  Reject
                                </button>
                                <textarea
                                  value={rejectReasons[reasonKey] || ""}
                                  onChange={(e) => setRejectReasons(prev => ({ ...prev, [reasonKey]: e.target.value }))}
                                  placeholder="Enter reject reason..."
                                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white focus:outline-none focus:border-[#CC9A00] w-full sm:w-64 h-20 resize-none"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ))}
      </>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center mt-5 z-50 font-avenir">
        <div className="relative bg-gray-50 w-full max-w-8xl rounded-xl shadow-lg overflow-y-auto max-h-[calc(110vh-5rem)]">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white bg-[#F3F4F6] hover:bg-[#1B3B3E] rounded-full p-2 transition-colors duration-200"
            title="Close"
          >
            <BsX className="w-6 h-6 text-[#1B3B3E] hover:text-white" />
          </button>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div className="bg-white rounded-t-xl p-4 mb-4" style={{ borderBottom: "1px solid #CC9A00" }}>
                  <h2 className="text-lg font-semibold text-black">
                    Order ID: <span className="text-black font-bold">#{data?._id || "N/A"}</span>
                  </h2>
                  <p className="text-sm text-black">Placed on: {data?.createdAt?.slice(0, 10) || "N/A"}</p>
                </div>

                <div className="bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white rounded-xl p-6 shadow-md mb-6">
                  <h3 className="text-xl font-semibold mb-4">Order Management</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {canUpdateStatus && (
                      <button
                        onClick={() => setActiveSection("Update Order Status")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 ${
                          activeSection === "Update Order Status"
                            ? "border-[#CC9A00] text-[#CC9A00]"
                            : "border-transparent hover:text-[#CC9A00]"
                        }`}
                      >
                        Update Order Status
                      </button>
                    )}
                    {canViewRefundStatus && (
                      <button
                        onClick={() => setActiveSection("Manage Refund")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 ${
                          activeSection === "Manage Refund"
                            ? "border-[#CC9A00] text-[#CC9A00]"
                            : "border-transparent hover:text-[#CC9A00]"
                        }`}
                      >
                        Manage Refund
                      </button>
                    )}
                  </div>

                  {activeSection === "Update Order Status" && canUpdateStatus && (
                    <div className="p-4 rounded-lg">
                      <p
                        className={`inline-block px-4 py-2 rounded-full font-medium mb-4 ${getStatusColor(data?.status)}`}
                      >
                        {data?.status || "N/A"}
                      </p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {statusOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setStatus(option)}
                            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                              status === option
                                ? "border-2 border-[#CC9A00] text-[#CC9A00] bg-white"
                                : "bg-white hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={orderUpdateHandler}
                        className="bg-[#CC9A00] text-white px-6 py-2 rounded-full hover:bg-[#E6B800] transition-colors duration-200"
                        disabled={!status || status === data?.status}
                      >
                        Update Status
                      </button>
                    </div>
                  )}

                  {activeSection === "Manage Refund" && canViewRefundStatus && (
                    <div className="p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 text-white">Refund Requests</h4>
                      {renderRefundRequests()}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm">
                          <th className="py-2 px-4 text-left font-medium">Product ID</th>
                          <th className="py-2 px-4 text-left font-medium">Product</th>
                          <th className="py-2 px-4 text-left font-medium">Quantity</th>
                          <th className="py-2 px-4 text-left font-medium">Price</th>
                          <th className="py-2 px-4 text-left font-medium">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data?.cart?.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-900 font-semibold">
                              {item._id?.slice(-8) || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-semibold">
                              <div className="flex flex-col">
                                <span>{item.name || "N/A"}</span>
                                {item.selectedSize && (
                                  <span className="text-xs text-gray-500">Size: {item.selectedSize}</span>
                                )}
                                {item.selectedColor && (
                                  <span className="text-xs text-gray-500">Color: {item.selectedColor}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.qty || 0}</td>
                            <td className="py-3 px-4 text-gray-700">
                              {item.discountPrice} Birr
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => openItemDetails(item)}
                                className="text-[#CC9A00] hover:text-[#E6B800] p-1"
                                title={`View details for ${item.name || "Item"}`}
                              >
                                <BsEye className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="5" className="py-3 px-4 text-gray-700 text-center">
                              No items available
                            </td>
                          </tr>
                        )}
                        <tr className="bg-white font-semibold">
                          <td className="py-3 px-4 text-right" colSpan="4">
                            Total:
                          </td>
                          <td className="py-3 px-4 text-[#1C3B3C]">{data?.totalPrice} Birr</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipping Details</h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-[#1C3B3C] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{getUserDisplayName()}</p>
                      <p className="text-gray-600 text-sm">{getUserContactInfo()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <span className="font-medium">Address:</span>
                    <span>{data?.shippingAddress?.address1 || "N/A"}</span>
                    <span className="font-medium">City:</span>
                    <span>{data?.shippingAddress?.city || "N/A"}</span>
                    <span className="font-medium">Country:</span>
                    <span>{data?.shippingAddress?.country || "N/A"}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4"> Amount Due (Birr)</h3>
                  <p className="text-3xl font-bold text-[#1C3B3C] mb-2">
                    {data?.totalPrice} Birr
                  </p>
                  <p className="text-gray-600 mb-4">Due on: {new Date().toLocaleDateString()}</p>
                  <h3 className="text-xl font-semibold mb-4">Payment Info</h3>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span className={`font-medium px-3 py-1.5 ${getPaymentStatusStyle(data?.paymentInfo?.status)}`}>
                      {data?.paymentInfo?.status || "Not Paid"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors duration-200 z-10"
              title="Close image"
            >
              <BsX className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full refund image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Item Details Modal - Now matches AllEvents details style */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] h-screen w-screen">
          <div className="bg-white w-full max-w-8xl h-[100vh] mt-10 overflow-y-auto relative rounded-2xl shadow-2xl p-6">
            <button
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
              onClick={closeItemModal}
            >
              <BsX size={20} />
            </button>
            <div className="w-[90%] mx-auto py-5">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2">
                  {/* Main media: video if video url else image */}
                  {(() => {
                    const candidate = selectedItem.video || selectedItem.images && selectedItem.images[detailsImageIdx]?.url;
                    const src = getMediaUrl(candidate);
                    if (isVideoUrl(candidate)) {
                      return (
                        <video
                          src={src}
                          controls
                          className="w-[550px] h-[500px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover bg-black"
                          onError={(e) => {
                            e.target.onerror = null;
                            // replace video with poster image
                            e.target.poster = `${backend_url.replace(/\/$/, '')}/uploads/placeholder-image.jpg`;
                          }}
                        />
                      );
                    }
                    return (
                      <img
                        src={src}
                        alt={selectedItem.name || "Item image"}
                        className="w-[550px] h-[500px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${backend_url.replace(/\/$/, '')}/uploads/placeholder-image.jpg`;
                        }}
                      />
                    );
                  })()}
                  <div className="relative">
                    <div className="absolute top-[-25rem] w-[550px] flex justify-center">
                      <div className="flex items-center space-x-4">
                        {selectedItem.images && [...Array(selectedItem.images.length)].map((_, i) => (
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
                      {selectedItem.images && selectedItem.images.map((i, index) => (
                        <div
                          key={index}
                          className="cursor-pointer mx-2"
                        >
                          {isVideoUrl(i?.url) ? (
                            <video
                              src={getMediaUrl(i.url)}
                              className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                              muted
                              playsInline
                              onClick={() => setDetailsImageIdx(index)}
                              onError={(e) => {
                                e.target.onerror = null;
                                // show placeholder image by creating an <img> fallback
                                e.target.parentNode.innerHTML = ` <img src="${backend_url.replace(/\/$/, '')}/uploads/placeholder-image.jpg" class="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"/> `;
                              }}
                            />
                          ) : (
                            <img
                              src={getMediaUrl(i?.url)}
                              alt={`Thumbnail ${index}`}
                              className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                              onClick={() => setDetailsImageIdx(index)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${backend_url.replace(/\/$/, '')}/uploads/placeholder-image.jpg`;
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Link to={`/shop/preview/${selectedItem?.shop?._id}`}>
                            <img
                              src={
                                selectedItem?.shop?.avatar?.url
                                    ? (selectedItem.shop.avatar.url.startsWith('http') ? selectedItem.shop.avatar.url : `${backend_url.replace(/\/$/, '')}/${selectedItem.shop.avatar.url.replace(/^\//, '')}`)
                                    : `${backend_url.replace(/\/$/, '')}/uploads/avatar/avatar-1754729528346-341457281.jpg`
                              }
                              alt={selectedItem.shop?.name || "Shop"}
                              className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                  e.target.src = `${backend_url.replace(/\/$/, '')}/uploads/avatar/avatar-1754729528346-341457281.jpg`;
                              }}
                            />
                          </Link>
                          <div>
                            <Link to={`/shop/preview/${selectedItem?.shop?._id}`}>
                              <h3 className={`${styles.shop_name}`}>
                                {selectedItem.shop?.name || "Unknown Shop"}
                              </h3>
                            </Link>
                            <div className="flex mt-1">
                              <Ratings rating={selectedItem?.ratings || 0} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                  <button
                    onClick={() => navigate(`/products?category=${selectedItem.category}`)}
                    className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
                  >
                    {getCategoryName(selectedItem.category)}
                  </button>
                  <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                    {selectedItem.name || "Unnamed Item"}
                  </h1>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <h4 className={`${styles.productDiscountPrice}`}>
                        {selectedItem.discountPrice
                          ? `${selectedItem.discountPrice} Birr`
                          : "N/A"}
                      </h4>
                      {selectedItem.originalPrice && (
                        <h3 className={`${styles.price} ml-2`}>
                          {selectedItem.originalPrice} Birr
                        </h3>
                      )}
                    </div>
                    <div>
                      <Ratings rating={selectedItem?.ratings || 0} />
                    </div>
                  </div>

                  {/* Event Dates - shown only if present (matches AllEvents) */}
                  {selectedItem.start_Date && selectedItem.Finish_Date && (
                    <div className="mt-4 md:mt-6">
                      <label className="text-gray-800 font-light">Event Dates</label>
                      <p className="text-gray-800 mt-2">
                        {new Date(selectedItem.start_Date).toLocaleDateString()} -{" "}
                        {new Date(selectedItem.Finish_Date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 md:mt-6">
                    <label className="text-gray-800 font-light">Select Size</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem.sizes && Array.isArray(selectedItem.sizes) && selectedItem.sizes.length > 0 ? (
                        selectedItem.sizes.map((size) => (
                          <button
                            key={size}
                            className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No sizes available</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <label className="text-gray-800 font-light">Select Color</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem.colors && Array.isArray(selectedItem.colors) && selectedItem.colors.length > 0 ? (
                        selectedItem.colors.map((color) => (
                          <button
                            key={color}
                            className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
                          >
                            {color}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No colors available</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <label className="text-gray-800 font-light">Stock</label>
                    <p className="text-gray-800 mt-2">
                      {selectedItem.stock === undefined || selectedItem.stock === null
                        ? "Not set"
                        : selectedItem.stock}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-6 p-4 border border-[#525252] rounded-lg w-full lg:w-3/4">
                    <p className="text-gray-600 text-sm md:text-base">
                      {isDescriptionExpanded
                        ? selectedItem.description
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

                  <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 md:p-4 flex items-center w-full lg:w-3/4">
                    <img
                      src={peacImg}
                      alt="Offer"
                      className="w-8 h-8 md:w-10 md:h-10 mr-3 object-contain"
                    />
                    <p className="text-xs md:text-sm font-semibold">
                      {discountPercent
                        ? `Save ${discountPercent}% today. Limited time offer!`
                        : "Great Value! Limited time offer!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ); 
};

export default AdminOrderDetails;