import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../utils/api";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadDeliveryUser } from "../../redux/actions/delivery";
import DashboardHeader from "../../components/Delivery/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Delivery/Layout/DashboardSideBar";
import { BsBoxSeam } from "react-icons/bs";
import { FaWallet } from "react-icons/fa";
import { AiOutlineArrowRight, AiOutlineEye, AiOutlineClose } from "react-icons/ai";
import { MdDeliveryDining } from "react-icons/md";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DeliveryDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDelivery, deliveryUser, loading: deliveryLoading } = useSelector((state) => state.delivery);

  const [orders, setOrders] = useState([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load delivery user data on component mount
  useEffect(() => {
    if (!isDelivery && !deliveryLoading) {
      dispatch(loadDeliveryUser());
    }
  }, [dispatch, isDelivery, deliveryLoading]);

  useEffect(() => {
    // Check if user is authenticated via Redux state
    if (!deliveryLoading && !isDelivery) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    // Check if delivery user is approved for dashboard access
    if (!deliveryLoading && deliveryUser && !deliveryUser.isApproved) {
      toast.error("Your account is pending admin approval");
      navigate("/delivery/approval-pending");
      return;
    }

    // Only proceed if we have an authenticated and approved delivery user
    if (!deliveryLoading && isDelivery && deliveryUser && deliveryUser.isApproved) {

      const fetchData = async () => {
        try {
          const { data } = await api.get(`${server}/delivery/dashboard`, {
            withCredentials: true, // Use cookies instead of localStorage token
          });
          setCreditBalance(data.delivery?.creditBalance || 0);

          const ordersResponse = await api.get(`${server}/delivery/assigned-orders`, {
            withCredentials: true, // Use cookies instead of localStorage token
          });
          const sortedOrders = (ordersResponse.data.assignedOrders || []).sort(
            (a, b) => new Date(b.orderId?.createdAt) - new Date(a.orderId?.createdAt)
          );
          setOrders(sortedOrders);
        } catch (error) {
          if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            navigate("/login");
          } else {
            setError(error.response?.data?.message || "An error occurred.");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [navigate, deliveryLoading, isDelivery, deliveryUser]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      let endpoint = `${server}/delivery/request/${orderId}`;
      if (status === "completed") {
        endpoint = `${server}/delivery/complete/${orderId}`;
      }

      const { data } = await axios.put(
        endpoint,
        status !== "completed" ? { status } : {},
        { withCredentials: true }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId._id === orderId ? { ...order, status } : order
        ).sort((a, b) => new Date(b.orderId?.createdAt) - new Date(a.orderId?.createdAt))
      );

      if (status === "completed" && data.delivery?.creditBalance) {
        setCreditBalance(data.delivery.creditBalance);
      }

      toast.success(`Order ${status} successfully`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${status} order`;
      toast.error(errorMessage);
    }
  };

  const openDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  const handleSidebarToggle = () => {
    console.log("Sidebar toggle triggered, current state:", isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    console.log("Sidebar close triggered");
    setIsSidebarOpen(false);
  };

  const monthlyOrderStatus = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const statuses = ["pending", "accepted", "completed", "declined"];
  
  months.forEach((month) => {
    monthlyOrderStatus[month] = { pending: 0, accepted: 0, completed: 0, declined: 0 };
  });

  if (orders && Array.isArray(orders)) {
    orders.forEach((order) => {
      const date = new Date(order.orderId?.createdAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (monthlyOrderStatus[month] && order.status) {
        monthlyOrderStatus[month][order.status]++;
      }
    });
  }

  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getPaymentStatusStyle = (status) => {
    if (status?.toLowerCase() === "succeeded") {
      return "bg-[#DCFCE7] text-[#16A34A] rounded-full";
    }
    return "bg-[#FEF9C3] text-[#854D0E] rounded-full";
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-600 rounded-full";
      case "accepted":
        return "bg-green-100 text-green-600 rounded-full";
      case "declined":
        return "bg-red-100 text-red-600 rounded-full";
      case "completed":
        return "bg-[#DCFCE7] text-[#16A34A] rounded-full";
      default:
        return "bg-gray-100 text-gray-600 rounded-full";
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-avenir">
      <DashboardHeader onSidebarToggle={handleSidebarToggle} />
      <div className="flex w-full">
        <div className="w-[80px] md:w-64">
          <DashboardSideBar active={1} isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        </div>
        <div className="flex-1 p-6">
          <p className="text-sm text-gray-500 pb-4">Last updated: {currentDateTime} EAT</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <FaWallet className="text-3xl text-[#1C3B3E]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Credit Balance</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">${(creditBalance - creditBalance * 0.1).toFixed(2)}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">After 10% service charge</span>
                <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <BsBoxSeam className="text-3xl text-[#1C3B3E]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Orders</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{orders.length}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Assigned Orders</span>
                <Link to="/delivery/orders">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <MdDeliveryDining className="text-3xl text-[#1C3B3E]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Pending Orders</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {orders.filter((order) => order.status === "pending").length}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Awaiting Action</span>
                <Link to="/delivery/orders">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <div className="flex gap-2">
                <Link to="/delivery/orders">
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">
                    See all
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-2 px-4 text-left font-medium">Order ID</th>
                    <th className="py-2 px-4 text-left font-medium">Status</th>
                    <th className="py-2 px-4 text-left font-medium">Items Qty</th>
                    <th className="py-2 px-4 text-left font-medium">Total</th>
                    <th className="py-2 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders?.slice(0, 5).map((order) => (
                    <tr key={order.orderId?._id || Math.random()} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-900 font-semibold">{order.orderId?._id || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusStyle(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.orderId?.cart.reduce((acc, item) => acc + (item.qty || 1), 0) || 0}
                      </td>
                      <td className="py-3 px-4 text-gray-700">${order.orderId?.totalPrice?.toFixed(2) || "0.00"}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            className="text-gray-600 hover:text-blue-500 cursor-pointer"
                            onClick={() => openDetails(order)}
                          >
                            <AiOutlineEye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md" style={{ maxHeight: "300px" }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Order Status</h3>
            <div style={{ height: "200px" }}>
              <Bar
                data={{
                  labels: Object.keys(monthlyOrderStatus),
                  datasets: [
                    {
                      label: "Pending",
                      data: Object.values(monthlyOrderStatus).map((status) => status.pending),
                      backgroundColor: "#FBBF24",
                      borderColor: "#FBBF24",
                      borderWidth: 1,
                    },
                    {
                      label: "Accepted",
                      data: Object.values(monthlyOrderStatus).map((status) => status.accepted),
                      backgroundColor: "#10B981",
                      borderColor: "#10B981",
                      borderWidth: 1,
                    },
                    {
                      label: "Completed",
                      data: Object.values(monthlyOrderStatus).map((status) => status.completed),
                      backgroundColor: "#16A34A",
                      borderColor: "#16A34A",
                      borderWidth: 1,
                    },
                    {
                      label: "Declined",
                      data: Object.values(monthlyOrderStatus).map((status) => status.declined),
                      backgroundColor: "#EF4444",
                      borderColor: "#EF4444",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Number of Orders" },
                    },
                    x: {
                      title: { display: true, text: "Month" },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>
          {selectedOrder && (
            <div className="fixed inset-0 bg-[#0005] flex items-start justify-center z-50 h-screen w-screen mt-5">
              <div className="bg-white w-full h-[98vh] overflow-y-auto relative rounded-xl shadow-lg p-6 border-t border-gray-200">
                <button
                  className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={closeDetails}
                >
                  <AiOutlineClose size={20} />
                </button>
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                      <div
                        className="bg-white rounded-t-xl p-4 mb-4"
                        style={{ borderBottom: "1px solid #CC9A00" }}
                      >
                        <h2 className="text-lg font-semibold text-black">
                          Order ID: <span className="text-black font-bold">#{selectedOrder.orderId?._id?.slice(0, 8) || "N/A"}</span>
                        </h2>
                        <p className="text-sm text-black">
                          Placed on: {selectedOrder.orderId?.createdAt?.slice(0, 10) || "N/A"}
                        </p>
                      </div>
                      <div className="bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white rounded-xl p-6 shadow-md mb-6">
                        <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
                        <p className="text-gray-200">{selectedOrder.orderId?.shippingAddress?.address1 || "N/A"}</p>
                        <p className="text-gray-200">{selectedOrder.orderId?.shippingAddress?.address2 || ""}</p>
                        <p className="text-gray-200">{selectedOrder.orderId?.shippingAddress?.city || "N/A"}</p>
                        <p className="text-gray-200">{selectedOrder.orderId?.shippingAddress?.country || "N/A"}</p>
                        <p className="text-gray-200">{selectedOrder.orderId?.user?.email || selectedOrder.orderId?.user?.phoneNumber || "N/A"}</p>
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
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {selectedOrder.orderId?.cart?.length > 0 ? (
                                selectedOrder.orderId.cart.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 text-gray-900 font-semibold">
                                      {item._id?.slice(0, 8) || "N/A"}
                                    </td>
                                    <td className="py-3 px-4 text-gray-900 font-semibold">
                                      {item.name || "Unknown Item"}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{item.qty || 1}</td>
                                    <td className="py-3 px-4 text-gray-700">
                                      ${item.discountPrice?.toFixed(2) || "0.00"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="py-3 px-4 text-gray-700 text-center">
                                    No items available
                                  </td>
                                </tr>
                              )}
                              <tr className="bg-white font-semibold">
                                <td className="py-3 px-4 text-right" colSpan="3">
                                  Total:
                                </td>
                                <td className="py-3 px-4 text-[#1C3B3C]">
                                  ${selectedOrder.orderId?.totalPrice?.toFixed(2) || "0.00"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Client Details</h3>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-[#1C3B3C] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {selectedOrder.orderId?.user?.name?.charAt(0).toUpperCase() || "N"}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium">{selectedOrder.orderId?.user?.name || "Guest User"}</p>
                            <p className="text-gray-600 text-sm">
                              {selectedOrder.orderId?.user?.email || selectedOrder.orderId?.user?.phoneNumber || "N/A"}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">Billed to:</span> {selectedOrder.orderId?.user?.name || "Guest User"}
                        </p>
                        <p className="text-gray-600 mb-2">{selectedOrder.orderId?.shippingAddress?.address1 || "N/A"}</p>
                        <p className="text-gray-600 mb-2">{selectedOrder.orderId?.shippingAddress?.address2 || ""}</p>
                        <p className="text-gray-600 mb-2">{selectedOrder.orderId?.shippingAddress?.city || "N/A"}</p>
                        <p className="text-gray-600">{selectedOrder.orderId?.shippingAddress?.country || "N/A"}</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Amount Due ($)</h3>
                        <p className="text-3xl font-bold text-[#1C3B3C] mb-2">
                          ${selectedOrder.orderId?.totalPrice?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-gray-600 mb-4">Due on: {new Date().toLocaleDateString()}</p>
                        <h3 className="text-xl font-semibold mb-4">Order Status</h3>
                        <p className="text-gray-600 mb-4">
                          Status: <span className={`font-medium px-3 py-1.5 ${getOrderStatusStyle(selectedOrder.status)}`}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </p>
                        <h3 className="text-xl font-semibold mb-4">Payment Info</h3>
                        <p className="text-gray-600 mb-4">
                          Status: <span className={`font-medium px-3 py-1.5 ${getPaymentStatusStyle(selectedOrder.orderId?.paymentInfo?.status)}`}>
                            {selectedOrder.orderId?.paymentInfo?.status || "Not Paid"}
                          </span>
                        </p>
                        <div className="flex space-x-2 mt-6">
                          <button
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[#CC9A00] text-white hover:bg-[#E6B800] transition-colors duration-200 ${
                              selectedOrder.status === "accepted" || selectedOrder.status === "completed"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={selectedOrder.status === "accepted" || selectedOrder.status === "completed"}
                            onClick={() => updateOrderStatus(selectedOrder.orderId._id, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[#CC9A00] text-white hover:bg-[#E6B800] transition-colors duration-200 ${
                              selectedOrder.status === "declined" || selectedOrder.status === "completed"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={selectedOrder.status === "declined" || selectedOrder.status === "completed"}
                            onClick={() => updateOrderStatus(selectedOrder.orderId._id, "declined")}
                          >
                            Decline
                          </button>
                          <button
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[#CC9A00] text-white hover:bg-[#E6B800] transition-colors duration-200 ${
                              selectedOrder.status !== "accepted" || selectedOrder.status === "completed"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={selectedOrder.status !== "accepted" || selectedOrder.status === "completed"}
                            onClick={() => updateOrderStatus(selectedOrder.orderId._id, "completed")}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

export default DeliveryDashboardPage;