import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Layout/Loader";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { Button } from "@material-ui/core";
import { AiOutlineEye } from "react-icons/ai";
import Pagination from "../Pagination";
import AdminOrderDetails from "../../components/Admin/AdminOrderDetails";

const ITEMS_PER_PAGE = 10;

const AllRefundOrdersAdmin = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const refundOrders = adminOrders
    ? adminOrders.filter((item) => {
        // Determine if this order has any refund activity (master or sub-orders)
        const collectStatuses = [];
        if (item.refundRequests?.length) collectStatuses.push(...item.refundRequests.map(r => r.status));
        if (item.subOrders?.length) item.subOrders.forEach(sub => { if (sub.refundRequests?.length) collectStatuses.push(...sub.refundRequests.map(r => r.status)); });
        const hasRefund = item.status === "Refund Requested" || item.status === "Refund Processed" || collectStatuses.length > 0 || (item.subOrders && item.subOrders.some(sub => sub.status === "Refund Requested" || sub.status === "Refund Processed"));
        const matchesSearch = item._id.toLowerCase().includes(searchQuery.toLowerCase());
        return hasRefund && matchesSearch;
      })
    : [];

  const row = refundOrders.map((item) => ({
    id: item._id,
    itemsQty: item.cart.reduce((acc, cartItem) => acc + (cartItem.qty || 1), 0),
    total: "US$ " + item.totalPrice,
    // Aggregate refund request statuses (prefer success > rejected > vendor approved > pending)
    status: (() => {
      const statuses = [];
      if (item.refundRequests?.length) statuses.push(...item.refundRequests.map(r => r.status));
      if (item.subOrders?.length) item.subOrders.forEach(sub => { if (sub.refundRequests?.length) statuses.push(...sub.refundRequests.map(r => r.status)); });
      if (statuses.includes("Refund Success") || item.status === "Refund Processed") return "Refund Processed";
      if (statuses.includes("Rejected")) return "Refund Rejected";
      if (statuses.includes("Vendor Approved")) return "Vendor Approved";
      if (statuses.includes("Pending") || item.status === "Refund Requested") return "Refund Requested";
      return item.status;
    })(),
  }));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = row.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Refund Orders</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID..."
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium focus:outline-none"
              />
            </div>
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
                          {order.status === "Refund Rejected" && (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                              Refund Rejected
                            </span>
                          )}
                          {order.status === "Vendor Approved" && (
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                              Vendor Approved
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{order.itemsQty}</td>
                        <td className="py-3 px-4 text-gray-700">{order.total}</td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                          >
                            <AiOutlineEye size={20} />
                          </Button>
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
            {/* Pagination */}
            {row.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={row.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  maxPagesToShow={5}
                />
              </div>
            )}
          </div>
          {selectedOrderId && (
            <AdminOrderDetails orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
          )}
        </div>
      )}
    </>
  );
};

export default AllRefundOrdersAdmin;