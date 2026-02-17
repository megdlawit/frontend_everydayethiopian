import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight, AiOutlineEye } from "react-icons/ai";
import { Button } from "@material-ui/core";
import Pagination from "../Pagination";

const ITEMS_PER_PAGE = 10;

const AllRefundOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (seller && seller._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const refundOrders = orders
    ? orders.filter(
        (item) =>
          (item.status === "Refund Requested" || item.status === "Refund Processed") &&
          item._id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const row = refundOrders.map((item) => ({
    id: item._id,
    itemsQty: item.cart.reduce((acc, item) => acc + (item.qty || 1), 0),
    total: "US$ " + item.totalPrice,
    status: item.status,
  }));

  // Calculate paginated data
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = row.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Mobile Card Component
  const RefundOrderCard = ({ order }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">Order ID: {order.id}</h3>
          <div className="mt-2">
            {order.status === "Refund Processed" && (
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                Refund Processed
              </span>
            )}
            {order.status === "Refund Requested" && (
              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
                Refund Requested
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500">Items Qty</p>
          <p className="text-sm font-semibold text-gray-900">{order.itemsQty}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-semibold text-gray-900">{order.total}</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Link to={`/order/${order.id}`} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <AiOutlineEye size={18} className="mr-1" />
          View Details
        </Link>
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
              <h3 className="text-lg font-semibold text-gray-900">All Refund Orders</h3>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by Order ID..."
                  className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none w-full md:w-auto"
                />
              </div>
            </div>

            {/* Orders List - Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((order) => (
                    <RefundOrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No refund orders found for the search query.
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Table */
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
                            {order.status === "Refund Processed" && (
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                                Refund Processed
                              </span>
                            )}
                            {order.status === "Refund Requested" && (
                              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
                                Refund Requested
                              </span>
                            )}
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
                          No refund orders found for the search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={row.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AllRefundOrders;