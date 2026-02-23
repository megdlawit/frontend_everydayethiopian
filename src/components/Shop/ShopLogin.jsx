import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import logoImg from "../../Assests/images/logo.png";
import peacockImg from "../../Assests/images/peacockl.png";
import Footer from "../Layout/Footer";
import { loadSeller } from "../../redux/actions/sellers";

const ShopLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [showReactivateOption, setShowReactivateOption] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${server}/shop/login-shop`,
        { email, password },
        { withCredentials: true }
      );
      showToast("success", "Login Successful", res.data.message || "Login Success!");

      // After successful login, load seller data to check status
      dispatch(loadSeller());

      // Navigate to dashboard (SellerProtectedRoute will handle redirects for pending sellers)
      navigate("/dashboard");
      window.location.reload(true);
    } catch (err) {
      const message = err.response?.data?.message || "An error occurred";
      if (message.includes("activation email") || message.includes("activation link")) {
        showToast("info", "Activation Required", message);
      } else if (message.includes("account is deactivated")) {
        showToast("error", "Account Deactivated", message);
        setShowReactivateOption(true);
      } else if (message.includes("pending admin approval")) {
        showToast("info", "Account Pending", message);
      } else {
        showToast("error", "Login Failed", message);
      }
    }
  };

  const handleReactivate = async () => {
    try {
      const res = await axios.put(
        `${server}/shop/reactivate-account`,
        {},
        { withCredentials: true }
      );
      showToast("success", "Reactivation Successful", res.data.message || "Account reactivated successfully!");
      setShowReactivateOption(false);
      // Try to login again
      handleSubmit({ preventDefault: () => {} });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reactivate account";
      showToast("error", "Reactivation Failed", message);
    }
  };

  return (
    <div className="w-full">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center relative min-h-screen">
        {/* Form Container - Made Responsive */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 w-full max-w-[90%] sm:max-w-md md:max-w-xl border border-1 rounded-3xl md:rounded-[50px] z-10 text-center mt-4 sm:mt-6 mb-6 sm:mb-10 bg-white shadow-lg mx-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 font-normal font-[Quesha]">
            Seller Login
          </h2>
          <form
            className="flex flex-col items-center gap-4 sm:gap-5 w-full"
            onSubmit={handleSubmit}
          >
            {/* Email Field - Made Responsive */}
            <div className="relative w-full sm:w-4/5 max-w-sm text-left">
              <label className="block mb-1 ml-2 text-gray-700 text-xs sm:text-sm">
                Email
              </label>
              <div className="relative">
                <FaEnvelope
                  className="absolute left-3 sm:left-4 top-3 text-[#FAC50C]"
                  size={14}
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-gray-300 pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field - Made Responsive */}
            <div className="relative w-full sm:w-4/5 max-w-sm text-left">
              <label className="block mb-1 ml-2 text-gray-700 text-xs sm:text-sm">
                Password
              </label>
              <div className="relative">
                <RiLockPasswordFill
                  className="absolute left-3 sm:left-4 top-3 text-[#FAC50C]"
                  size={14}
                />
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-gray-300 pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2.5 sm:right-3 top-3 cursor-pointer text-gray-400"
                    size={14}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2.5 sm:right-3 top-3 cursor-pointer text-gray-400"
                    size={14}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>

            {/* Options - Made Responsive */}
            <div className="flex justify-center sm:justify-between w-full sm:w-4/5 max-w-sm mb-4 sm:mb-6 text-xs sm:text-sm text-gray-700">
              <div className="text-center sm:text-left">
                <a
                  href="/forgot-password"
                  className="text-[#0C2DD2] font-medium"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit Button - Made Responsive */}
            <button
              type="submit"
              className="bg-[#FFC300] text-white px-6 py-2 rounded-full transition hover:bg-yellow-400 w-40 mx-auto text-sm sm:text-base"
            >
              Sign In
            </button>

            {/* Reactivate Account Option - Made Responsive */}
            {showReactivateOption && (
              <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full sm:w-4/5 max-w-sm">
                <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                  Your account is deactivated. Would you like to reactivate it?
                </p>
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition hover:bg-green-600 text-xs sm:text-sm"
                >
                  Reactivate Account
                </button>
              </div>
            )}

            {/* Divider - Made Responsive */}
            <div className="flex items-center my-4 sm:my-6 w-full sm:w-4/5 max-w-sm">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-3 sm:mx-4 text-gray-400 text-xs">or</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Sign Up Link - Made Responsive */}
            <div className="text-center text-gray-500 text-xs sm:text-sm">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-blue-600 underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>

        {/* Peacock Image - Made Responsive */}
        <img
          src={peacockImg}
          alt="Peacock"
          className="absolute hidden md:block bottom-20 right-0 w-48 lg:w-60 xl:w-72 object-contain z-0 translate-y-1/3"
        />
        
        {/* Mobile Peacock Image */}
        <img
          src={peacockImg}
          alt="Peacock"
          className="absolute md:hidden bottom-10 right-0 w-40 object-contain z-0 opacity-70"
        />
      </main>
    </div>
  );
};

export default ShopLogin;