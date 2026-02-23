import React, { useEffect, useState } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineClose } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider } from "@material-ui/core";

const UnapprovedDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
    const fetchDeliveries = async () => {
      setIsLoading(true);
      try {
        console.log("Requesting:", `${server}/delivery/unapproved`);
        const { data } = await axios.get(`${server}/delivery/unapproved`, {
          withCredentials: true,
        });
        console.log("Response:", data);
        setDeliveries(data.deliveries || []);
      } catch (error) {
        console.error("Error details:", error.response?.data, error.message);
        const message = error.response?.data?.message || "Failed to fetch deliveries";
        showToast("error", "Fetch Error", message);
        if (message.includes("expired") || message.includes("login")) {
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`${server}/delivery/approve/${id}`, {}, { withCredentials: true });
      showToast("success", "Approval Success", "Delivery company approved successfully!");
      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery._id === id ? { ...delivery, status: "approved", isApproved: true } : delivery
        )
      );
      setSelectedDelivery(null);
    } catch (error) {
      showToast("error", "Approval Error", error.response?.data?.message || "Failed to approve delivery company.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.put(`${server}/delivery/decline/${id}`, {}, { withCredentials: true });
      showToast("success", "Decline Success", "Delivery company declined successfully!");
      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery._id === id ? { ...delivery, status: "declined" } : delivery
        )
      );
      setSelectedDelivery(null);
    } catch (error) {
      showToast("error", "Decline Error", error.response?.data?.message || "Failed to decline delivery company.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const { data } = await axios.get(`${server}/delivery/${id}`, {
        withCredentials: true,
      });
      setSelectedDelivery(data.delivery);
    } catch (error) {
      showToast("error", "Details Error", error.response?.data?.message || "Failed to fetch delivery details.");
    }
  };

  const filteredDeliveries = Array.isArray(deliveries)
    ? deliveries.filter((delivery) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          delivery.fullName?.toLowerCase().includes(searchLower) ||
          delivery._id?.toLowerCase().includes(searchLower) ||
          delivery.email?.toLowerCase().includes(searchLower);
        const matchesFilter = !isFiltered || delivery.status === "unapproved";
        return matchesSearch && matchesFilter;
      })
    : [];

  const indexOfLastDelivery = currentPage * itemsPerPage;
  const indexOfFirstDelivery = indexOfLastDelivery - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstDelivery, indexOfLastDelivery);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A";
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full max-w-4xl mx-auto pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Unapproved Deliveries</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name, ID, or Email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
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
            {filteredDeliveries.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-500">
                No deliveries found matching your search.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[100px]">
                            Delivery ID
                          </th>
                          <th className="py-2 px-4 text-left font-medium">Full Name</th>
                          <th className="py-2 px-4 text-left font-medium">Email</th>
                          <th className="py-2 px-4 text-left font-medium w-[100px]">
                            Status
                          </th>
                          <th className="py-2 px-4 text-left font-medium w-[200px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentDeliveries.map((delivery) => (
                          <tr key={delivery._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-gray-700 w-[100px] max-w-[100px] truncate"
                              title={delivery._id}
                            >
                              {delivery._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700 max-w-[200px] truncate">
                              {delivery.fullName || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700 max-w-[250px] truncate">
                              {delivery.email || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700 w-[100px]">
                              {formatStatus(delivery.status)}
                            </td>
                            <td className="py-3 px-4 text-center w-[200px]">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(delivery._id)}
                                  className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                  title="View Details"
                                >
                                  <AiOutlineEye size={20} />
                                </button>
                                {delivery.status === "unapproved" && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(delivery._id)}
                                      className="px-3 py-1 bg-[#CC9A00] text-white rounded-full text-sm font-semibold hover:bg-[#E6B800] transition-colors duration-200 shadow-md hover:shadow-lg"
                                      title="Approve"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleDecline(delivery._id)}
                                      className="px-3 py-1 bg-white text-[#CC9A00] border border-[#CC9A00] rounded-full text-sm font-semibold hover:bg-[#FFF5CC] transition-colors duration-200 shadow-md hover:shadow-lg"
                                      title="Reject"
                                    >
                                      Reject
                                    </button>
                                  </>
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
                    totalItems={filteredDeliveries.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {selectedDelivery && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 w-full h-full overflow-hidden transition-opacity duration-300">
              <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full mt-5 relative rounded-3xl shadow-lg p-8 overflow-y-auto max-h-[calc(150vh-2.5rem)] flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl flex flex-col gap-6 animate-[fadeIn_0.3s_ease-in-out,scaleIn_0.3s_ease-in-out]">
                  <button
                    className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-800 hover:bg-gradient-to-r hover:from-[#FFF5CC] hover:to-[#FFE082] transition-colors duration-200 shadow-sm hover:shadow-md"
                    onClick={() => setSelectedDelivery(null)}
                  >
                    <AiOutlineClose size={24} />
                  </button>
                  <h2 className="text-4xl text-gray-900 font-['quesha'] mb-6 text-center">
                    Delivery Details
                  </h2>
                  <div className="space-y-6 text-gray-800">
                    <div className="flex items-center gap-6 justify-center">
                      <img
                        src={
                          selectedDelivery.avatar?.url
                            ? `${backend_url}${selectedDelivery.avatar.url.replace(/\\/g, "/").replace(/\/Uploads\//, "/uploads/")}`
                            : `${backend_url}/uploads/avatar/default_avatar.png`
                        }
                        alt="Delivery User Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#FFC300] shadow-md hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = `${backend_url}/uploads/avatar/default_avatar.png`;
                        }}
                      />
                      <p className="font-semibold text-xl text-gray-900">
                        {selectedDelivery.fullName || "N/A"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="font-medium text-gray-800">Delivery ID:</span>{" "}
                        <span className="text-gray-900">{selectedDelivery._id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Email:</span>{" "}
                        <span className="text-gray-900">{selectedDelivery.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Phone Number:</span>{" "}
                        <span className="text-gray-900">{selectedDelivery.phoneNumber || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Coverage Area:</span>{" "}
                        <span className="text-gray-900">{selectedDelivery.coverageArea?.join(", ") || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Charge/Km:</span>{" "}
                        <span className="text-gray-900">{selectedDelivery.chargePerKm
                          ? `$${selectedDelivery.chargePerKm.toFixed(2)}`
                          : "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Status:</span>{" "}
                        <span className="text-gray-900">{formatStatus(selectedDelivery.status)}</span>
                      </div>
                    </div>
                  </div>
                  {selectedDelivery.status === "unapproved" && (
                    <div className="flex justify-center gap-4 mt-8">
                      <button
                        onClick={() => handleApprove(selectedDelivery._id)}
                        className="px-10 py-3 bg-[#CC9A00] text-white rounded-full text-base font-semibold hover:bg-[#E6B800] transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(selectedDelivery._id)}
                        className="px-10 py-3 bg-white text-[#CC9A00] border border-[#CC9A00] rounded-full text-base font-semibold hover:bg-[#FFF5CC] transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        Reject
                      </button>
                    </div>
                  )}
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

export default UnapprovedDeliveries;