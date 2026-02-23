import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineEdit, AiOutlineClose } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { Link } from "react-router-dom";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");
  const itemsPerPage = 5;

  // Custom theme for Material-UI components
  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

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
    const fetchWithdraws = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`${server}/withdraw/get-all-withdraw-request`, {
          withCredentials: true,
        });
        setData(res.data.withdraws || []);
      } catch (error) {
        showToast("error", "Fetch Error", error.response?.data?.message || "Failed to fetch withdraw requests.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWithdraws();
  }, []);

  const handleSubmit = async () => {
    try {
      await api.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        { sellerId: withdrawData.shopId, status: withdrawStatus },
        { withCredentials: true }
      );
      showToast("success", "Update Success", "Withdraw request updated successfully!");
      setData((prev) =>
        prev.map((item) =>
          item._id === withdrawData.id ? { ...item, status: withdrawStatus } : item
        )
      );
      setOpen(false);
    } catch (error) {
      showToast("error", "Update Error", error.response?.data?.message || "Failed to update withdraw request.");
    }
  };

  const handleViewDetails = (item) => {
    setWithdrawData({
      id: item._id,
      shopId: item.seller._id,
      name: item.seller.name,
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
      avatar: item.seller.avatar,
    });
    setWithdrawStatus(item.status);
    setOpen(true);
  };

  const filteredWithdraws = Array.isArray(data)
    ? data.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.seller?.name?.toLowerCase().includes(searchLower) ||
          item._id?.toLowerCase().includes(searchLower);
        const matchesFilter = !isFiltered || item.status === "Processing";
        return matchesSearch && matchesFilter;
      })
    : [];

  const indexOfLastWithdraw = currentPage * itemsPerPage;
  const indexOfFirstWithdraw = indexOfLastWithdraw - itemsPerPage;
  const currentWithdraws = filteredWithdraws.slice(indexOfFirstWithdraw, indexOfLastWithdraw);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Withdraw Requests</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <AiOutlineSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
                <button
                  onClick={handleFilterToggle}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Filter
                </button>
              </div>
            </div>
            {filteredWithdraws.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-500">
                No withdraw requests found matching your search.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[40px]">Withdraw ID</th>
                          <th className="py-2 px-4 text-left font-medium">Shop Name</th>
                          <th className="py-2 px-4 text-left font-medium">Shop ID</th>
                          <th className="py-2 px-4 text-left font-medium">Amount</th>
                          <th className="py-2 px-4 text-left font-medium">Status</th>
                          <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentWithdraws.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate"
                              title={item._id}
                            >
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.seller?.name || "N/A"}</td>
                            <td className="py-3 px-4 text-gray-700">{item.seller?._id || "N/A"}</td>
                            <td className="py-3 px-4 text-gray-700">
                              {item.amount ? `US$ ${item.amount}` : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.status === "Succeed"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(item)}
                                  className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                >
                                  <AiOutlineEye size={20} />
                                </button>
                                {item.status === "Processing" && (
                                  <button
                                    onClick={() => {
                                      setWithdrawData({
                                        id: item._id,
                                        shopId: item.seller._id,
                                        name: item.seller.name,
                                        amount: item.amount,
                                        status: item.status,
                                        createdAt: item.createdAt,
                                        avatar: item.seller.avatar,
                                      });
                                      setWithdrawStatus(item.status);
                                      setOpen(true);
                                    }}
                                    className="text-gray-600 hover:text-green-500 cursor-pointer"
                                  >
                                    <AiOutlineEdit size={20} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ThemeProvider>
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredWithdraws.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {open && withdrawData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-[radial-gradient(circle_at_top,_#41666A_33%,_#1C3B3E_100%)] text-white flex items-center justify-between p-6 relative">
                  {/* Profile Image + Info */}
                  <div className="flex items-center gap-4">
                    {withdrawData.avatar && withdrawData.avatar.url ? (
                      <img
                        src={`${backend_url}${withdrawData.avatar.url}`}
                        alt={`${withdrawData.name} logo`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{withdrawData.name || "N/A"}</h2>
                      <p className="text-sm opacity-80">Withdraw ID: {withdrawData.id || "N/A"}</p>
                      <span className="inline-block mt-2 px-4 py-1 border border-[#FFC300] bg-[#FFF3CC] text-[#FFC300] rounded-full text-sm font-medium">
                        {withdrawData.status || "Processing"}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {withdrawData.status === "Processing" && (
                      <button
                        onClick={() => {
                          setWithdrawStatus("Succeed");
                          handleSubmit();
                        }}
                        className="px-5 py-2 bg-[#FFC300] text-white rounded-full hover:bg-yellow-500 font-semibold shadow"
                      >
                        Succeed
                      </button>
                    )}
                  </div>
                  {/* Close Icon */}
                  <button
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    onClick={() => setOpen(false)}
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-8">
                  <div className="border rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Shop ID</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {withdrawData.shopId || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Amount</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {withdrawData.amount ? `US$ ${withdrawData.amount}` : "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Request Date</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {withdrawData.createdAt ? withdrawData.createdAt.slice(0, 10) : "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Status</label>
                        {withdrawData.status === "Succeed" ? (
                          <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                            {withdrawData.status}
                          </div>
                        ) : (
                          <select
                            value={withdrawStatus}
                            onChange={(e) => setWithdrawStatus(e.target.value)}
                            className="w-full px-4 py-2 border rounded-full text-gray-600 font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Succeed">Succeed</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toastify container */}
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

      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-in-out;
          }
        `}
      </style>
    </>
  );
};

export default AllWithdraw;