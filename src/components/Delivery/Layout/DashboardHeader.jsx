import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiPackage } from "react-icons/fi";
import { BsFillMoonFill } from "react-icons/bs";
import { BiMessageSquareDetail } from "react-icons/bi";
import { AiOutlineBell, AiOutlineDown, AiOutlineUser } from "react-icons/ai";
import { CiSettings } from "react-icons/ci";
import { RxDashboard } from "react-icons/rx";
import { FaPowerOff } from "react-icons/fa";
import { server, backend_url } from "../../../server";
import api from "../../../utils/api";
import { toast } from "react-toastify";

const DashboardHeader = ({ onSidebarToggle }) => {
  const { deliveryUser } = useSelector((state) => state.delivery);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("authToken on mount:", token);
  }, []);

  const links = [
    { name: "Dashboard", path: "/delivery/dashboard", icon: RxDashboard },
    { name: "Orders", path: "/delivery/orders", icon: FiPackage },
    { name: "Settings", path: "/delivery/settings", icon: CiSettings },
  ];

  const avatarSrc = deliveryUser?.avatar?.url
    ? deliveryUser.avatar.url.startsWith("http")
      ? deliveryUser.avatar.url
      : `${backend_url}${deliveryUser.avatar.url.replace(/\\/g, "/")}`
    : `${backend_url}/uploads/avatar/default_avatar.png`;

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }
    const filteredLinks = links.filter((link) =>
      link.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredLinks);
    setIsSearchDropdownOpen(true);
  };

  const toggleSidebar = () => {
    console.log("Toggling sidebar");
    if (onSidebarToggle) onSidebarToggle();
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsProfileDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationDropdownOpen(false);
    setIsSearchDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.get(`${server}/delivery/logout`, { withCredentials: true });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("authToken");
    dispatch({ type: "LoadDeliveryUserSuccess", payload: null });
    navigate("/login");
  };

  const handleDeactivate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${server}/delivery/deactivate-account`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      console.log("Deactivate response:", response.data);
      toast.success("Account deactivated successfully!");
      if (response.data.suggestedDeliveries && response.data.suggestedDeliveries.length > 0) {
        const suggestions = response.data.suggestedDeliveries
          .map((d) => `${d.fullName} (${d.email})`)
          .join(", ");
        toast.info(`Suggested delivery users for reassignment: ${suggestions}`);
      }
      try {
        await api.get(`${server}/delivery/logout`, { withCredentials: true });
      } catch {}
      localStorage.removeItem("authToken");
      dispatch({ type: "LoadDeliveryUserSuccess", payload: null });
      navigate("/delivery/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Unable to deactivate account.";
      console.error("Deactivate error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex w-full">
      <div className="flex items-center justify-between bg-white border-r border-gray-100 w-[80px] md:w-64 h-20 fixed left-0 top-0 z-30 px-4 md:z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</span>
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>
      <header className="flex-1 w-full h-20 bg-white flex items-center justify-between px-4 pl-[104px] md:pl-72 pr-8 shadow-sm border-b border-gray-200 z-20">
        <div className="flex-1 flex justify-center relative">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 w-full max-w-xl shadow-sm">
            <FiSearch className="text-gray-400 mr-2 text-lg" />
            <input
              type="text"
              placeholder="Search dashboard sections..."
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {isSearchDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-12 w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
              <div className="space-y-2">
                {searchResults.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg p-2"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchDropdownOpen(false);
                    }}
                  >
                    <link.icon className="mr-2" size={20} />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {isSearchDropdownOpen && searchResults.length === 0 && searchQuery && (
            <div className="absolute top-12 w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
              <p className="text-gray-500 text-sm">No results found</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 min-w-max">
          <div className="relative">
            <button
              className="rounded-full p-2 bg-white border border-gray-200 hover:bg-gray-100 transition relative"
              onClick={toggleNotificationDropdown}
            >
              <AiOutlineBell className="text-gray-400 text-lg" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-orange-400 rounded-full border-2 border-white"></span>
            </button>
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
                <div className="space-y-2">
                  <Link to="/delivery/orders" className="flex items-center text-gray-700 hover:text-gray-900">
                    <FiPackage className="mr-2" /> Assigned Orders
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={toggleProfileDropdown} className="flex items-center gap-2 cursor-pointer focus:outline-none">
              <img
                src={avatarSrc}
                alt="Delivery User Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FFC300] shadow-sm"
                onError={(e) => {
                  e.target.src = `${backend_url}/uploads/avatar/default_avatar.png`;
                }}
              />
              <span className="text-base font-medium text-gray-700 hidden md:inline">{deliveryUser?.fullName || "Delivery User"}</span>
              <AiOutlineDown className="text-gray-400 text-xs" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-30 min-w-max">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900 text-base">{deliveryUser?.fullName || "Delivery User"}</div>
                  <div className="text-gray-500 text-sm">{deliveryUser?.email || "delivery@email.com"}</div>
                </div>
                <div className="divide-y divide-gray-100">
                  <Link
                    to="/delivery/settings"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <AiOutlineUser className="text-xl text-gray-500" /> Edit profile
                  </Link>
                  <Link
                    to="/delivery/support"
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <BiMessageSquareDetail className="text-xl text-gray-500" /> Support
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition w-full text-left"
                  >
                    <FiPackage className="text-xl text-gray-500 rotate-180" /> Sign out
                  </button>
                  {/* <button
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="flex items-center gap-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
                  >
                    <FaPowerOff className="text-xl text-red-500" /> Deactivate account
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deactivate Account</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate your account? This action will unassign all your active orders and prevent you from logging in until reactivated.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;