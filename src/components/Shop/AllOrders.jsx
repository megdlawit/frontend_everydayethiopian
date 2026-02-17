import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight, AiOutlineEye } from "react-icons/ai";
import { Button } from "@material-ui/core";
import Pagination from "../Pagination";

const ITEMS_PER_PAGE = 10;

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (seller && seller._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter or search changes
  }, [filterStatus, searchQuery]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrders = orders
    ? filterStatus === "All"
      ? orders.filter((order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : orders.filter(
          (order) =>
            order.status === filterStatus &&
            order._id.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  const row = filteredOrders.map((item) => ({
    id: item._id,
    itemsQty: item.cart.reduce((acc, item) => acc + (item.qty || 1), 0),
    total: "US$ " + item.totalPrice,
    status: item.status,
  }));

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = row.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Define status styles
  const statusStyles = {
    Processing: "bg-[#FEF9C3] text-[#CA8A04]",
    "Transferred to delivery partner": "bg-purple-200 text-purple-800",
    Shipping: "bg-orange-200 text-orange-800",
    Received: "bg-teal-200 text-teal-800",
    "On the way": "bg-yellow-200 text-yellow-800",
    Delivered: "bg-green-200 text-green-800",
    default: "bg-gray-200 text-gray-800"
  };

  // Mobile Order Card Component
  const OrderCardMobile = ({ order }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">Order ID</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{order.id}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${
            statusStyles[order.status] || statusStyles.default
          }`}
        >
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
      
      <div className="flex justify-end">
        <Link to={`/order/${order.id}`}>
          <button className="flex items-center gap-1 text-xs text-[#CC9A00] hover:text-[#B8860B] font-medium">
            <AiOutlineEye size={14} />
            View Details
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full px-4 sm:px-8 pt-1 mt-6 sm:mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">All Orders</h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by Order ID..."
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CC9A00] w-full sm:w-64"
                />
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#CC9A00] w-full sm:w-auto"
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Transferred to delivery partner">Transferred</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Received">Received</option>
                  <option value="On the way">On the way</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
              {paginatedRows.length > 0 ? (
                <div className="space-y-3">
                  {paginatedRows.map((order) => (
                    <OrderCardMobile key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AiOutlineEye size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-700 text-sm">
                    No orders found for the selected status or search query.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-gray-500 text-sm">
                      <th className="py-2 px-4 text-left font-medium">Order ID</th>
                      <th className="py-2 px-4 text-left font-medium">Status</th>
                      <th className="py-2 px-4 text-left font-medium">Items Qty</th>
                      <th className="py-2 px-4 text-left font-medium">Total</th>
                      <th className="py-2 px-4 text-left font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-900 font-semibold">{order.id}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                statusStyles[order.status] || statusStyles.default
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{order.itemsQty}</td>
                          <td className="py-3 px-4 text-gray-700">{order.total}</td>
                          <td className="py-3 px-4">
                            <Link to={`/order/${order.id}`}>
                              <Button>
                                <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-3 px-4 text-gray-700 text-center">
                          No orders found for the selected status or search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={row.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllOrders;