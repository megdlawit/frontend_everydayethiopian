import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { server } from "../../server";
import api from "../../utils/api";
import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { loadDeliveryUser } from "../../redux/actions/delivery";
import peacockImg from "../../Assests/images/peacockl.png";
import Footer from "../Layout/Footer";

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${server}/delivery/login`,
        { email, password },
        { withCredentials: true }
      );
      console.log("Login response:", res.data);
      if (res.data?.token) {
        localStorage.setItem("authToken", res.data.token);
      }
      toast.success(res.data.message || "Login successful!");

      // Update Redux immediately from login response (avoid redirect loop)
      if (res.data?.delivery) {
        dispatch({ type: "LoadDeliveryUserSuccess", payload: res.data.delivery });
      } else {
        dispatch(loadDeliveryUser());
      }

      // Navigate to delivery dashboard (protected route handles pending approval)
      navigate("/delivery/dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Unable to connect to the server.";
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="relative min-h-screen w-full flex flex-col items-center font-[Avenir LT Std] text-sm overflow-hidden">
        <div className="absolute inset-0 z-0" />
        <div className="px-10 py-10 w-full max-w-xl border border-1 rounded-[50px] z-10 text-center relative mt-16 mb-10 bg-white/80 backdrop-blur-md shadow-lg">
          <h2 className="text-4xl mb-8 font-normal font-[Quesha]">Delivery Login</h2>
          <form className="flex flex-col items-center gap-5 w-full" onSubmit={handleSubmit}>
            <div className="w-4/5 max-w-sm text-left">
              <label htmlFor="email" className="block mb-1 text-gray-700">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3 text-[#FAC50C]" size={15} />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black"
                  placeholder="Email"
                  required
                />
              </div>
            </div>
            <div className="w-4/5 max-w-sm text-left">
              <label htmlFor="password" className="block mb-1 text-gray-700">Password</label>
              <div className="relative">
                <RiLockPasswordFill className="absolute left-4 top-3 text-[#FAC50C]" size={15} />
                <input
                  type={visible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-gray-300 pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 text-black"
                  placeholder="Password"
                  required
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                    size={15}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                    size={15}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between w-4/5 max-w-sm mb-4">
              <div className="text-sm">
                <a href="/delivery/password/forgot" className="font-medium text-[#0C2DD2]">
                  Forgot password?
                </a>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#FFC300] text-white px-6 py-2 rounded-full hover:bg-yellow-400 transition w-[180px] text-sm"
            >
              Login
            </button>
            <div className="flex items-center my-6 w-4/5 max-w-sm">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-4 text-gray-400 text-xs">or</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>
            <div className="text-center text-gray-500 text-xs">
              Don’t have an account?{" "}
              <Link to="/sign-up" className="text-blue-600 underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
        <img
          src={peacockImg}
          alt="Peacock"
          className="absolute bottom-20 right-0 w-72 object-contain z-0 translate-y-1/3"
        />
     
      </div>
    </div>
  );
};

export default DeliveryLogin;