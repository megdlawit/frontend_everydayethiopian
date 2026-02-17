import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";
import Logo from "../../Assests/images/logo.png";
import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaStore } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa";
import Toast from "../Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShopCreate = ({ plan, template }) => {
  const location = useLocation();
  // const plan = location.state?.plan || "free";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState();
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  

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

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  // Always use the correct template value
  const selectedTemplate = template || "basic";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      showToast("error", "Validation Error", "Please select a plan/template before registering.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("address", address);
    formData.append("template", selectedTemplate); // <-- Always send a value!
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const res = await axios.post(`${server}/shop/create-shop`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "Registration Success", res.data.message || "Shop registered successfully! Please check your email to activate your account.");

      // Don't redirect to /plan immediately - user needs to activate via email first
      // The activation process will handle the redirect to /plan

      setName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      setAddress("");
      setPhoneNumber("");
    } catch (error) {
      showToast("error", "Registration Error", error.response?.data?.message || "Registration failed");
    }
  };
  const [selectedForm, setSelectedForm] = useState("seller"); // Initialize selectedForm state
  const navigate = useNavigate(); 

  const handleToggle = (formType) => {
    // Set the selected form type
    setSelectedForm(formType);
    
    // Navigate to the ShopCreate component
    navigate("/sign-up"); // Adjust the path as necessary
  };

  const getPlanType = (tplName) => {
    if (tplName?.toLowerCase().includes("growth")) return "growthplan";
    if (tplName?.toLowerCase().includes("pro")) return "proplan";
    return "basic";
  };

  console.log("Template sent to backend:", selectedTemplate);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white-100 relative overflow-hidden">
      {/* Spotlight gradient at top-left and top-right */}
      <div
        className="absolute top-0 left-0 w-full h-[300px] z-[-1] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, #FFE180 0%, transparent 60%),
            radial-gradient(circle at 100% 0%, #FFE180 0%, transparent 60%)
          `,
          filter: 'blur(30px)',
          opacity: 0.8,
        }}
      ></div>
      <img src={Logo} alt="Logo" className="mt-10 w-40" /> 
    {/* Toggle Buttons */}
    {/* <div className="flex space-x-8 mt-4">
      <div
        className={`cursor-pointer flex text-[1E1E1E] font-Lato text-[12px]  font-bold items-center justify-center w-16 h-16 rounded-full border-2 
          ${selectedForm === "shopper" ? "bg-yellow-500 text-white" : "bg-white text-gray-700 border-yellow-500"}`}
        onClick={() => handleToggle("shopper")}
      >
        Shopper
      </div>

      <div
        className={`cursor-pointer flex  text-[1E1E1E] font-Lato text-[12px]  items-center justify-center w-16 h-16 rounded-full border-2 
          ${selectedForm === "seller" ? "bg-yellow-500 text-white" : "bg-white text-gray-700 border-yellow-500"}`}
        onClick={() => handleToggle("seller")}
      >
        Seller
      </div>
    </div> */}
    <div className="bg-white rounded-[70px] shadow-lg p-10 w-[50%] border border-[#1E1E1E] mt-4"> {/* Added mt-4 for margin-top */}
        <h2 className="text-center text-[32px] font-medium text-[1E1E1E]-900 font-Lato">
          Register As Seller
        </h2>
     
  
          <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
          <input type="hidden" name="template" value={template} />
          <div className="relative">
            <FaStore className="absolute left-3 top-3 text-[#FAC50C]" size={15} />
            <input
              type="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-12 w-full ont-Lato text-[#1E1E1E] rounded-[20px] border-[1E1E1E]-300 shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border border-[1E1E1E]"
              placeholder="Shop Name"
              required
            />
          </div>
            

          <div className="relative">
            <FaPhoneAlt className="absolute left-3 top-3 text-[#FAC50C]" size={15} />
            <input
              type="number"
              name="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-12 w-full ont-Lato text-[#1E1E1E] rounded-[20px] border-[1E1E1E]-300 shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border border-[1E1E1E]"
              placeholder="Phone Number"
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-[#FAC50C]" size={15} />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 w-full ont-Lato text-[#1E1E1E] rounded-[20px] border-[1E1E1E]-300 shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border border-[1E1E1E]"
              placeholder="Email Address"
              required
            />
          </div>
          
          <div className="relative">
            <FaAddressCard className="absolute left-3 top-3 text-[#FAC50C]" size={15} />
            <input
              type="text"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-12 w-full ont-Lato text-[#1E1E1E] rounded-[20px] border-[1E1E1E]-300 shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border border-[1E1E1E]"
              placeholder="Address"
              required
            />
          </div>

          <div className="relative">
            <RiLockPasswordFill  className="absolute left-3 top-3  text-[#FAC50C]" size={15}  />
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 w-full font-Lato text-[#1E1E1E] rounded-[20px] border-[1E1E1E]-300 shadow-sm focus:ring-[#FAC50C] focus:border-[#FAC50C] sm:text-sm px-3 py-2 border border-[1E1E1E]"
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

          <div className="relative">
            <div className="flex items-center">
              <RxAvatar className="text-[#FAC50C]" size={40} />
              <label
                htmlFor="file-input"
                className="ml-5 border border-[#FAC50C] text-[#1E1E1E] px-4 py-2 rounded-[20px] shadow-sm text-sm font-medium cursor-pointer hover:bg-[#FAC50C]"
              >
                Upload Logo
                <input
                  id="file-input"
                  name="avatar"
                  type="file"
                  className="sr-only"
                  onChange={handleFileInputChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center">
          <button
              type="submit"
              className={`${styles.button} py-1 px-4`} // Adjusted padding to decrease height
            >
              Sign up
            </button>
          </div>
            <div className={`${styles.noramlFlex} w-full`}>
              <h4>Already have an account?</h4>
              <Link to="/shop-login" className="text-[#0C2DD2] font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
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

export default ShopCreate;