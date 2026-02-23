import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiPackage } from "react-icons/fi";
import { BsFillMoonFill } from "react-icons/bs";
import { BiMessageSquareDetail } from "react-icons/bi";
import { AiOutlineBell, AiOutlineDown, AiOutlineUser } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { logoutSeller } from "../../../redux/actions/sellers";
// import { logoutUser } from "../../../redux/actions/user"; 
import { toast } from "react-toastify";
import api from "../../../utils/api";
import { server } from "../../../server";
import Toast from "../../Toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashboardHeader = ({ onSidebarToggle }) => {
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Determine if the current user is a seller or regular user
  const account = seller || user;
  const isSeller = !!seller;

  // Define available dashboard routes for search
  const dashboardRoutes = [
    { name: "Dashboard", path: "/dashboard", keywords: ["dashboard", "home", "overview"] },
    { name: "All Orders", path: "/dashboard-orders", keywords: ["orders", "all orders", "purchases"] },
    { name: "All Products", path: "/dashboard-products", keywords: ["products", "all products", "items"] },
    { name: "All Video Products", path: "/dashboard-allvideo", keywords: ["video products", "videos", "media"] },
    { name: "All Events", path: "/dashboard-events", keywords: ["events", "all events", "activities"] },
    { name: "Withdraw Money", path: "/dashboard-withdraw-money", keywords: ["withdraw", "money", "payout"] },
    { name: "Shop Inbox", path: "/dashboard-messages", keywords: ["messages", "inbox", "chat"] },
    { name: "Discount Codes", path: "/dashboard-coupouns", keywords: ["discounts", "coupons", "codes"] },
    { name: "Refunds", path: "/dashboard-refunds", keywords: ["refunds", "returns", "reimbursements"] },
    { name: "Edit Profile", path: "/profile", keywords: ["profile", "edit profile", "account"] },
    { name: "Account Settings", path: "/settings", keywords: ["settings", "account settings", "preferences"] },
    { name: "Support", path: "/support", keywords: ["support", "help", "assistance"] },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredResults = dashboardRoutes.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        route.keywords.some((keyword) => keyword.includes(query))
    );
    setSearchResults(filteredResults);
  };

  // Handle search result selection
  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(path);
  };

  // Handle Enter key to navigate to the top result
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleResultClick(searchResults[0].path);
    }
  };

  // Avatar src logic
  let avatarSrc = "/Uploads/placeholder-image.jpg";
  if (account?.avatar?.url) {
    if (account.avatar.url.startsWith("http")) {
      avatarSrc = account.avatar.url;
    } else if (account.avatar.url.startsWith("/")) {
      avatarSrc = `${process.env.REACT_APP_BACKEND_URL || ""}${account.avatar.url}`;
    } else {
      avatarSrc = `/Uploads/avatar/${account.avatar.url}`;
    }
  }

  // Determine shop edit URL based on template (for sellers only)
  const shopEditUrl = isSeller
    ? account?.template
      ? `http://localhost:3000/shop${account.template === "basic" ? "" : `/${account.template}`}/edit/${account._id}`
      : `http://localhost:3000/shop/edit/${account._id}`
    : "/profile";

  const toggleSidebar = () => {
    if (onSidebarToggle) onSidebarToggle();
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark");
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsProfileDropdownOpen(false);
    setSearchResults([]);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationDropdownOpen(false);
    setSearchResults([]);
  };

  const handleLogout = async () => {
    try {
      if (isSeller) {
        await dispatch(logoutSeller());
      } else {
        // await dispatch(logoutUser());
      }
      navigate("/login");
    } catch (err) {
      showToast("error", "Logout Error", "Failed to log out.");
    }
  };

  // Open deactivation modal
  const handleOpenDeactivateModal = () => {
    setIsDeactivateModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  // Close deactivation modal
  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
  };

  // Deactivate account handler
  const handleDeactivate = async () => {
    try {
      const endpoint = isSeller ? `${server}/shop/deactivate-account` : `${server}/user/deactivate`;
      await api.put(endpoint, {}, { withCredentials: true });
      showToast("success", "Deactivate Success", "Account deactivated successfully.");
      if (isSeller) {
        await dispatch(logoutSeller());
      } else {
        // await dispatch(logoutUser());
      }
      navigate("/login");
    } catch (err) {
      showToast("error", "Deactivate Error", err?.response?.data?.message || "Failed to deactivate account.");
    }
    setIsDeactivateModalOpen(false);
  };

  return (
    <div className="flex w-full">
      {/* Sidebar Logo Section */}
      <div className="hidden md:flex flex-col items-center justify-center bg-white border-r border-gray-100 w-64 h-20 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</span>
        </div>
      </div>
      {/* Main Header Bar */}
      <header className="flex-1 w-full h-20 bg-white flex items-center justify-between px-4 md:pl-72 md:pr-8 shadow-sm border-b border-gray-200 z-30">
        <div className="flex items-center min-w-max">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-yellow-400 mr-2"
            aria-label="Toggle sidebar"
          >
            <FiMenu size={24} />
          </button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 w-full max-w-xl shadow-sm">
            <FiSearch className="text-gray-400 mr-2 text-lg" />
            <input
              type="text"
              placeholder="Search or type command... (e.g., orders, products)"
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              aria-label="Search dashboard"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-14 w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.path)}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                >
                  {result.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 min-w-max">
          <div className="relative">
            <button
              className="rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-100 transition relative"
              onClick={toggleNotificationDropdown}
              aria-label="Notifications"
            >
              <AiOutlineBell className="text-gray-400 text-lg" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-orange-400 rounded-full border-2 border-white"></span>
            </button>
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                <div className="space-y-2">
                  <Link to="/dashboard-orders" className="flex items-center text-gray-700 hover:text-gray-900">
                    <FiPackage className="mr-2" /> Orders
                  </Link>
                  <Link to="/dashboard-messages" className="flex items-center text-gray-700 hover:text-gray-900">
                    <BiMessageSquareDetail className="mr-2" /> Messages
                  </Link>
                    <Link to="/dashboard-refunds" className="flex items-center text-gray-700 hover:text-gray-900">
                    <FiPackage className="mr-2" /> Refunds
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              aria-label="Profile menu"
            >
              <img
                src={avatarSrc}
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
              <span className="text-base font-medium text-gray-700 hidden md:inline">{account?.name || "User"}</span>
              <AiOutlineDown className="text-gray-400 text-xs" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-30 min-w-max">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900 text-base">{account?.name || "User Name"}</div>
                  <div className="text-gray-500 text-sm">{account?.email || "user@email.com"}</div>
                </div>
                <div className="divide-y divide-gray-100">
                  <a
                    href={shopEditUrl}
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <AiOutlineUser className="text-xl text-gray-400" /> {isSeller ? "Edit my shop" : "Edit profile"}
                  </a>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <CiSettings className="text-xl text-gray-400" /> Account settings
                  </Link>
                  <Link
                    to="/support"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <BiMessageSquareDetail className="text-xl text-gray-400" /> Support
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition w-full text-left"
                  >
                    <FiPackage className="text-xl text-gray-400 rotate-180" /> Sign out
                  </button>
                  {/* <button
                    onClick={handleOpenDeactivateModal}
                    className="flex items-center gap-3 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left font-semibold"
                  >
                    <span className="text-xl">⚠️</span> Deactivate Account
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Deactivation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deactivate Account</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to deactivate your account?
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              {isSeller ? (
                <>
                  <li>- Your shop will be marked as inactive/closed</li>
                  <li>- Your products will not be visible or purchasable</li>
                  <li>- Your events and activities will not be displayed</li>
                  <li>- You will not be able to list or edit products</li>
                  <li>- Your order, payout, and review history will be preserved</li>
                </>
              ) : (
                <>
                  <li>- Your account will be marked as inactive</li>
                  <li>- You will not be able to access account features</li>
                  <li>- Your data will be preserved for reactivation</li>
                </>
              )}
              <li>- You can reactivate your account later by contacting support or logging in again (if allowed)</li>
            </ul>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseDeactivateModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default DashboardHeader;