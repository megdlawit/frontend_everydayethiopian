import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import Loader from "../components/Layout/Loader";
import Pagination from "../components/Pagination";
import { getAllOrdersOfAdmin } from "../redux/actions/order";
import api from "../utils/api";
import { server } from "../server";
import { toast } from "react-toastify";
import Toast from "../components/Toast";
import AdminOrderDetails from "../components/Admin/AdminOrderDetails";

const ITEMS_PER_PAGE = 10;

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Fetch all orders (up to 1000) for frontend pagination/filtering
    dispatch(getAllOrdersOfAdmin(1, 1000));
  }, [dispatch]);

  // Status styles
  const statusStyles = {
    Processing: "bg-[#FEF9C3] text-[#CA8A04]",
    "Transferred to delivery partner": "bg-purple-200 text-purple-800",
    Shipping: "bg-orange-200 text-orange-800",
    Received: "bg-teal-200 text-teal-800",
    "On the way": "bg-yellow-200 text-yellow-800",
    Delivered: "bg-green-200 text-green-800",
    Refunded: "bg-red-200 text-red-800",
    Canceled: "bg-gray-200 text-gray-800",
    "Processing refund": "bg-yellow-100 text-yellow-800",
    "Refund Success": "bg-green-100 text-green-800",
    default: "bg-gray-200 text-gray-800",
  };

  // Available statuses for admin to update
  const availableStatuses = [
    "Processing",
    "Transferred to delivery partner",
    "Shipping",
    "Received",
    "On the way",
    "Delivered",
    "Canceled",
    "Processing refund",
    "Refund Success",
  ];

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    const currentOrder = adminOrders.find((order) => order._id === orderId);
    if (!newStatus || newStatus === currentOrder?.status) {
      setShowStatusUpdate(null);
      return;
    }

    setUpdatingOrder(orderId);
    try {
      const response = await axios.put(
        `${server}/order/admin-update-order-status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        showToast("success", "Success", "Order status updated successfully!");
        // Refetch all orders (no filter) to refresh the full dataset
        dispatch(getAllOrdersOfAdmin(1, 1000));
      }
    } catch (error) {
      showToast("error", "Error", error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
      setShowStatusUpdate(null);
    }
  };

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      const totalItems = item?.cart?.reduce((acc, cartItem) => acc + (cartItem.qty || 1), 0);
      // Compute aggregate refund status
      const statuses = [];
      if (item.refundRequests?.length) statuses.push(...item.refundRequests.map(r => r.status));
      if (item.subOrders?.length) item.subOrders.forEach(sub => { if (sub.refundRequests?.length) statuses.push(...sub.refundRequests.map(r => r.status)); });
      const displayStatus = (function () {
        if (statuses.includes("Refund Success") || item.status === "Refund Processed") return "Refund Processed";
        if (statuses.includes("Rejected")) return "Refund Rejected";
        if (statuses.includes("Vendor Approved")) return "Vendor Approved";
        if (statuses.includes("Pending") || item.status === "Refund Requested") return "Refund Requested";
        return item?.status || "N/A";
      })();

      row.push({
        id: item._id,
        itemsQty: totalItems || 0,
        total: Number(item?.totalPrice ?? 0).toFixed(2),
        status: displayStatus,
        refundReason: item?.refundReason,
      });
    });

  // Apply search and filter (frontend)
  const filteredRows = row.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterStatus === "" || order.status === filterStatus)
  );

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Adjust current page if it becomes invalid after data refresh (e.g., item removed from current filter)
  useEffect(() => {
    const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredRows.length]);

  if (adminOrderLoading) {
    return (
      <div className="bg-gray-100">
        <AdminHeader onSidebarToggle={toggleSidebar} />
        <div className="flex justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={2} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>
          <div className="w-full justify-center flex">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      <AdminHeader onSidebarToggle={toggleSidebar} />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={2} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        <div className="w-full justify-center flex">
          <main className="flex-1 overflow-y-auto">
            <div className="w-[97%] p-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by Order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">All Statuses</option>
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
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
                      {paginatedRows.length > 0 ? (
                        paginatedRows.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                              {order.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    statusStyles[order.status] || statusStyles.default
                                  }`}
                                >
                                  {order.status}
                                </span>
                                {order.refundReason && (
                                  <span className="text-red-600 text-xs" title={order.refundReason}>
                                    {/* (Refund) */}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{order.itemsQty}</td>
                            <td className="py-3 px-4">
                              <span className="text-gray-900 font-semibold">${order.total}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                                >
                                  <AiOutlineEye size={18} />
                                </button>
                                {/* <div className="relative">
                                  <button
                                    onClick={() => setShowStatusUpdate(showStatusUpdate === order.id ? null : order.id)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                                    disabled={updatingOrder === order.id}
                                  >
                                    <AiOutlineEdit size={18} />
                                  </button>
                                  {showStatusUpdate === order.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                      <div className="py-1">
                                        {availableStatuses.map((status) => (
                                          <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(order.id, status)}
                                            disabled={updatingOrder === order.id || status === order.status}
                                            className={`block px-4 py-2 text-sm w-full text-left ${
                                              status === order.status
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-700 hover:bg-gray-100"
                                            } ${updatingOrder === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                          >
                                            {status}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div> */}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 px-4 text-gray-500 text-center">
                            No orders found for the selected status or search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredRows.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedOrderId && (
        <AdminOrderDetails orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
};

export default AdminDashboardOrders;