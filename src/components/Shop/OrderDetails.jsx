import React, { useEffect, useState } from "react";
import { BsEye, BsX, BsInfoCircle } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { server, backend_url } from "../../server";
import api from "../../utils/api";
import { toast } from "react-toastify";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import peacImg from "../../Assests/images/peac.png";
import Toast from "../../components/Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { deliveryUser } = useSelector((state) => state.delivery);
  const { user } = useSelector((state) => state.user); // Assuming user state contains role
  const { categories } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [deliveryList, setDeliveryList] = useState([]);
  const [data, setData] = useState(null);
  const [deliveryRequest, setDeliveryRequest] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [activeSection, setActiveSection] = useState("Update Order Status"); // Default section
  const [userData, setUserData] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [rejectReasons, setRejectReasons] = useState({}); // For reject refund per request
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [count, setCount] = useState(1);

  // Check if the user is an admin or seller
  const isAdminUser = user?.role === "Admin";
  const isSellerUser = seller && seller._id;

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

  const normalizeArray = (arr) => {
    if (!arr) return [];
    const flattened = arr.flat(Infinity);
    return [...new Set(flattened.map(item => {
      if (typeof item === "string" && item.startsWith('[') && item.endsWith(']')) {
        try {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed.map(i => i.replace(/[\[\]\"\\]/g, "").trim()) : [item.replace(/[\[\]\"\\]/g, "").trim()];
        } catch (e) {
          return item.replace(/[\[\]\"\\]/g, "").trim();
        }
      }
      return item;
    }).filter(item => item))];
  };

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
    fetchDeliveryList();
    fetchOrderData();
    fetchDeliveryRequest();
  }, [dispatch, id, seller?._id]);

  // Set active section after order data is fetched
  useEffect(() => {
    if ((data?.status === "Processing refund" || data?.status === "Refund Requested") && canViewRefundStatus) {
      setActiveSection("Manage Refund");
    } else if (isAdminUser || isSellerUser) {
      setActiveSection("Update Order Status");
    }
  }, [data?.status, isAdminUser, isSellerUser]);

  const refundActionHandler = async (newStatus, targetOrderId = id, refundRequestIndex = 0) => {
    const reasonKey = `${targetOrderId}_${refundRequestIndex}`;
    const rejectReason = rejectReasons[reasonKey];
    if (newStatus === "Rejected" && !rejectReason?.trim()) {
      showToast("error", "Validation Error", "Please provide a reject reason.");
      return;
    }
    try {
      await api.put(
        `${server}/order/order-refund-success/${targetOrderId}`,
        { 
          refundRequestIndex, 
          status: newStatus,
          ...(newStatus === "Rejected" && { rejectReason })
        },
        { withCredentials: true }
      );
      showToast("success", "Refund Success", `Refund ${newStatus === "Refund Success" ? "accepted" : "rejected"} successfully!`);
      // Clear the reject reason for this request
      setRejectReasons(prev => {
        const newState = { ...prev };
        delete newState[reasonKey];
        return newState;
      });
      await fetchOrderData();
    } catch (error) {
      showToast("error", "Refund Error", error.response?.data?.message || `Failed to ${newStatus === "Refund Success" ? "accept" : "reject"} refund.`);
    }
  };

  const fetchDeliveryList = async () => {
    try {
      const { data } = await api.get(`${server}/delivery/all`, {
        withCredentials: true,
      });
      setDeliveryList(data.deliveries.filter((delivery) => delivery.isApproved));
    } catch (error) {
      showToast("error", "Delivery Error", "Failed to fetch delivery personnel.");
    }
  };

  const fetchOrderData = async () => {
    try {
      const { data: orderData } = await api.get(`${server}/order/get-order/${id}`, {
        withCredentials: true,
      });
      setData(orderData.order);
      setStatus(orderData.order?.status || "");
      // Map order status to delivery status for consistency
      const orderStatus = orderData.order?.status;
      if (orderStatus === "Delivered") {
        setDeliveryStatus("completed");
      } else if (orderStatus === "Canceled") {
        setDeliveryStatus("declined");
      } else if (orderStatus === "Transferred to delivery partner") {
        setDeliveryStatus("accepted");
      } else {
        setDeliveryStatus(orderData.order?.delivery ? "pending" : "");
      }
      if (orderData.order?.user?._id && (!orderData.order.user.name || !orderData.order.user.email)) {
        setIsUserLoading(true);
        const { data: userResponse } = await api.get(`${server}/user/user-info/${orderData.order.user._id}`, {
          withCredentials: true,
        });
        setUserData(userResponse.user);
        setIsUserLoading(false);
      } else {
        setUserData(orderData.order.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        showToast("error", "Order Error", "Failed to fetch order data.");
      }
    }
  };

  const fetchDeliveryRequest = async () => {
    try {
      const { data } = await api.get(`${server}/delivery/request/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setDeliveryRequest(data.deliveryRequest);
      setDeliveryStatus(data.deliveryRequest?.status || deliveryStatus);
    } catch (error) {
      console.error("Failed to fetch delivery request:", error);
      if (error.response?.status !== 404) showToast("error", "Delivery Error", "Failed to fetch delivery request.");
    }
  };

  const assignDeliveryHandler = async () => {
    if (!deliveryId) {
      showToast("error", "Validation Error", "Please select a delivery person.");
      return;
    }
    try {
      await api.put(
        `${server}/order/assign-delivery/${id}`,
        { deliveryId },
        { withCredentials: true }
      );
      showToast("success", "Delivery Success", "Delivery person assigned successfully!");
      await fetchOrderData();
      await fetchDeliveryRequest();
    } catch (error) {
      showToast("error", "Delivery Error", error.response?.data?.message || "Failed to assign delivery.");
    }
  };

  const updateDeliveryStatusHandler = async (newStatus) => {
    try {
      const backendStatusMap = {
        "Transferred to delivery partner": "accepted",
        Delivered: "completed",
        Canceled: "declined",
      };
      const backendStatus = backendStatusMap[newStatus] || newStatus;
      await api.put(
        `${server}/delivery/request/${id}`,
        { status: backendStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      showToast("success", "Delivery Success", `Delivery status updated to ${newStatus}!`);
      setDeliveryStatus(backendStatus);
      await fetchOrderData();
      await fetchDeliveryRequest();
    } catch (error) {
      showToast("error", "Delivery Error", error.response?.data?.message || "Failed to update delivery status.");
    }
  };

  const fetchProductDetails = async (productId, isEvent = false) => {
    if (!productId) return;
    setProductLoading(true);
    try {
        const { data } = await api.get(`${server}/product/detail/${productId}`);
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

  const openProductModal = (productId, isEvent = false) => {
    fetchProductDetails(productId, isEvent);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setCount(1);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
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

  const discountPercent = selectedProduct?.originalPrice && selectedProduct?.originalPrice > selectedProduct?.discountPrice
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.discountPrice) / selectedProduct.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedProduct?.description && selectedProduct.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedProduct.description.slice(0, descriptionLimit) + "..."
    : selectedProduct?.description;

  const isDeliveryUser = deliveryUser && deliveryUser._id;
  const isAssignedToCurrentDeliveryUser = isDeliveryUser && deliveryRequest?.assignedTo === deliveryUser._id;
  const hasRefundRequests = (data?.isMaster ? data.subOrders?.some(sub => sub.refundRequests?.length > 0) : data?.refundRequests?.length > 0) || ["Refund Requested", "Refund Processed"].includes(data?.status);
  const canManageRefund = hasRefundRequests && isAdminUser && (data?.isMaster ? data.subOrders?.some(sub => sub.refundRequests?.some(r => ["Pending", "Vendor Approved"].includes(r.status))) : data?.refundRequests?.some(r => ["Pending", "Vendor Approved"].includes(r.status)));
  const canViewRefundStatus = (isSellerUser || isAdminUser || isDeliveryUser) && (hasRefundRequests || ["Refund Requested", "Processing refund", "Refund Success", "Delivered"].includes(data?.status));
  const canAssignDelivery = (isSellerUser || isAdminUser) && !["accepted", "completed"].includes(deliveryStatus);

  const formatDeliveryStatus = (status) => {
    const statusMap = {
      pending: "Pending",
      accepted: "Transferred to delivery partner",
      declined: "Canceled",
      completed: "Delivered",
    };
    return statusMap[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Not Assigned");
  };

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
      "Not Assigned": "bg-gray-100 text-gray-800",
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
    if (!refundImage) return `${backend_url}/Uploads/refund_images/default_refund_image.png`;
    return refundImage.startsWith("http") ? refundImage : `${backend_url}${refundImage}`;
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
    // Handle "Refund Requested" status specifically for single orders without refundRequests array
    if (data?.status === "Refund Requested" && !data?.refundRequests?.length && data?.refundReason) {
      const imageSrc = getRefundImageUrl(data.refundImage);
      return (
        <div className="bg-gray-800 p-6 rounded-xl mb-4 shadow-md border border-gray-600">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0">
              {data.refundImage && (
                <img
                  src={imageSrc}
                  alt="Refund Image"
                  className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openImageModal(imageSrc)}
                  onError={(e) => (e.target.src = `${backend_url}/Uploads/refund_images/default_refund_image.png`)}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-400 mb-3">
                <p className="text-yellow-200 font-medium mb-1 flex items-center gap-2">
                  <BsInfoCircle className="w-4 h-4" />
                  Refund Reason
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">{data.refundReason}</p>
              </div>
              <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(data.status)}`}>
                Status: {data.status}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (data.isMaster && data.subOrders) {
      return data.subOrders.map((sub, subIndex) => (
        <div key={sub._id} className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h5 className="text-white font-semibold mb-3">Sub-Order from Shop: {sub.shop?.name || sub.shop || "N/A"}</h5>
          {sub.refundRequests?.length > 0 ? (
            sub.refundRequests.map((req, index) => {
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
                          onError={(e) => (e.target.src = `${backend_url}/Uploads/refund_images/default_refund_image.png`)}
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
                            className="bg-[#CC9A00] text-white px-6 py-2 rounded-full hover:bg-[#E6B800] transition-colors duration-200"
                          >
                            Accept Refund
                          </button>
                          <div className="flex flex-col gap-2 flex-1 sm:flex-none">
                            <div className="flex gap-2">
                              <button
                                onClick={() => refundActionHandler("Rejected", sub._id, index)}
                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-200"
                              >
                                Reject Refund
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
            })
          ) : (
            <p className="text-gray-200">No refund requests for this sub-order.</p>
          )}
        </div>
      ));
    } else {
      // Single order
      return data?.refundRequests?.map((req, index) => {
        const reasonKey = `${data._id}_${index}`;
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
                    onError={(e) => (e.target.src = `${backend_url}/Uploads/refund_images/default_refund_image.png`)}
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
                      className="bg-[#CC9A00] text-white px-6 py-2 rounded-full hover:bg-[#E6B800] transition-colors duration-200"
                    >
                      Accept Refund
                    </button>
                    <div className="flex flex-col gap-2 flex-1 sm:flex-none">
                      <div className="flex gap-2">
                        <button
                          onClick={() => refundActionHandler("Rejected", data._id, index)}
                          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-200"
                        >
                          Reject Refund
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
      }) || <p className="text-gray-200">No refund requests for this order.</p>;
    }
  };

  const handleClose = () => {
    navigate("/dashboard-orders");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center mt-5 z-50 font-avenir">
        <div className="relative bg-gray-50 w-full max-w-8xl rounded-xl shadow-lg overflow-y-auto max-h-[calc(110vh-5rem)]">
          <button
            onClick={handleClose}
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
                    Order ID: <span className="text-black font-bold">#{data?._id?.slice(0, 8) || "N/A"}</span>
                  </h2>
                  <p className="text-sm text-black">Placed on: {data?.createdAt?.slice(0, 10) || "N/A"}</p>
                </div>

                <div className="bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white rounded-xl p-6 shadow-md mb-6">
                  <h3 className="text-xl font-semibold mb-4">Order Management</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {(isAdminUser || isSellerUser) && (
                      <>
                        <button
                          onClick={() => setActiveSection("Update Order Status")}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 ${
                            activeSection === "Update Order Status"
                              ? "border-[#CC9A00] text-[#CC9A00]"
                              : "border-transparent hover:text-[#CC9A00]"
                          }`}
                        >
                          Order Status
                        </button>
                       
                      </>
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
                        Refund
                      </button>
                    )}
                    {isDeliveryUser && data?.delivery && (
                      <button
                        onClick={() => setActiveSection("Manage Delivery")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 border-b-2 ${
                          activeSection === "Manage Delivery"
                            ? "border-[#CC9A00] text-[#CC9A00]"
                            : "border-transparent hover:text-[#CC9A00]"
                        }`}
                      >
                        Manage Delivery
                      </button>
                    )}
                  </div>

                  {activeSection === "Update Order Status" && (isAdminUser || isSellerUser) && (
                    <div className="p-4 rounded-lg">
                      {/* <h4 className="text-lg font-medium mb-2 text-white">Order Status</h4> */}
                      <p
                        className={`inline-block px-4 py-2 rounded-full font-medium mb-4 ${getStatusColor(data?.status)}`}
                      >
                        {data?.status || "N/A"}
                      </p>
                    </div>
                  )}

                

                  {activeSection === "Manage Refund" && canViewRefundStatus && (
                    <div className="p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 text-white">Refund Requests</h4>
                      {renderRefundRequests()}
                    </div>
                  )}

                  {activeSection === "Manage Delivery" && isDeliveryUser && (
                    <div className="p-4 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 text-white">Manage Delivery</h4>
                      {data?.delivery ? (
                        <>
                          <p className="text-gray-200 mb-2">
                            Assigned to: {data.delivery.fullName} ({data.delivery.email})
                          </p>
                          <p
                            className={`inline-block px-4 py-2 rounded-full font-medium mb-4 ${getStatusColor(
                              deliveryStatus
                            )}`}
                          >
                            {formatDeliveryStatus(deliveryStatus)}
                          </p>
                          {isAssignedToCurrentDeliveryUser && deliveryStatus !== "completed" && deliveryStatus !== "declined" ? (
                            <div className="flex gap-3 flex-wrap">
                              {deliveryStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateDeliveryStatusHandler("Transferred to delivery partner")}
                                    className="bg-[#CC9A00] text-white px-6 py-2 rounded-lg hover:bg-[#E6B800] transition-colors duration-200 font-semibold"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => updateDeliveryStatusHandler("Canceled")}
                                    className="bg-[#CC9A00] text-white px-6 py-2 rounded-lg hover:bg-[#E6B800] transition-colors duration-200 font-semibold"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {deliveryStatus === "accepted" && (
                                <button
                                  onClick={() => updateDeliveryStatusHandler("Delivered")}
                                  className="bg-[#CC9A00] text-white px-6 py-2 rounded-lg hover:bg-[#E6B800] transition-colors duration-200 font-semibold"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          ) : deliveryStatus === "completed" ? (
                            <p className="text-[#CC9A00] font-medium">Delivery completed!</p>
                          ) : deliveryStatus === "declined" ? (
                            <p className="text-[#CC9A00] font-medium">Delivery declined.</p>
                          ) : (
                            <p className="text-[#CC9A00] font-medium">This order is not assigned to you.</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-200 mb-4">No delivery person assigned.</p>
                      )}
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
                        {data?.cart?.map((item, index) => {
                          const isEvent = item.isEvent || !!item.Finish_Date;
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition">
                              <td className="py-3 px-4 text-gray-900 font-semibold">
                                {item._id?.slice(0, 8) || "N/A"}
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
                                ${item.discountPrice?.toFixed(2) || "0.00"}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => openProductModal(item._id, isEvent)}
                                  className="text-[#CC9A00] hover:text-[#E6B800] p-1"
                                  title={`View details for ${item.name || "Item"}`}
                                >
                                  <BsEye className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        }) || (
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
                          <td className="py-3 px-4 text-[#1C3B3C]">${data?.totalPrice?.toFixed(2) || "0.00"}</td>
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
                    {/* <span className="font-medium">Address 2:</span>
                    <span>{data?.shippingAddress?.address2 || "N/A"}</span> */}
                    <span className="font-medium">City:</span>
                    <span>{data?.shippingAddress?.city || "N/A"}</span>
                    <span className="font-medium">Country:</span>
                    <span>{data?.shippingAddress?.country || "N/A"}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Amount Due (Birr)</h3>
                  <p className="text-3xl font-bold text-[#1C3B3C] mb-2">
                    ${data?.totalPrice?.toFixed(2) || "0.00"}
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

      {/* Product Details Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] h-screen w-screen">
          <div className="bg-white w-full max-w-8xl h-[100vh] mt-10 overflow-y-auto relative rounded-2xl shadow-2xl p-6">
            <button
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
              onClick={closeProductModal}
            >
              <BsX size={20} />
            </button>
            {productLoading ? (
              <p className="text-gray-600">Loading product details...</p>
            ) : selectedProduct ? (
              <div className="w-[90%] mx-auto py-5">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2">
                    <img
                      src={
                        selectedProduct.images && selectedProduct.images[detailsImageIdx]?.url
                          ? `${backend_url}${selectedProduct.images[detailsImageIdx].url}`
                          : "https://via.placeholder.com/650"
                      }
                      alt={selectedProduct.name || "Product image"}
                      className="w-[550px] h-[500px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                    />
                    <div className="relative">
                      <div className="absolute top-[-25rem] w-[550px] flex justify-center">
                        <div className="flex items-center space-x-4">
                          {selectedProduct.images && [...Array(selectedProduct.images.length)].map((_, i) => (
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
                        {selectedProduct.images && selectedProduct.images.map((i, index) => (
                          <div
                            key={index}
                            className={`cursor-pointer mx-2 ${detailsImageIdx === index ? "" : ""}`}
                          >
                            <img
                              src={
                                i?.url
                                  ? `${backend_url}${i.url}`
                                  : "https://via.placeholder.com/140x100"
                              }
                              alt={`Thumbnail ${index}`}
                              className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                              onClick={() => setDetailsImageIdx(index)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-10">
                      <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Link
                              to={
                                selectedProduct?.shop?.template === "growthplan"
                                  ? `/shop/growthplan/${selectedProduct?.shop._id}`
                                  : selectedProduct?.shop?.template === "proplan"
                                  ? `/shop/proplan/${selectedProduct?.shop._id}`
                                  : `/shop/preview/${selectedProduct?.shop._id}`
                              }
                            >
                              <img
                                src={
                                  selectedProduct?.shop?.avatar?.url
                                    ? `${backend_url}${selectedProduct.shop.avatar.url}`
                                    : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                }
                                alt={selectedProduct.shop?.name || "Shop"}
                                className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                              />
                            </Link>
                            <div>
                              <Link
                                to={
                                  selectedProduct?.shop?.template === "growthplan"
                                    ? `/shop/growthplan/${selectedProduct?.shop._id}`
                                    : selectedProduct?.shop?.template === "proplan"
                                    ? `/shop/proplan/${selectedProduct?.shop._id}`
                                    : `/shop/preview/${selectedProduct?.shop._id}`
                                }
                              >
                                <h3 className={`${styles.shop_name}`}>
                                  {selectedProduct.shop?.name || "Unknown Shop"}
                                </h3>
                              </Link>
                              <div className="flex mt-1">
                                <Ratings rating={selectedProduct?.ratings || 0} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                    <button
                      onClick={() => navigate(`/products?category=${selectedProduct.category}`)}
                      className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                    >
                      <p className="text-sm">{getCategoryName(selectedProduct.category)}</p>
                    </button>
                    <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                      {selectedProduct.name || "Unnamed Product"}
                    </h1>
                    <div className="flex items-center justify-start mt-2">
                      <div className="flex items-center">
                        <h4 className={`${styles.productDiscountPrice}`}>
                          {selectedProduct.discountPrice
                            ? `${selectedProduct.discountPrice} Birr`
                            : "N/A"}
                        </h4>
                        {selectedProduct.originalPrice && (
                          <h3 className={`${styles.price} ml-2`}>
                            {selectedProduct.originalPrice} Birr
                          </h3>
                        )}
                      </div>
                      <div className="ml-20">
                        <Ratings rating={selectedProduct?.ratings || 0} />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-gray-800 font-light">Select Size</label>
                      <div className="flex space-x-2 mt-2">
                        {selectedProduct.sizes &&
                        Array.isArray(selectedProduct.sizes) &&
                        selectedProduct.sizes.length > 0 ? (
                          selectedProduct.sizes.map((size) => (
                            <button
                              key={size}
                              className={`px-4 py-2 rounded-[16px] ${
                                false ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                              } hover:bg-gray-200`}
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
                        {selectedProduct.colors &&
                        Array.isArray(selectedProduct.colors) &&
                        selectedProduct.colors.length > 0 ? (
                          selectedProduct.colors.map((color) => (
                            <button
                              key={color}
                              className={`px-4 py-2 rounded-[16px] ${
                                false ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                              } hover:bg-gray-200`}
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
                        {selectedProduct.stock === undefined || selectedProduct.stock === null
                          ? "Not set"
                          : selectedProduct.stock}
                      </p>
                    </div>
                    <div className="mt-6 p-4 border border-[#525252] rounded-lg w-3/4">
                      <p className="text-gray-600">
                        {isDescriptionExpanded
                          ? selectedProduct.description
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
            ) : (
              <p className="text-gray-600">Failed to load product details.</p>
            )}
          </div>
        </div>
      )}
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
    </>
  );
};

export default OrderDetails;