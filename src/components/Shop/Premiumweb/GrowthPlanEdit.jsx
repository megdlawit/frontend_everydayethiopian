import React, { useState } from 'react';
import api from '../../../../utils/api';
import { toast } from 'react-toastify';
import { FaCamera } from 'react-icons/fa';
import Toast from "../../Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GrowthPlanEdit = () => {
  const [shopData, setShopData] = useState({
    logo: '',
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

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await api.put(`${server}/shop/update-shop-avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShopData((prev) => ({
        ...prev,
        logo: `${backend_url}${response.data.seller.avatar.url}`,
      }));
      showToast("success", "Logo Success", 'Logo updated!');
    } catch (err) {
      showToast("error", "Logo Error", 'Failed to update logo');
    }
  };

  return (
    <div className="relative">
      <label className="relative cursor-pointer group">
        <img
          src={shopData.logo}
          alt="Shop Logo"
          className="w-12 h-12 rounded-full object-cover border-2 border-[#FAC50C] bg-white shadow"
        />
        <span className="absolute bottom-0 right-0 bg-[#FAC50C] p-1 rounded-full flex items-center justify-center">
          <FaCamera size={16} className="text-white" />
        </span>
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleLogoChange}
        />
      </label>
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
          top: "80px", 
        }}
      />
    </div>
  );
};

export default GrowthPlanEdit;