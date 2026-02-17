import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../redux/actions/user";
import { toast } from "react-toastify";
import Toast from "../components/Toast";
import { FaLock } from "react-icons/fa";
import Logo from "../Assests/images/logo.png";
import PeacImage from "../Assests/images/peac.png";
import PeacockImage from "../Assests/images/peacock.png";
import back1Img from "../Assests/images/back1.png"; 
import Footer from "../components/Layout/Footer";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      showToast("error", "Error", "Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await dispatch(resetPassword(token, password, confirmPassword));
      showToast("success", "Success", "Password reset successful!");
      navigate("/");
    } catch (error) {
      console.error("Error details:", error.response ? error.response.data : error.message);
      showToast("error", "Error", "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative flex flex-col justify-center items-center min-h-screen pt-8 pb-32"
        style={{
          backgroundImage: `url(${back1Img})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Top Outside - Logo */}
        <img src={Logo} alt="Logo" className="absolute top-10 mt-2 w-40 z-10" />

        {/* Center - Peac Image */}
        <img src={PeacImage} alt="Top Decoration" className="w-20 z-10 mt-20" />

        {/* Form Box */}
        <div className="bg-white rounded-[70px] shadow-lg p-10 w-[35%] border border-[#1E1E1E] mt-4 z-10">
          <h2 className="text-center text-[32px] font-medium text-[#1E1E1E] font-[Quesha]">
            Reset Password
          </h2>
          <form className="space-y-6 mt-4" onSubmit={submitHandler}>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm text-[#1E1E1E] font-medium mb-1 font-Lato"
              >
                New Password
              </label>
              <FaLock className="absolute left-3 top-10 text-[#FAC50C]" size={15} />
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 w-full font-Lato text-[#1E1E1E] rounded-[20px] border shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border-[#1E1E1E]"
                placeholder="New Password"
                required
              />
            </div>
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-[#1E1E1E] font-medium mb-1 font-Lato"
              >
                Confirm New Password
              </label>
              <FaLock className="absolute left-3 top-10 text-[#FAC50C]" size={15} />
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 w-full font-Lato text-[#1E1E1E] rounded-[20px] border shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border-[#1E1E1E]"
                placeholder="Confirm New Password"
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FFC300] text-white font-Lato rounded-[20px] py-2 px-6 hover:opacity-90 transition duration-200"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Right Peacock Image */}
        <img
          src={PeacockImage}
          alt="Peacock Decoration"
          className="absolute bottom-0 right-0 w-60 mb-4 mr-4 z-10"
        />

        {/* Footer Component */}
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;