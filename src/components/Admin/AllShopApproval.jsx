import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; 
import { AiOutlineSearch, AiOutlineEye, AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { server, backend_url } from "../../server";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider } from "@material-ui/core";

const AllShopApproval = () => {
  const [pendingShops, setPendingShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const itemsPerPage = 5;

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
    const fetchPendingShops = async () => {
      setIsLoading(true);
      try {
        console.log("Requesting:", `${server}/shop/admin/pending-shops`);
        const { data } = await axios.get(`${server}/shop/admin/pending-shops`, {
          withCredentials: true,
        });
        console.log("Response:", data);
        setPendingShops(data.pendingShops || []);
      } catch (error) {
        console.error("Error details:", error.response?.data, error.message);
        const message = error.response?.data?.message || "Failed to fetch pending shops";
        showToast("error", "Fetch Error", message);
        if (message.includes("expired") || message.includes("login")) {
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingShops();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${server}/shop/admin/approve-shop/${id}`, {}, { withCredentials: true });
      showToast("success", "Shop Approved", "Shop approved successfully!");
      setPendingShops((prev) =>
        prev.map((shop) =>
          shop._id === id ? { ...shop, status: "approved" } : shop
        )
      );
      setSelectedShop(null);
      setShowPreview(false);
    } catch (error) {
      showToast("error", "Approval Error", error.response?.data?.message || "Failed to approve shop.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.put(`${server}/shop/admin/decline-shop/${id}`, {}, { withCredentials: true });
      showToast("success", "Shop Declined", "Shop declined successfully!");
      setPendingShops((prev) =>
        prev.map((shop) =>
          shop._id === id ? { ...shop, status: "declined" } : shop
        )
      );
      setSelectedShop(null);
      setShowPreview(false);
    } catch (error) {
      showToast("error", "Decline Error", error.response?.data?.message || "Failed to decline shop.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const { data } = await axios.get(`${server}/shop/admin/view-shop/${id}`, {
        withCredentials: true,
      });
      setSelectedShop(data.shop);
    } catch (error) {
      showToast("error", "Details Error", error.response?.data?.message || "Failed to fetch shop details.");
    }
  };

  const handlePreviewShop = (shop) => {
    setSelectedShop(shop);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    // Keep selectedShop to return to the detail modal
  };

  const filteredShops = Array.isArray(pendingShops)
    ? pendingShops.filter((shop) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          shop.name?.toLowerCase().includes(searchLower) ||
          shop._id?.toLowerCase().includes(searchLower) ||
          shop.email?.toLowerCase().includes(searchLower);
        const matchesFilter = !isFiltered || shop.status === "pending";
        return matchesSearch && matchesFilter;
      })
    : [];

  const indexOfLastShop = currentPage * itemsPerPage;
  const indexOfFirstShop = indexOfLastShop - itemsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A";
  };

  const getPreviewUrl = (shop) => {
    const selectedTemplate = shop.template || "basic";
    const plan = shop.plan || "free";
    const billingCycle = shop.billingCycle || "monthly";
    return selectedTemplate
      ? `${
          selectedTemplate === "growthplan"
            ? `/shop/growthplan/${shop._id}`
            : selectedTemplate === "proplan"
            ? `/shop/proplan/${shop._id}`
            : `/shop/preview/${shop._id}`
        }?plan=${encodeURIComponent(plan)}&template=${encodeURIComponent(selectedTemplate)}&billingCycle=${encodeURIComponent(billingCycle)}`
      : '';
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full max-w-4xl mx-auto pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Shop Requests</h3>
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
            {filteredShops.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-500">
                No shops found matching your search.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[100px]">
                            Shop ID
                          </th>
                          <th className="py-2 px-4 text-left font-medium">Shop Name</th>
                          <th className="py-2 px-4 text-left font-medium">Email</th>
                          <th className="py-2 px-4 text-left font-medium w-[100px]">
                            Status
                          </th>
                          <th className="py-2 px-4 text-left font-medium w-[200px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentShops.map((shop) => (
                          <tr key={shop._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-gray-700 w-[100px] max-w-[100px] truncate"
                              title={shop._id}
                            >
                              {shop._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700 max-w-[200px] truncate">
                              {shop.name || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700 max-w-[250px] truncate">
                              {shop.email || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700 w-[100px]">
                              {formatStatus(shop.status)}
                            </td>
                            <td className="py-3 px-4 text-center w-[200px]">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(shop._id)}
                                  className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                  title="View Details"
                                >
                                  <AiOutlineEye size={20} />
                                </button>
                                {/* <button
                                  onClick={() => handlePreviewShop(shop)}
                                  className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                  title="Preview Shop"
                                >
                                  <AiOutlineSearch size={20} />
                                </button> */}
                                {shop.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(shop._id)}
                                      className="px-3 py-1 bg-[#CC9A00] text-white rounded-full text-sm font-semibold hover:bg-[#E6B800] transition-colors duration-200 shadow-md hover:shadow-lg"
                                      title="Approve"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleDecline(shop._id)}
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
                    totalItems={filteredShops.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {selectedShop && !showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden animate-scaleIn">
                <div className="bg-[radial-gradient(circle_at_top,_#41666A_33%,_#1C3B3E_100%)] text-white flex items-center justify-between p-6 relative">
                  <div className="flex items-center gap-4">
                    {selectedShop.avatar && selectedShop.avatar.url ? (
                      <img
                        src={`${backend_url}${selectedShop.avatar.url}`}
                        alt={`${selectedShop.name} logo`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{selectedShop.name || "Sewasew Deseign"}</h2>
                      <p className="text-sm opacity-80">ShopId- {selectedShop._id || "12333678901239847"}</p>
                      <span className="inline-block mt-2 px-4 py-1 border border-[#FFC300] bg-[#FFF3CC] text-[#FFC300] rounded-full text-sm font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedShop._id)}
                      className="px-5 py-2 bg-[#FFC300] text-white rounded-full hover:bg-yellow-500 font-semibold shadow"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(selectedShop._id)}
                      className="px-5 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 font-semibold shadow"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    onClick={() => setSelectedShop(null)}
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>
                <div className="p-8">
                  <div className="border rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Email</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.email || "abebch@gmail.com"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Address</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.address || "Hayat, Addis Ababa"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Phone Number</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.phoneNumber || "0987654321"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Template</label>
                        <div
                          className="inline-block px-4 py-2 bg-purple-200 text-purple-800 rounded-full font-light cursor-pointer hover:bg-purple-300 transition-colors"
                          onClick={() => handlePreviewShop(selectedShop)}
                        >
                          {selectedShop.template || "Premium Plan"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && selectedShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 pointer-events-auto animate-scaleIn">
              <div
                className="absolute w-[1000px] h-[900px] rounded-full z-[-1]"
                style={{
                  background: `radial-gradient(circle, rgba(255, 193, 7, 0.7) 0%, rgba(255, 193, 7, 0.4) 40%, transparent 70%)`,
                  filter: 'blur(100px)',
                  opacity: 0.8,
                }}
              />
              <div className="relative rounded-2xl w-full max-w-7xl flex flex-col max-h-[100vh] mt-[2rem] overflow-y-hidden">
                <button
                  onClick={handleClosePreview}
                  className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 rounded-full p-2 transition-colors z-50"
                  aria-label="Close preview"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex-1 rounded-lg border border-gray-200 shadow-inner">
                  <iframe
                    src={getPreviewUrl(selectedShop)}
                    title="Shop Preview"
                    className="w-full h-full min-h-[100vh] rounded-lg"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="sticky bottom-10 pt-4 pb-4 flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => handleApprove(selectedShop._id)}
                    className="bg-[#CC9A00] text-white px-8 py-3 rounded-full font-avenir-lt-std hover:bg-[#FFB300] transition-colors shadow-md text-lg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(selectedShop._id)}
                    className="bg-gray-500 text-white px-8 py-3 rounded-full font-avenir-lt-std hover:bg-gray-600 transition-colors shadow-md text-lg"
                  >
                    Decline
                  </button>
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
          @import url('https://fonts.cdnfonts.com/css/avenir-lt-std');
          .font-avenir-lt-std {
            font-family: 'Avenir LT Std', sans-serif;
          }
        `}
      </style>
    </>
  );
};

export default AllShopApproval;