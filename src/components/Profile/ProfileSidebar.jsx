import React, { useState } from "react";
import { 
  AiOutlineLogin, 
  AiOutlineMessage, 
  AiOutlineMenu, 
  AiOutlineClose 
} from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { MdOutlineAdminPanelSettings, MdOutlineSettings, MdOutlineArrowDropDown } from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import { RxPerson } from "react-icons/rx";
import { FiUserX } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Toast from "../../components/Toast"; 

const ProfileSidebar = ({ setActive, active, isMobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Determine active sub-section based on URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const currentSection = queryParams.get("section") || "";

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false,
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  const logoutHandler = () => {
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        showToast("success", "Success", res.data.message);
        window.location.reload(true);
        navigate("/login");
      })
      .catch((error) => {
        showToast("error", "Error", error.response?.data?.message || "Logout failed");
      });
  };

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown((prev) => !prev);
    setActive(6);
    navigate("/profile?section=settings");
  };

  const handleSettingsItemClick = (section) => {
    const activeState = section === "address" ? 7 : section === "deactivate" ? 9 : 6;
    setActive(activeState);
    setShowSettingsDropdown(true);
    navigate(`/profile?section=${section}`);
    
    // Close mobile sidebar when item is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleNavigation = (activeNumber, path = "/profile", section = "") => {
    setActive(activeNumber);
    if (section) {
      navigate(`${path}?section=${section}`);
    } else {
      navigate(path);
    }
    
    // Close mobile sidebar when item is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-full bg-white shadow-sm rounded-[10px] p-4 pt-8
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
        w-[280px] sm:w-[335px] lg:w-full
        overflow-y-auto
      `}>
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <AiOutlineClose size={20} className="text-gray-600" />
          </button>
        </div>

        <nav className="mt-2 space-y-1">
          {/* Profile */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 1 && !currentSection ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={() => handleNavigation(1)}
          >
            <RxPerson size={20} className={`${active === 1 && !currentSection ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm ${active === 1 && !currentSection ? "text-yellow-500" : "text-gray-700"}`}>Profile</span>
          </div>

          {/* Orders */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 2 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={() => handleNavigation(2, "/profile", "orders")}
          >
            <HiOutlineShoppingBag size={20} className={`${active === 2 ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm ${active === 2 ? "text-yellow-500" : "text-gray-700"}`}>Orders</span>
          </div>

          {/* Refunds */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 3 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={() => handleNavigation(3, "/profile", "refunds")}
          >
            <HiOutlineReceiptRefund size={20} className={`${active === 3 ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm ${active === 3 ? "text-yellow-500" : "text-gray-700"}`}>Refunds</span>
          </div>

          {/* Inbox */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 4 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={() => handleNavigation(4, "/inbox")}
          >
            <AiOutlineMessage size={20} className={`${active === 4 ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm ${active === 4 ? "text-yellow-500" : "text-gray-700"}`}>Inbox</span>
          </div>

          {/* Settings Dropdown */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 6 || active === 7 || active === 9 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={toggleSettingsDropdown}
          >
            <MdOutlineSettings size={20} className={`${active === 6 || active === 7 || active === 9 ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm flex-1 ${active === 6 || active === 7 || active === 9 ? "text-yellow-500" : "text-gray-700"}`}>Settings</span>
            <MdOutlineArrowDropDown
              size={20}
              className={`${
                active === 6 || active === 7 || active === 9 ? "text-yellow-500" : "text-gray-500"
              } transform ${showSettingsDropdown ? "rotate-180" : "rotate-0"} transition-transform duration-300`}
            />
          </div>

          {/* Settings Dropdown Items */}
          {showSettingsDropdown && (
            <div className="ml-4 sm:ml-6 space-y-1 border-l-2 border-gray-200 pl-2 sm:pl-4">
              <div
                className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
                  currentSection === "change-password" ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
                }`}
                onClick={() => handleSettingsItemClick("change-password")}
              >
                <RiLockPasswordLine size={18} className={`${currentSection === "change-password" ? "text-yellow-500" : "text-gray-500"}`} />
                <span className={`ml-3 text-sm ${currentSection === "change-password" ? "text-yellow-500" : "text-gray-700"}`}>Change Password</span>
              </div>
              <div
                className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
                  active === 7 || currentSection === "address" ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
                }`}
                onClick={() => handleSettingsItemClick("address")}
              >
                <TbAddressBook size={18} className={`${active === 7 || currentSection === "address" ? "text-yellow-500" : "text-gray-500"}`} />
                <span className={`ml-3 text-sm ${active === 7 || currentSection === "address" ? "text-yellow-500" : "text-gray-700"}`}>Address</span>
              </div>
              {/* <div
                className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
                  active === 9 || currentSection === "deactivate" ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
                }`}
                onClick={() => handleSettingsItemClick("deactivate")}
              >
                <FiUserX size={18} className={`${active === 9 || currentSection === "deactivate" ? "text-yellow-500" : "text-gray-500"}`} />
                <span className={`ml-3 text-sm ${active === 9 || currentSection === "deactivate" ? "text-yellow-500" : "text-gray-700"}`}>Deactivate Account</span>
              </div> */}
            </div>
          )}

          {/* Admin Dashboard */}
          {user && user?.role === "Admin" && (
            <Link to="/admin/dashboard">
              <div
                className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${
                  active === 8 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
                }`}
                onClick={() => {
                  setActive(8);
                  if (onMobileClose) onMobileClose();
                }}
              >
                <MdOutlineAdminPanelSettings size={20} className={`${active === 8 ? "text-yellow-500" : "text-gray-500"}`} />
                <span className={`ml-3 text-sm ${active === 8 ? "text-yellow-500" : "text-gray-700"}`}>Admin Dashboard</span>
              </div>
            </Link>
          )}

          {/* Logout */}
          <div
            className={`flex items-center px-4 sm:px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative cursor-pointer ${
              active === 10 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""
            }`}
            onClick={() => {
              setActive(10);
              logoutHandler();
              if (onMobileClose) onMobileClose();
            }}
          >
            <AiOutlineLogin size={20} className={`${active === 10 ? "text-yellow-500" : "text-gray-500"}`} />
            <span className={`ml-3 text-sm ${active === 10 ? "text-yellow-500" : "text-gray-700"}`}>Log out</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default ProfileSidebar;