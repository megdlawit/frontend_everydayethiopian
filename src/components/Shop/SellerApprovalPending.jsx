import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";
import Logo from "../../Assests/images/logo.png";

const SellerApprovalPending = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6">
      {/* Logo */}
      <img src={Logo} alt="Logo" className="w-28 mb-6" />

      {/* Approval Message */}
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <FaRegClock className="text-yellow-500 text-6xl animate-pulse" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Approval Pending</h2>
        <p className="text-gray-600 mt-2">
          Your seller account is under review. We will notify you once the approval process is complete.
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-yellow-500 text-white text-lg font-medium rounded-full shadow-md hover:bg-yellow-600 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SellerApprovalPending;
