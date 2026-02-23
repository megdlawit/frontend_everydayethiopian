import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { loadSeller } from "../../redux/actions/sellers";
import Toast from "../Toast"; 

import helloImg from "../../Assests/images/hello.png";
import peacockImg from "../../Assests/images/peacockl.png";
import phoImg from "../../Assests/images/pho.png";
import passImg from "../../Assests/images/pass.png";
import peacLogo from "../../Assests/images/peac.png";
import logoImg from "../../Assests/images/logo.png";
import back1Img from "../../Assests/images/back1.png";

import { FaEnvelope, FaPhoneAlt, FaRegHeart } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiArrowLeft } from "react-icons/fi";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [signupMethod, setSignupMethod] = useState(null);
  const [role, setRole] = useState("shopper");
  const [shopName, setShopName] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopPassword, setShopPassword] = useState("");
  const [shopVisible, setShopVisible] = useState(false);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPassword, setDeliveryPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success, message } = useSelector((state) => state.user);

  const showToast = (type, title, toastMessage) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={toastMessage}
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

  const checkPasswordStrength = (pwd) => {
    const criteria = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPasswordCriteria(criteria);

    const met = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength(met >= 5 ? 2 : met >= 3 ? 1 : 0);
  };

  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
      dispatch({ type: "clearErrors" });
    }
    if (success || message) {
      showToast("success", "Success", "Signup successful!");
      dispatch({ type: "clearSuccess" });
      dispatch({ type: "clearMessages" });
    }
  }, [error, success, message, dispatch]);

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (role === "seller") {
        if (shopName.trim()) setStep(2);
      } else if (role === "delivery") {
        if (deliveryName.trim()) setStep(2);
      } else {
        if (name.trim() || (signupMethod === "phone" && phone.trim())) setStep(2);
      }
    } else if (step === 2) {
      if (role === "seller") {
        if (shopEmail.trim()) setStep(3);
      } else if (role === "delivery") {
        if (deliveryEmail.trim()) setStep(3);
      } else if (signupMethod === "phone") {
        try {
          await axios.post(`${server}/user/signup-phone`, { phoneNumber: phone });
          showToast("success", "Success", "OTP sent to your phone!");
          setStep(3);
        } catch (error) {
          showToast("error", "Error", error.response?.data?.message || "Failed to send OTP");
        }
      } else {
        if (phone.trim()) setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "shopper" && signupMethod === "email") {
      if (passwordStrength < 2) {
        showToast("error", "Error", "Please create a strong password: at least 8 characters, including uppercase, lowercase, number, and special character.");
        return;
      }
      if (password !== confirmPassword) {
        showToast("error", "Error", "Passwords do not match");
        return;
      }
    }

    if (role === "seller") {
      if (shopPassword !== confirmPassword) {
        showToast("error", "Error", "Passwords do not match");
        return;
      }
      if (!isStrongPassword(shopPassword)) {
        showToast("error", "Error", "Please create a strong password: at least 8 characters, including uppercase, lowercase, number, and special character.");
        return;
      }
    }

    if (role === "delivery") {
      if (deliveryPassword !== confirmPassword) {
        showToast("error", "Error", "Passwords do not match");
        return;
      }
      if (!isStrongPassword(deliveryPassword)) {
        showToast("error", "Error", "Please create a strong password: at least 8 characters, including uppercase, lowercase, number, and special character.");
        return;
      }
    }

    if (role === "delivery") {
      try {
        const response = await axios.post(`${server}/delivery/signup`, {
          fullName: deliveryName,
          email: deliveryEmail,
          password: deliveryPassword,
          phoneNumber: phone,
        }, { withCredentials: true });
        showToast("success", "Success", response.data.message || "Delivery registration successful! Please check your email to activate your account.");
        setDeliveryName("");
        setDeliveryEmail("");
        setDeliveryPassword("");
        setPhone("");
      } catch (error) {
        showToast("error", "Error", error.response?.data?.message || "Delivery registration failed");
      }
      return;
    }
    if (role === "seller") {
      try {
        const response = await axios.post(
          `${server}/shop/create-shop`,
          {
            name: shopName,
            email: shopEmail,
            password: shopPassword,
          },
          { withCredentials: true }
        );
        showToast("success", "Success", response.data.message || "Shop registered successfully! Please check your email to activate your account.");
      } catch (error) {
        showToast("error", "Error", error.response?.data?.message || "Shop registration failed");
      }
      return;
    }
    if (signupMethod === "phone") {
      try {
        await axios.post(`${server}/user/verify-otp`, { phoneNumber: phone, otp });
        showToast("success", "Success", "Phone signup successful!");
        navigate("/");
        setPhone("");
        setOtp("");
      } catch (error) {
        showToast("error", "Error", error.response?.data?.message || "Invalid OTP");
      }
      return;
    }
    try {
      const response = await axios.post(`${server}/user/create-user`, {
        name,
        email: phone,
        password,
      });
      showToast("success", "Success", response.data.message);
      setName("");
      setPhone("");
      setPassword("");
    } catch (error) {
      showToast("error", "Error", error.response?.data?.message || "Signup failed");
    }
  };

  const isStrongPassword = (pwd) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return pwd.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  };

  const StepCircle = ({ label, active, isCurrent }) => (
    <div className="flex flex-col items-center relative">
      {isCurrent && (
        <img src={peacLogo} alt="Peac Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute -top-10 sm:-top-12 md:-top-14" />
      )}
      <div
        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full border text-xs sm:text-sm md:text-base font-normal
          ${active ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
      >
        {label}
      </div>
    </div>
  );

  const roleSteps = [
    { label: "Shopper", value: "shopper" },
    { label: "Seller", value: "seller" },
    // { label: "Delivery", value: "delivery" },
  ];

  const displayName = role === "seller" ? shopName : role === "delivery" ? deliveryName : name;
  const firstName = displayName.trim().split(" ")[0] || "You";

  if (!signupMethod) {
    return (
      <>
        <div
          className="relative min-h-screen w-full flex flex-col items-center font-[Avenir LT Std] text-xs sm:text-sm overflow-hidden"
          style={{
            backgroundImage: `url(${back1Img})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <img src={logoImg} alt="Logo" className="w-40 sm:w-48 md:w-56 mt-8 sm:mt-12 md:mt-16 mb-6 sm:mb-8 md:mb-12 z-10" />

          {/* Mobile: Role selection with full text in circles */}
          <div className="block lg:hidden w-full px-4 sm:px-6 mb-6 sm:mb-8 relative z-10">
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-lg sm:text-xl font-[Quesha] text-gray-800 mb-4">Select Your Role</h2>
              <div className="flex justify-center items-center space-x-4 sm:space-x-6 w-full">
                {roleSteps.map((stepItem, index) => (
                  <div key={stepItem.value} className="flex flex-col items-center">
                    <div className="relative">
                      {role === stepItem.value && (
                        <img 
                          src={peacLogo} 
                          alt="Peac Logo" 
                          className="w-6 h-6 sm:w-8 sm:h-8 absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2" 
                        />
                      )}
                      <div
                        className={`w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border font-normal cursor-pointer transition-all duration-300 px-1
                          ${role === stepItem.value 
                            ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00] shadow-lg scale-105" 
                            : "bg-white text-black border-[#fef4ca] hover:bg-[#FFF5CC]"
                          }`}
                        onClick={() => setRole(stepItem.value)}
                      >
                        <span className="text-sm sm:text-base font-medium text-center leading-tight">
                          {stepItem.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Role selection with full text in circles */}
          <div className="hidden lg:flex items-center justify-center mb-4 sm:mb-5 md:mb-6 relative z-10 px-4">
            {roleSteps.map((stepItem, index) => (
              <React.Fragment key={stepItem.value}>
                <div
                  className="flex flex-col items-center cursor-pointer relative"
                  onClick={() => setRole(stepItem.value)}
                >
                  {role === stepItem.value && (
                    <img src={peacLogo} alt="Peac Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 absolute -top-8 sm:-top-10 md:-top-14" />
                  )}
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full border text-sm sm:text-base md:text-lg font-normal px-2
                      ${role === stepItem.value ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
                  >
                    {stepItem.label}
                  </div>
                </div>
                {index < roleSteps.length - 1 && (
                  <div className="h-1 w-8 sm:w-12 md:w-20 mx-1 sm:mx-2 bg-[#CC9A00]" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Container */}
          <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 w-full max-w-xs sm:max-w-md md:max-w-xl border border-1 rounded-3xl sm:rounded-[50px] z-10 text-center relative mt-2 sm:mt-4 md:mt-6 mb-6 sm:mb-8 md:mb-10 mx-4 sm:mx-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 font-normal font-[Quesha]">Create Account</h2>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full">
              {["email", "phone", "google"].map((_method) => {
                const isActive = signupMethod === _method;
                const icons = {
                  email: <FaEnvelope className="text-[#FAC50C]" />,
                  phone: <FaPhoneAlt className="text-[#FAC50C]" />,
                  google: <FcGoogle className="text-lg sm:text-xl" />,
                };
                const labels = {
                  email: "Sign up with email",
                  phone: "Sign up with phone number",
                  google: "Sign up with Google",
                };

                return (
                  <button
                    key={_method}
                    className={`flex items-center justify-center gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-normal border transition
                      ${isActive ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "border-gray-300 text-black hover:bg-[#FFF5CC]"}`}
                    onClick={() => setSignupMethod(_method)}
                  >
                    {icons[_method]} {labels[_method]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center my-4 sm:my-5 md:my-6">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-2 sm:mx-4 text-gray-400 text-xs">or</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            <div className="text-center text-gray-500 text-xs">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 underline">
                Sign in
              </a>
            </div>
          </div>

          <img
            src={peacockImg}
            alt="Peacock"
            className="absolute bottom-0 left-0 sm:left-5 w-40 sm:w-48 md:w-64 z-10 transform translate-y-1/4 -translate-x-2 sm:-translate-x-4 md:-translate-x-6"
          />
        </div>
      </>
    );
  }

  const currentPassword = role === "seller" ? shopPassword : role === "delivery" ? deliveryPassword : password;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col lg:flex-row font-[Avenir LT Std] text-xs sm:text-sm overflow-hidden"
      style={{
        backgroundImage: `url(${back1Img})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center lg:items-start px-4 sm:px-8 md:px-12 lg:px-20 py-8 sm:py-10 lg:py-12 relative z-10">
        <div className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8">
          <img src={logoImg} alt="Logo" className="w-20 sm:w-24 md:w-32" />
        </div>

        {/* Mobile Progress Steps - Larger circles with clearer text */}
        <div className="block lg:hidden w-full mb-6 sm:mb-8 mt-16 sm:mt-20">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center justify-between w-full max-w-sm px-4">
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  {step === 1 && (
                    <img src={peacLogo} alt="Peac Logo" className="w-6 h-6 absolute -top-4 left-1/2 transform -translate-x-1/2" />
                  )}
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-full border font-normal
                      ${step >= 1 ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
                  >
                    {step >= 1 ? "✓" : "1"}
                  </div>
                </div>
                <span className={`text-xs font-medium ${step >= 1 ? "text-[#CC9A00]" : "text-gray-500"}`}>
                  Name
                </span>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-[#CC9A00]" />
              
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  {step === 2 && (
                    <img src={peacLogo} alt="Peac Logo" className="w-6 h-6 absolute -top-4 left-1/2 transform -translate-x-1/2" />
                  )}
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-full border font-normal
                      ${step >= 2 ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
                  >
                    {step >= 2 ? "✓" : "2"}
                  </div>
                </div>
                <span className={`text-xs font-medium ${step >= 2 ? "text-[#CC9A00]" : "text-gray-500"}`}>
                  {signupMethod === "phone" ? "Phone" : "Email"}
                </span>
              </div>
              
              <div className="flex-1 h-1 mx-2 bg-[#FFF5CC]" />
              
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  {step === 3 && (
                    <img src={peacLogo} alt="Peac Logo" className="w-6 h-6 absolute -top-4 left-1/2 transform -translate-x-1/2" />
                  )}
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-full border font-normal
                      ${step >= 3 ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
                  >
                    {step >= 3 ? "✓" : "3"}
                  </div>
                </div>
                <span className={`text-xs font-medium ${step >= 3 ? "text-[#CC9A00]" : "text-gray-500"}`}>
                  Password
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Progress Steps */}
        <div className="hidden lg:flex items-center mb-6 sm:mb-8 lg:mb-12 mt-16 sm:mt-20 lg:mt-28 lg:ml-2">
          <StepCircle label="Name" active={step >= 1} isCurrent={step === 1} />
          <div className={`h-1 w-8 sm:w-12 lg:w-16 xl:w-24 ${step >= 2 ? "bg-[#CC9A00]" : "bg-[#FFF5CC]"}`} />
          <StepCircle label={signupMethod === "phone" ? "Phone" : "Email"} active={step >= 2} isCurrent={step === 2} />
          <div className={`h-1 w-8 sm:w-12 lg:w-16 xl:w-24 ${step >= 3 ? "bg-[#CC9A00]" : "bg-[#FFF5CC]"}`} />
          <StepCircle label="Password" active={step >= 3} isCurrent={step === 3} />
        </div>

        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md text-left">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-6 text-gray-800 font-[Quesha] font-normal">
                  {role === "seller"
                    ? "What's Your Shop Name?"
                    : role === "delivery"
                    ? "What's Your Name?"
                    : "What's Your Name?"}
                </h2>
                <input
                  type="text"
                  value={role === "seller" ? shopName : role === "delivery" ? deliveryName : name}
                  onChange={(e) =>
                    role === "seller"
                      ? setShopName(e.target.value)
                      : role === "delivery"
                      ? setDeliveryName(e.target.value)
                      : setName(e.target.value)
                  }
                  placeholder={
                    role === "seller"
                      ? "Shop Name"
                      : role === "delivery"
                      ? "Full Name"
                      : "Full Name"
                  }
                  required
                  className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-4 sm:mb-5 lg:mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                />
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#CC9A00] text-white px-6 sm:px-7 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-full hover:bg-[#CC9A00] transition disabled:opacity-50 text-xs sm:text-sm"
                    disabled={
                      role === "seller"
                        ? !shopName.trim()
                        : role === "delivery"
                        ? !deliveryName.trim()
                        : !name.trim()
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-6 text-gray-800 font-[Quesha] font-normal">
                  {role === "seller" || role === "delivery" ? "What's Your Email?" : signupMethod === "phone" ? "Enter Your Phone Number" : "What's Your Email?"}
                </h2>
                {signupMethod === "phone" ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (e.g., +254712345678)"
                    required
                    className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-4 sm:mb-5 lg:mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                  />
                ) : (
                  <input
                    type={role === "seller" || role === "delivery" || signupMethod === "email" ? "email" : "text"}
                    value={role === "seller" ? shopEmail : role === "delivery" ? deliveryEmail : phone}
                    onChange={(e) =>
                      role === "seller"
                        ? setShopEmail(e.target.value)
                        : role === "delivery"
                        ? setDeliveryEmail(e.target.value)
                        : setPhone(e.target.value)
                    }
                    placeholder={
                      role === "seller" || role === "delivery" || signupMethod === "email"
                        ? "Email"
                        : "Phone Number"
                    }
                    required
                    className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-4 sm:mb-5 lg:mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                  />
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[#CC9A00] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition"
                  >
                    <FiArrowLeft className="text-sm sm:text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#CC9A00] text-white px-6 sm:px-7 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-full hover:bg-[#FFD700] transition disabled:opacity-50 text-xs sm:text-sm"
                    disabled={role === "seller" ? !shopEmail : role === "delivery" ? !deliveryEmail : !phone}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {signupMethod === "phone" ? (
                  <>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-6 text-gray-800 font-[Quesha] font-normal">
                      Enter OTP
                    </h2>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                      className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-4 sm:mb-5 lg:mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 lg:mb-6 text-gray-800 font-[Quesha] font-normal">
                      Create a Password
                    </h2>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        const pwd = e.target.value;
                        if (role === "seller") {
                          setShopPassword(pwd);
                        } else if (role === "delivery") {
                          setDeliveryPassword(pwd);
                        } else {
                          setPassword(pwd);
                        }
                        checkPasswordStrength(pwd);
                      }}
                      placeholder="Password"
                      required
                      className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-3 sm:mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                    />
                    {currentPassword.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1 sm:mb-2">
                          <span>Password Strength:</span>
                          <span className={passwordStrength === 2 ? "text-green-600" : passwordStrength === 1 ? "text-yellow-600" : "text-red-600"}>
                            {passwordStrength === 2 ? "Strong" : passwordStrength === 1 ? "Fair" : "Weak"}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 sm:h-2 flex-1 rounded ${
                                passwordStrength >= i
                                  ? "bg-green-500"
                                  : passwordStrength >= i - 1
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            />
                          ))}
                        </div>
                        <ul className="text-xs text-gray-600 mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                          <li className={`flex items-center ${passwordCriteria.length ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${passwordCriteria.length ? "bg-green-500" : "bg-red-500"}`}></span>
                            At least 8 characters
                          </li>
                          <li className={`flex items-center ${passwordCriteria.uppercase ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${passwordCriteria.uppercase ? "bg-green-500" : "bg-red-500"}`}></span>
                            Uppercase letter (A-Z)
                          </li>
                          <li className={`flex items-center ${passwordCriteria.lowercase ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${passwordCriteria.lowercase ? "bg-green-500" : "bg-red-500"}`}></span>
                            Lowercase letter (a-z)
                          </li>
                          <li className={`flex items-center ${passwordCriteria.number ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${passwordCriteria.number ? "bg-green-500" : "bg-red-500"}`}></span>
                            Number (0-9)
                          </li>
                          <li className={`flex items-center ${passwordCriteria.special ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${passwordCriteria.special ? "bg-green-500" : "bg-red-500"}`}></span>
                            Special character (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    )}
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter Password"
                      required
                      className="w-full rounded-full border border-gray-300 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 mb-4 sm:mb-5 lg:mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-left text-xs sm:text-sm"
                    />
                  </>
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[#CC9A00] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition"
                  >
                    <FiArrowLeft className="text-sm sm:text-base" />
                  </button>
                  <button
                    type="submit"
                    className="bg-[#CC9A00] text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full hover:bg-[#CC9A00] transition disabled:opacity-50 text-xs sm:text-sm"
                    disabled={
                      signupMethod === "phone"
                        ? !otp
                        : role === "seller"
                        ? !shopPassword || !confirmPassword || passwordStrength < 2
                        : role === "delivery"
                        ? !deliveryPassword || !confirmPassword || passwordStrength < 2
                        : !password || !confirmPassword || passwordStrength < 2
                    }
                  >
                    {role === "seller" ? "Register Shop" : signupMethod === "phone" ? "Verify OTP" : "Sign Up"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Right side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0B1B1B] flex-col items-center justify-between px-6 py-1 relative z-10">
        <div className="relative w-[200px] h-[170px] xl:w-[250px] xl:h-[210px] mt-2">
          <img
            src={step === 1 ? helloImg : step === 2 ? phoImg : passImg}
            alt="Step Graphic"
            className="w-full h-full absolute top-0 left-0 z-10 object-contain"
          />

          {step === 1 && (
            <div
              className="absolute top-1/2 left-1/2 z-20 text-gray-800 mt-6 flex items-center justify-center"
              style={{
                transform: "translate(-50%, -50%)",
                fontFamily: "'La Belle Aurore', cursive",
                fontSize: "1.4rem",
                whiteSpace: "nowrap",
              }}
            >
              <span className="relative">
                {firstName}
                <FaRegHeart
                  className="absolute -top-2 -right-2 text-yellow-400 text-base transform rotate-[-25deg]"
                />
              </span>
            </div>
          )}
        </div>

        <img
          src={peacockImg}
          alt="Peacock"
          className="w-64 xl:w-80 absolute bottom-0 left-1/2 transform -translate-x-1/2 z-0"
        />
      </div>

      {/* Mobile illustration (shown only on mobile) */}
      <div className="lg:hidden w-full bg-[#0B1B1B] flex flex-col items-center justify-center px-4 py-6 relative z-10 mt-4">
        <div className="relative w-[120px] h-[100px] sm:w-[150px] sm:h-[125px]">
          <img
            src={step === 1 ? helloImg : step === 2 ? phoImg : passImg}
            alt="Step Graphic"
            className="w-full h-full absolute top-0 left-0 z-10 object-contain"
          />

          {step === 1 && (
            <div
              className="absolute top-1/2 left-1/2 z-20 text-gray-800 mt-4 flex items-center justify-center"
              style={{
                transform: "translate(-50%, -50%)",
                fontFamily: "'La Belle Aurore', cursive",
                fontSize: "1rem",
                whiteSpace: "nowrap",
              }}
            >
              <span className="relative">
                {firstName}
                <FaRegHeart
                  className="absolute -top-1.5 -right-1.5 text-yellow-400 text-xs transform rotate-[-25deg]"
                />
              </span>
            </div>
          )}
        </div>

        <img
          src={peacockImg}
          alt="Peacock"
          className="w-40 sm:w-48 mt-4"
        />
      </div>
    </div>
  );
};

export default Signup;