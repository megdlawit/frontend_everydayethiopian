import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FiPackage, FiMenu } from "react-icons/fi";
import { AiOutlineSetting } from "react-icons/ai";
import Logo from "../../../Assests/images/logo.png";

const DashboardSideBar = ({ active, isOpen, onClose }) => {
  const sidebarRef = useRef(null);

  // Prevent scroll reset on link click
  const handleLinkClick = () => {
    if (sidebarRef.current) {
      const scrollPosition = sidebarRef.current.scrollTop;
      setTimeout(() => {
        sidebarRef.current.scrollTop = scrollPosition;
      }, 0);
    }
  };

  const handleClose = () => {
    console.log("Closing sidebar");
    if (onClose) onClose();
  };

  const links = [
    { name: "Dashboard", path: "/delivery/dashboard", icon: RxDashboard },
    { name: "Orders", path: "/delivery/orders", icon: FiPackage },
    { name: "Settings", path: "/delivery/settings", icon: AiOutlineSetting },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleClose}
        ></div>
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[80px] md:w-64 bg-white shadow-lg overflow-y-auto z-50 ${isOpen ? "block" : "hidden"} md:block md:static md:z-40`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <img src={Logo} alt="Logo" className="h-8" />
          <button className="md:hidden p-2" onClick={handleClose}>
            <FiMenu className="text-gray-700 text-2xl" />
          </button>
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              scroll={false}
              onClick={handleLinkClick}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === index + 1 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
            >
              <link.icon size={20} className={`${active === index + 1 ? "text-yellow-500" : "text-gray-500"}`} />
              <span className={`ml-3 text-sm ${active === index + 1 ? "text-yellow-500" : "text-gray-700"} hidden md:block`}>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default DashboardSideBar;