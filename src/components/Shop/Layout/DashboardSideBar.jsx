import React, { useRef } from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag, FiMenu } from "react-icons/fi";
import { MdOutlineLocalOffer, MdCategory } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
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

  return (
    <div
      ref={sidebarRef}
      className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-sm overflow-y-auto transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <img src={Logo} alt="Logo" className="h-8" />
        <button className="md:hidden p-2 ml-2" onClick={onClose}>
          <FiMenu className="text-gray-700 text-2xl" />
        </button>
      </div>
      <nav className="mt-2 space-y-1">
        <Link
          to="/dashboard"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 1 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <RxDashboard size={20} className={`${active === 1 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 1 ? "text-yellow-500" : "text-gray-700"}`}>Dashboard</span>
        </Link>
        <Link
          to="/dashboard-orders"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 2 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <FiShoppingBag size={20} className={`${active === 2 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 2 ? "text-yellow-500" : "text-gray-700"}`}>All Orders</span>
        </Link>
        <Link
          to="/dashboard-products"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 3 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <FiPackage size={20} className={`${active === 3 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 3 ? "text-yellow-500" : "text-gray-700"}`}>All Products</span>
        </Link>
        <Link
          to="/dashboard-allvideo"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 4 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <AiOutlineGift size={20} className={`${active === 4 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 4 ? "text-yellow-500" : "text-gray-700"}`}>All Video Products</span>
          <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-600 rounded">PRO</span>
        </Link>
       
         <Link
          to="/dashboard-events"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 5 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <MdOutlineLocalOffer size={20} className={`${active === 5 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 5 ? "text-yellow-500" : "text-gray-700"}`}>All Events</span>
        </Link>
          <Link
          to="/dashboard-withdraw-money"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 6 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 6 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 6 ? "text-yellow-500" : "text-gray-700"}`}>Withdraw Money</span>
        </Link>
        <Link
          to="/dashboard-coupouns"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 8 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <AiOutlineGift size={20} className={`${active === 8 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 8 ? "text-yellow-500" : "text-gray-700"}`}>Discount Codes</span>
        </Link>
        <Link
          to="/dashboard-refunds"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 9 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <HiOutlineReceiptRefund size={20} className={`${active === 9 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 9 ? "text-yellow-500" : "text-gray-700"}`}>Refunds</span>
        </Link>
      </nav>
    </div>
  );
};

export default DashboardSideBar;