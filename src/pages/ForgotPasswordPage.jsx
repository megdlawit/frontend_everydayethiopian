import React, { useState } from "react";
import axios from "axios";
import { server } from "../server";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../components/Toast";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../Assests/images/logo.png";
import PeacImage from "../Assests/images/peac.png";
import PeacockImage from "../Assests/images/peacock.png";
import back1Img from "../Assests/images/back1.png";
import Footer from "../components/Layout/Footer";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${server}/user/password/forgot`, { email });
      showToast("success", "Reset Email Sent", response.data.message || "Password reset email sent!");
      setEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong. Please try again.";
      showToast("error", "Forgot Password Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative flex flex-col justify-center items-center min-h-screen pt-4 sm:pt-6 md:pt-8 pb-24 sm:pb-28 md:pb-32 font-[Avenir LT Std] text-xs sm:text-sm"
        style={{
          backgroundImage: `url(${back1Img})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Logo */}
        <img 
          src={Logo} 
          alt="Logo" 
          className="w-40 sm:w-48 md:w-56 mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-10 md:mb-12 z-10" 
        />

        {/* Peac Image */}
        <img 
          src={PeacImage} 
          alt="Top Decoration" 
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-4 sm:mb-5 md:mb-6 z-10" 
        />

        {/* Form Box */}
        <div className="px-6 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 w-full max-w-xs sm:max-w-md md:max-w-xl border border-1 rounded-2xl sm:rounded-3xl md:rounded-[50px] z-10 text-center bg-white shadow-lg mx-4 sm:mx-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 font-normal font-[Quesha] text-gray-800">
            Forgot Password
          </h2>

          <form className="flex flex-col items-center gap-3 sm:gap-4 md:gap-5 w-full" onSubmit={handleForgotPassword}>
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-sm text-left">
              <label className="block mb-1 ml-2 text-gray-700 text-xs sm:text-sm">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-[#FAC50C]" size={14} />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-gray-300 pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-black text-xs sm:text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#CC9A00] text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2 rounded-full transition hover:bg-yellow-400 w-32 sm:w-36 md:w-40 mx-auto text-xs sm:text-sm"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="flex items-center my-4 sm:my-5 md:my-6 w-full max-w-xs sm:max-w-sm md:max-w-sm">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-2 sm:mx-3 md:mx-4 text-gray-400 text-xs">or</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            <div className="text-center text-gray-500 text-xs">
              Back to{" "}
              <Link to="/login" className="text-blue-600 underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Peacock Image - Responsive positioning */}
        <img
          src={PeacockImage}
          alt="Peacock Decoration"
          className="absolute bottom-0 left-0 sm:left-2 md:left-5 w-40 sm:w-48 md:w-56 lg:w-64 z-10 transform translate-y-1/4 -translate-x-2 sm:-translate-x-3 md:-translate-x-6"
        />
      </div>
      <Footer />
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
        className="!mt-12 sm:!mt-16 md:!mt-20"
        style={{
          top: "20px",
          right: "10px",
        }}
      />
    </div>
  );
};

export default ForgotPasswordPage;