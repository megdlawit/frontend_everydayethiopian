import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineSearch, AiOutlineEye, AiOutlineDelete, AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; // Adjust path to your custom Toast component
import { getAllSellers } from "../../redux/actions/sellers";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import DeleteModal from "../DeleteModal";

const AllSellers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sellers, isLoading } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const itemsPerPage = 5;

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
    dispatch(getAllSellers());
  }, [dispatch]);

  // Debug sellers data
  useEffect(() => {
    console.log("Sellers data:", sellers);
  }, [sellers]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}/shop/delete-seller/${id}`, { withCredentials: true });
      showToast("success", "Seller Deleted", "Seller deleted successfully!");
      dispatch(getAllSellers());
    } catch (error) {
      showToast("error", "Delete Failed", error.response?.data?.message || "Failed to delete seller.");
    }
    setOpen(false);
  };

  const handleViewDetails = (seller) => {
    setSelectedSeller(seller);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedSeller(null);
  };

  const handlePreviewShop = (seller) => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
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

  const filteredSellers = sellers?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item._id.toLowerCase().includes(searchLower)
    );
  }) || [];

  const indexOfLastSeller = currentPage * itemsPerPage;
  const indexOfFirstSeller = indexOfLastSeller - itemsPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

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
              <h3 className="text-lg font-semibold text-gray-900">All Sellers</h3>
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
                  <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-2 px-2 text-left font-medium w-[40px]">Seller ID</th>
                    <th className="py-2 px-4 text-left font-medium">Name</th>
                    <th className="py-2 px-4 text-left font-medium">Email</th>
                    <th className="py-2 px-4 text-left font-medium">Address</th>
                    <th className="py-2 px-4 text-left font-medium">Joined At</th>
                    <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSellers.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate" title={item._id}>
                        {item._id}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{item.name}</td>
                      <td className="py-3 px-4 text-gray-700">{item.email}</td>
                      <td className="py-3 px-4 text-gray-700">{item.address}</td>
                      <td className="py-3 px-4 text-gray-700">{item.createdAt.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            title="View Details"
                          >
                            <AiOutlineEye size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => {
                              setUserId(item._id);
                              setOpen(true);
                            }}
                            title="Delete Seller"
                          >
                            <AiOutlineDelete size={20} className="text-gray-600 hover:text-red-500 cursor-pointer" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredSellers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
          {open && (
            <DeleteModal
              open={open}
              onClose={() => setOpen(false)}
              onConfirm={() => handleDelete(userId)}
              title="Are you sure you want to delete this seller?"
            />
          )}

          {showDetailsModal && selectedSeller && !showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden animate-scaleIn">
                <div className="bg-[radial-gradient(circle_at_top,_#41666A_33%,_#1C3B3E_100%)] text-white flex items-center justify-between p-6 relative">
                  <div className="flex items-center gap-4">
                    {selectedSeller.avatar && selectedSeller.avatar.url ? (
                      <img
                        src={`${backend_url}${selectedSeller.avatar.url}`}
                        alt={`${selectedSeller.name} logo`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{selectedSeller.name || "Sewasew Deseign"}</h2>
                      <p className="text-sm opacity-80">ShopId- {selectedSeller._id || "12333678901239847"}</p>
                      <span className="inline-block mt-2 px-4 py-1 border border-[#FFC300] bg-[#FFF3CC] text-[#FFC300] rounded-full text-sm font-medium">
                        Approved
                      </span>
                    </div>
                  </div>
                  <button
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    onClick={handleCloseDetails}
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
                          {selectedSeller.email || "abebch@gmail.com"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Address</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedSeller.address || "Hayat, Addis Ababa"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Phone Number</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedSeller.phoneNumber || "0987654321"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Template</label>
                        <div
                          className="inline-block px-4 py-2 bg-purple-200 text-purple-800 rounded-full font-light cursor-pointer hover:bg-purple-300 transition-colors"
                          onClick={() => handlePreviewShop(selectedSeller)}
                        >
                          {selectedSeller.template || "Premium Plan"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && selectedSeller && (
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
                    src={getPreviewUrl(selectedSeller)}
                    title="Shop Preview"
                    className="w-full h-full min-h-[100vh] rounded-lg"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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

export default AllSellers;