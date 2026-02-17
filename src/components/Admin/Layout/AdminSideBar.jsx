import React, { useRef } from "react";
import { FiShoppingBag } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { BiMessageSquareDetail } from "react-icons/bi" 
import { Link } from "react-router-dom";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsHandbag } from "react-icons/bs";
import { MdOutlineLocalOffer, MdOutlineLocalShipping } from "react-icons/md";
import { AiOutlineSetting } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import Logo from "../../../Assests/images/logo.png";

const AdminSideBar = ({ active, isOpen, onClose }) => {
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
      className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-lg overflow-y-auto transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <img src={Logo} alt="Logo" className="h-8" />
        <button className="md:hidden p-2 ml-2" onClick={onClose}>
          <FiMenu className="text-gray-700 text-2xl" />
        </button>
      </div>
      <nav className="mt-2 space-y-1">
        <Link
          to="/admin/dashboard"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 1 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <RxDashboard size={20} className={`${active === 1 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 1 ? "text-yellow-500" : "text-gray-700"}`}>Dashboard</span>
        </Link>
        <Link
          to="/admin-orders"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 2 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <FiShoppingBag size={20} className={`${active === 2 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 2 ? "text-yellow-500" : "text-gray-700"}`}>All Orders</span>
        </Link>
        <Link
          to="/dashboard-categories"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 3 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 3 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 3 ? "text-yellow-500" : "text-gray-700"}`}>All Categories</span>
        </Link>
        <Link
          to="/admin-sellers"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 4 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <GrWorkshop size={20} className={`${active === 4 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 4 ? "text-yellow-500" : "text-gray-700"}`}>All Sellers</span>
        </Link>
        <Link
          to="/admin-users"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 5 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <HiOutlineUserGroup size={20} className={`${active === 5 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 5 ? "text-yellow-500" : "text-gray-700"}`}>All Users</span>
        </Link>
        <Link
          to="/admin-products"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 6 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <BsHandbag size={20} className={`${active === 6 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 6 ? "text-yellow-500" : "text-gray-700"}`}>All Products</span>
        </Link>
        <Link
          to="/admin-events"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 7 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <MdOutlineLocalOffer size={20} className={`${active === 7 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 7 ? "text-yellow-500" : "text-gray-700"}`}>All Events</span>
        </Link>
        <Link
          to="/admin/pending-shops"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 8 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <MdOutlineLocalOffer size={20} className={`${active === 8 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 8 ? "text-yellow-500" : "text-gray-700"}`}>All Shop Approval</span>
        </Link>
        <Link
          to="/admin/unapproved-deliveries"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 9 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <MdOutlineLocalShipping size={20} className={`${active === 9 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 9 ? "text-yellow-500" : "text-gray-700"}`}>Unapproved Deliveries</span>
        </Link>
        <Link
          to="/admin-withdraw-request"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 10 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 10 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 10 ? "text-yellow-500" : "text-gray-700"}`}>Withdraw Request</span>
        </Link>
      <Link
          to="/admin/admin-all-video-products"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 11 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 11 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 11 ? "text-yellow-500" : "text-gray-700"}`}>All Video Products</span>
        </Link>
         <Link
          to="/admin/admin-refund-orders"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 12 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 12 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 12 ? "text-yellow-500" : "text-gray-700"}`}>All Refund</span>
        </Link>
        <Link
      to="/inbox"
      scroll={false}
      onClick={handleLinkClick}
      className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 13 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
>
  <BiMessageSquareDetail size={20} className={`${active === 13 ? "text-yellow-500" : "text-gray-500"}`} />
  <span className={`ml-3 text-sm ${active === 13 ? "text-yellow-500" : "text-gray-700"}`}>Shop Inbox</span>
</Link>
        {/* <Link
          to="/admin/AdminDashboardAdvertizment"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 7 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <CiMoneyBill size={20} className={`${active === 7 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 7 ? "text-yellow-500" : "text-gray-700"}`}>Admin Advertizment</span>
        </Link>
        <Link
          to="/profile"
          scroll={false}
          onClick={handleLinkClick}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition relative ${active === 8 ? "bg-yellow-50 border-l-4 border-yellow-500 font-semibold" : ""}`}
        >
          <AiOutlineSetting size={20} className={`${active === 8 ? "text-yellow-500" : "text-gray-500"}`} />
          <span className={`ml-3 text-sm ${active === 8 ? "text-yellow-500" : "text-gray-700"}`}>Settings</span>
        </Link> */}
      </nav>
    </div>
  );
};

export default AdminSideBar;