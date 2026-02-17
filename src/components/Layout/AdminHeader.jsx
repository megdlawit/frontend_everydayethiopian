import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiPackage } from "react-icons/fi";
import { BsFillMoonFill } from "react-icons/bs";
import { BiMessageSquareDetail } from "react-icons/bi";
import { AiOutlineBell, AiOutlineDown, AiOutlineGift } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { backend_url } from "../../server";

const AdminHeader = ({ onSidebarToggle }) => {
  const { user } = useSelector((state) => state.user);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Define available admin dashboard routes for search
  const adminRoutes = [
    { name: "Dashboard", path: "/admin/dashboard", keywords: ["dashboard", "home", "overview"] },
    { name: "All Orders", path: "/admin-orders", keywords: ["orders", "all orders", "purchases"] },
    { name: "All Categories", path: "/dashboard-categories", keywords: ["categories", "all categories", "types"] },
    { name: "All Sellers", path: "/admin-sellers", keywords: ["sellers", "all sellers", "vendors"] },
    { name: "All Users", path: "/admin-users", keywords: ["users", "all users", "customers"] },
    { name: "All Products", path: "/admin-products", keywords: ["products", "all products", "items"] },
    { name: "All Events", path: "/admin-events", keywords: ["events", "all events", "activities"] },
    { name: "All Shop Approval", path: "/admin/pending-shops", keywords: ["shop approval", "pending shops", "approvals"] },
    { name: "Unapproved Deliveries", path: "/admin/unapproved-deliveries", keywords: ["deliveries", "unapproved deliveries", "shipping"] },
    { name: "Withdraw Request", path: "/admin-withdraw-request", keywords: ["withdraw", "request", "payout"] },
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

    // Filter routes based on query matching name or keywords
    const filteredResults = adminRoutes.filter(
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
  let avatarSrc = `${backend_url}/Uploads/avatar/default_avatar.png`; // Default avatar
  if (user?.avatar?.url) {
    avatarSrc = user.avatar.url.startsWith("http")
      ? user.avatar.url
      : `${backend_url}/Uploads/avatar/${user.avatar.url.split("/").pop()}`;
  }

  const toggleSidebar = () => {
    if (onSidebarToggle) onSidebarToggle();
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark");
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsProfileDropdownOpen(false);
    setSearchResults([]); // Close search results when opening notifications
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationDropdownOpen(false);
    setSearchResults([]); // Close search results when opening profile
  };

  return (
    <div className="flex w-full">
      {/* Sidebar Logo Section (fixed, always visible) */}
      <div className="hidden md:flex flex-col items-center justify-center bg-white border-r border-gray-100 w-64 h-20 fixed left-0 top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Admin</span>
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
              placeholder="Search or type command... (e.g., orders, sellers)"
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              aria-label="Search admin dashboard"
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
                  <Link to="/dashboard/cupouns" className="flex items-center text-gray-700 hover:text-gray-900">
                    <AiOutlineGift className="mr-2" /> Discount Codes
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">2</span>
                  </Link>
                  <Link to="/dashboard-events" className="flex items-center text-gray-700 hover:text-gray-900">
                    <MdOutlineLocalOffer className="mr-2" /> All Events
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">3</span>
                  </Link>
                  <Link to="/dashboard-products" className="flex items-center text-gray-700 hover:text-gray-900">
                    <FiShoppingBag className="mr-2" /> All Products
                    <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">4</span>
                  </Link>
                  <Link to="/dashboard-orders" className="flex items-center text-gray-700 hover:text-gray-900">
                    <FiPackage className="mr-2" /> All Orders
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">5</span>
                  </Link>
                  <Link to="/dashboard-messages" className="flex items-center text-gray-700 hover:text-gray-900">
                    <BiMessageSquareDetail className="mr-2" /> Messages
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">3</span>
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
                  e.target.src = `${backend_url}/Uploads/avatar/default_avatar.png`;
                }}
              />
              <span className="text-base font-medium text-gray-700 hidden md:inline">{user?.name || "User"}</span>
              <AiOutlineDown className="text-gray-400 text-xs" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-30 min-w-max">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900 text-base">{user?.name || "User Name"}</div>
                  <div className="text-gray-500 text-sm">{user?.email || "user@email.com"}</div>
                </div>
                <div className="divide-y divide-gray-100">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <AiOutlineUser className="text-xl text-gray-400" /> Edit profile
                  </Link>
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
                  <Link
                    to="/logout"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <FiPackage className="text-xl text-gray-400 rotate-180" /> Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default AdminHeader;