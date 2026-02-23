import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { server } from "../server";
import { BsX } from "react-icons/bs";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import Toast from "../components/Toast"; 

const PerItemRefundForm = ({ isOpen, onClose, item, orderForRefund, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!reason.trim()) {
      showToast("error", "Missing Reason", "Please provide a reason for the refund.");
      return;
    }
    setIsSubmitting(true);
    try {
      const refundedItems = [
        {
          _id: item._id,
          qty: item.qty,  // Full qty for simplicity; can make partial later
          reason: reason,
        },
      ];

      const formData = new FormData();
      formData.append("refundedItems", JSON.stringify(refundedItems));
      if (image) {
        formData.append("refundImages", image);
      }

      const response = await axios.put(
        `${server}/order/order-refund/${orderForRefund._id}`,
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <button type="button">
            <BsX
              size={28}
              onClick={handleClose}
              className="cursor-pointer text-gray-600 hover:text-gray-800"
            />
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Refund for {item.name}</h2>
        <div className="text-gray-600 mb-6 text-sm">
          <h3 className="text-lg font-medium mb-2">Refund Policy</h3>
          <ul className="list-disc pl-5 mb-4">
            <li>Refunds are only available for delivered items.</li>
            <li>A valid reason for the refund is required.</li>
            <li>Optionally, upload an image (JPEG/PNG, max 5MB) to support your request.</li>
            <li>Refund requests are reviewed within 7 business days.</li>
          </ul>
          <p>
            Please provide a detailed reason for refunding this item below. Include an image if applicable (e.g., damaged product).
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Reason for Refund <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:border-yellow-500 text-gray-700"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for your refund request..."
              required
            />
            <label className="block text-gray-800 font-medium mb-2">
              Upload Image (Optional, JPEG/PNG, Max 5MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="w-full border p-2 rounded-lg mb-4 text-gray-700"
            />
            {imagePreview && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Refund Image Preview"
                  className="w-full h-auto max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-400"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Refund Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserOrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);
  const [refundForms, setRefundForms] = useState({});  // {itemId: true/false} for multiple modals
  const { id } = useParams();

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
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const data = orders && orders.find((item) => item._id === id);

  // Helper to find sub-order for an item (for multi-shop)
  const findSubForItem = (itemId, subOrders) => {
    if (!subOrders || subOrders.length === 0) return data;  // Single shop
    for (const sub of subOrders) {
      const cartItem = sub.cart.find(c => c._id.toString() === itemId.toString());
      if (cartItem) return sub;
    }
    return null;  // Not found
  };

  // Helper to get refund request for item in order/sub
  const getRefundRequestForItem = (itemId, order) => {
    return order.refundRequests.find(r => r.itemId.toString() === itemId.toString());
  };

  // Helper to check if item can be refunded
  const canRefundItem = (item, orderForItem) => {
    const req = getRefundRequestForItem(item._id, orderForItem);
    return data.status === "Delivered" && !req?.status === "Refund Success";
  };

  const reviewHandler = async () => {
    try {
      const response = await axios.put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      );
      showToast("success", "Review Submitted", response.data.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(1);
      setOpen(false);
    } catch (error) {
      showToast("error", "Review Failed", error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      showToast("error", "Login Required", "Please login to send a message");
      return;
    }

    if (!data?.shop && (!data.subOrders || data.subOrders.length === 0)) {
      showToast("error", "Shop Info Missing", "Shop information not available");
      return;
    }

    // For multi, use first sub's shop or master shop if single
    const sellerId = data.shop ? (typeof data.shop === "object" ? data.shop._id : data.shop) : data.subOrders[0]?.shop?._id;

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

      navigate(`/inbox?${res.data.conversation._id}`);
    } catch (error) {
      if (error.response?.status === 400) {
        navigate(`/inbox?${sellerId}`);
      } else {
        showToast("error", "Conversation Failed", error.response?.data?.message || "Failed to start conversation");
      }
    }
  };

  const getUserDisplayName = () => {
    return user?.name || "Abenezer Anbessie";
  };

  const getPaymentStatusStyle = (status) => {
    if (status?.toLowerCase() === "succeeded") {
      return "bg-green-100 text-green-600 px-3 py-1 rounded-full";
    }
    return "bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full";
  };

  const getRefundStatusStyle = (status) => {
    return {
      Pending: "bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full",
      "Vendor Approved": "bg-blue-100 text-blue-600 px-3 py-1 rounded-full",
      Rejected: "bg-red-100 text-red-600 px-3 py-1 rounded-full",
      "Refund Success": "bg-green-100 text-green-600 px-3 py-1 rounded-full",
    }[status] || "bg-gray-100 text-gray-600 px-3 py-1 rounded-full";
  };

  const getTrackingStatusStyle = (status) => {
    return {
      Delivered: "bg-green-100 text-green-600 px-3 py-1 rounded-full",
      Pending: "bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full",
      Canceled: "bg-red-100 text-red-600 px-3 py-1 rounded-full",
      "Refund Requested": "bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full",
      "Refund Processed": "bg-green-100 text-green-600 px-3 py-1 rounded-full",
    }[status] || "bg-gray-100 text-gray-600 px-3 py-1 rounded-full";
  };

  const handleRefundSubmit = () => {
    console.log("Refreshing orders after refund submission");
    dispatch(getAllOrdersOfUser(user._id));
  };

  const openRefundForm = (item) => {
    const orderForItem = findSubForItem(item._id, data?.subOrders);
    if (orderForItem) {
      setRefundForms(prev => ({ ...prev, [item._id]: true }));
      // Set selected for form, but since modal per item, pass as prop
    }
  };

  const closeRefundForm = (itemId) => {
    setRefundForms(prev => ({ ...prev, [itemId]: false }));
  };

  if (isLoading) {
    return <div className="text-center py-10 font-avenir text-gray-600">Loading order details...</div>;
  }

  if (!data) {
    return <div className="text-center py-10 font-avenir text-gray-600">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-avenir">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            title="Close"
          >
            <BsX className="w-6 h-6" />
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Order ID: <span className="font-bold">#{data?._id?.slice(0, 8) || "N/A"}</span>
                </h2>
                <p className="text-sm text-gray-600">
                  Placed on: {data?.createdAt?.slice(0, 10) || "N/A"}
                </p>
              </div>

              <div className="bg-gray-800 text-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Tracking Status</h3>
                <p className="mb-2">
                  <span className={getTrackingStatusStyle(data?.status)}>
                    {data?.status || "Unknown"}
                  </span>
                </p>
                {data?.status === "Delivered" && (
                  <p className="text-gray-200">Delivered On: {data?.deliveredAt?.slice(0, 10) || "N/A"}</p>
                )}
                {["Refund Requested", "Refund Processed"].includes(data?.status) && (
                  <p className="text-gray-200">Refund Status: {data?.status}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="py-2 px-4 text-left font-medium">Product ID</th>
                        <th className="py-2 px-4 text-left font-medium">Product</th>
                        <th className="py-2 px-4 text-left font-medium">Quantity</th>
                        <th className="py-2 px-4 text-left font-medium">Price</th>
                        <th className="py-2 px-4 text-left font-medium">Review</th>
                        <th className="py-2 px-4 text-left font-medium">Refund</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data?.cart?.length > 0 ? (
                        data.cart.map((item, index) => {
                          const orderForItem = findSubForItem(item._id, data?.subOrders);
                          const refundReq = orderForItem ? getRefundRequestForItem(item._id, orderForItem) : null;
                          const canRefund = orderForItem && canRefundItem(item, orderForItem);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-900 font-semibold">
                                {item._id?.slice(0, 8) || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 font-semibold">
                                <div className="flex items-center">
                                  <img
                                    src={item.images && item.images[0]?.url ? item.images[0].url : "/Uploads/avatar/default_avatar.png"}
                                    alt={item.name || "Product"}
                                    className="w-12 h-12 object-cover mr-3 rounded"
                                    onError={(e) => (e.target.src = "/Uploads/avatar/default_avatar.png")}
                                  />
                                  <div className="flex flex-col">
                                    <span>{item.name || "Unknown Item"}</span>
                                    {item.selectedSize && (
                                      <span className="text-xs text-gray-500">Size: {item.selectedSize}</span>
                                    )}
                                    {item.selectedColor && (
                                      <span className="text-xs text-gray-500">Color: {item.selectedColor}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700">{item.qty || 1}</td>
                              <td className="py-3 px-4 text-gray-700">
                                Br{item.discountPrice?.toFixed(2) || "0.00"}
                              </td>
                              <td className="py-3 px-4">
                                {!item.isReviewed && data.status === "Delivered" ? (
                                  <button
                                    type="button"
                                    className="bg-yellow-500 text-white px-4 py-1 rounded-full hover:bg-yellow-600"
                                    onClick={() => {
                                      setOpen(true);
                                      setSelectedItem(item);
                                    }}
                                  >
                                    Write a review
                                  </button>
                                ) : (
                                  <span className="text-gray-600 text-sm">Reviewed</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {refundReq ? (
                                  <span className={getRefundStatusStyle(refundReq.status)}>
                                    {refundReq.status}
                                  </span>
                                ) : canRefund ? (
                                  <button
                                    type="button"
                                    className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600 text-sm"
                                    onClick={() => openRefundForm(item)}
                                  >
                                    Request Refund
                                  </button>
                                ) : (
                                  <span className="text-gray-600 text-sm">N/A</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-3 px-4 text-gray-700 text-center">
                            No items available
                          </td>
                        </tr>
                      )}
                      <tr className="bg-white font-semibold">
                        <td colSpan="5" className="py-3 px-4 text-right">
                          Total:
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          Br{data?.totalPrice?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4"> here Shipping Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <p className="text-gray-600 font-medium">Name:</p>
                  <p className="text-gray-600">{getUserDisplayName()}</p>
                  <p className="text-gray-600 font-medium">Address:</p>
                  <p className="text-gray-600">{data?.shippingAddress?.address1 || "N/A"}</p>
                  {data?.shippingAddress?.address2 && (
                    <>
                      <p className="text-gray-600 font-medium"></p>
                      <p className="text-gray-600">{data?.shippingAddress?.address2}</p>
                    </>
                  )}
                  <p className="text-gray-600 font-medium">City:</p>
                  <p className="text-gray-600">{data?.shippingAddress?.city || "N/A"}</p>
                  <p className="text-gray-600 font-medium">Country:</p>
                  <p className="text-gray-600">{data?.shippingAddress?.country || "N/A"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Amount Due (Birr)</h3>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  Br{data?.totalPrice?.toFixed(2) || "0.00"}
                </p>
                <p className="text-gray-600 mb-4">Due on: {new Date().toLocaleDateString()}</p>
                <h3 className="text-xl font-semibold mb-4">Payment Info</h3>
                <p className="text-gray-600 mb-2">
                  Status: <span className={getPaymentStatusStyle(data?.paymentInfo?.status)}>
                    {data?.paymentInfo?.status || "Not Paid"}
                  </span>
                </p>
                {["Refund Requested", "Refund Processed"].includes(data?.status) && (
                  <p className="text-gray-600 mb-2">
                    Overall Refund Status: {data?.status}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 w-full"
                onClick={handleSendMessage}
              >
                Send Message
              </button>
            </div>
          </div>

          {open && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end">
                  <button type="button">
                    <BsX
                      size={30}
                      onClick={() => setOpen(false)}
                      className="cursor-pointer text-gray-600 hover:text-gray-800"
                    />
                  </button>
                </div>
                <h2 className="text-2xl font-semibold text-center mb-4">Give a Review</h2>
                <div className="flex items-center mb-4">
                  <img
                    src={
                      selectedItem.images && selectedItem.images[0]?.url
                        ? selectedItem.images[0].url
                        : "/Uploads/avatar/default_avatar.png"
                    }
                    alt={selectedItem.name || "Product"}
                    className="w-20 h-20 object-cover rounded mr-4"
                    onError={(e) => (e.target.src = "/Uploads/avatar/default_avatar.png")}
                  />
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {selectedItem.name || "Unknown Item"}
                    </p>
                    <p className="text-lg text-gray-600">
                      Br{selectedItem.discountPrice?.toFixed(2) || "0.00"} x {selectedItem.qty || 1}
                    </p>
                  </div>
                </div>

                <h5 className="text-lg font-medium text-gray-800 mb-2">
                  Give a Rating <span className="text-red-500">*</span>
                </h5>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    rating >= i ? (
                      <AiFillStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="#f59e0b"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    ) : (
                      <AiOutlineStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="#f59e0b"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    )
                  ))}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-800 mb-2">
                    Write a comment <span className="text-sm text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    name="comment"
                    cols="20"
                    rows="5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was your product? Write your expression about it!"
                    className="mt-2 w-full border p-3 rounded-lg focus:outline-none focus:border-yellow-500 text-gray-700"
                  ></textarea>
                </div>
                <button
                  type="button"
                  className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 w-full"
                  onClick={rating >= 1 ? reviewHandler : () => showToast("error", "Rating Required", "Please select a rating")}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Per-item refund modals */}
          {data?.cart?.map((item) => {
            const orderForItem = findSubForItem(item._id, data?.subOrders);
            const canRefund = orderForItem && canRefundItem(item, orderForItem);
            if (canRefund && refundForms[item._id]) {
              return (
                <PerItemRefundForm
                  key={`refund-${item._id}`}
                  isOpen={true}
                  onClose={() => closeRefundForm(item._id)}
                  item={item}
                  orderForRefund={orderForItem}
                  onSubmit={handleRefundSubmit}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;