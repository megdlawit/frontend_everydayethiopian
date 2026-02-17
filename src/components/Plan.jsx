import React, { useEffect, useState } from "react";
import feather from "../Assests/images/feather.svg";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadSeller } from "../redux/actions/sellers";
import { toast } from "react-toastify";
import Toast from "../components/Toast"; 

const Plan = () => {
  const navigate = useNavigate();
  const { isSeller, seller, isLoading } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    dispatch(loadSeller());
  }, [dispatch]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          >
            <span className="visually-hidden">⏳</span>
          </div>
          <p className="mt-2">Loading your account...</p>
        </div>
      </div>
    );
  }

  const handlePlanClick = (plan) => {
    if (isLoading) {
      showToast("error", "Loading Error", "Please wait while we load your account data...");
      return;
    }
    if (!isSeller) {
      showToast("info", "Login Required", "Please log in to your seller account to select a plan.");
      navigate("/shop-login");
      return;
    }
    navigate("/shop-create", { state: { plan, billingCycle } });
    showToast(
      "success",
      "Plan Selected",
      `Great choice! You've selected the ${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      } Plan.`
    );
  };

  const toggleBillingCycle = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  const plans = [
  {
    name: "Basic Plan",
    key: "basic",
    height: "min-h-[360px]",
    monthlyPrice: 500,
    yearlyPrice: 5000,
    features: [
      "Your own shop website & shareable link",
      "Marketplace listing & visibility",
      "Delivery & branded packaging integration",
      "Refund protection",
      "Seller dashboard & order tracking",
      "Community access",
    ],
    minHeight: "360px",
    scale: "scale-100",
    hoverScale: "hover:scale-105",
  },
  {
    name: "Growth Plan",
    key: "growth",
    height: "min-h-[430px]",
    monthlyPrice: 3500,
    yearlyPrice: 30000,
    features: [
      "Everything in Basic Plan",
      "Business website",
      "Video shop (TikTok-style product videos)",
      "Priority marketplace placement",
      "Customer support",
      "Access to One Hundred Birr Sunday events",
      "Verified Growth Seller badge",
    ],
    minHeight: "430px",
    scale: "scale-105",
    hoverScale: "hover:scale-110",
  },
  {
    name: "Premium Plan",
    key: "premium",
    height: "min-h-[500px]",
    monthlyPrice: 7000,
    yearlyPrice: 70000,
    features: [
      "Everything in Growth Plan",
      "Advanced brand website ",
      "product boosting",
      "Limited social media promotion",
      "Priority support",
      "Magazine feature (quarterly)",
      "Premium Brand badge",
    ],
    minHeight: "500px",
    scale: "scale-110",
    hoverScale: "hover:scale-115",
  },
  {
    name: "Enterprise Plan",
    key: "enterprise",
    height: "min-h-[580px]",
    monthlyPrice: 20000,
    yearlyPrice: 230000,
    features: [
      "Corporate website ",
      "Unlimited products & bids",
      "Offline showcase store placement",
      "Market research & trend reports",
      "Everyday Academy training",
      "Loan facilitation partnerships",
      "Dedicated account manager",
      "External social media promotion",
    ],
    minHeight: "580px",
    scale: "scale-115",
    hoverScale: "hover:scale-120",
  },
];

  return (
    <>
      <Header />
      <div
        className="bg-[#061A1C] min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ fontFamily: "'Avenir LT Std', sans-serif" }}
      >
        {/* Title */}
   <div className="text-center max-w-3xl mx-auto z-10 mt-[5rem] px-4">
  <h1
    className="text-4xl sm:text-5xl lg:text-[103px] mb-6 leading-tight"
    style={{ fontFamily: "'Quesha'" }}
  >
    <span className="text-white">Choose </span>
    <span className="text-yellow-400">Your Plan</span>
    <span className="text-white">, Grow </span>
    <span className="text-yellow-400">Your Way</span>
  </h1>

  {/* Try Free Plan Button */}
  <button
    onClick={() => handlePlanClick("basic")}
    className="mt-4 px-16 py-3 bg-[#FFC300] text-[#FFFFFF] font-regular rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mb-10"
  >
    Try Free Plan
  </button>
</div>


        {/* Billing Toggle */}
        <div className="flex justify-center mb-8 z-10">
          <div className="bg-[#FFEDB2] rounded-full p-1 flex items-center shadow-md">
            <button
              className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-[#FFC300] text-white shadow-inner"
                  : "text-[#1A1A1A]"
              }`}
              onClick={toggleBillingCycle}
            >
              Monthly
            </button>
            <button
              className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-[#FFC300] text-white shadow-inner"
                  : "text-[#1A1A1A]"
              }`}
              onClick={toggleBillingCycle}
            >
              Yearly <span className="hidden sm:inline text-xs">(Save ~16%)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10 mb-10">

          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`bg-[#FFEDB2] p-6 sm:p-8 rounded-3xl w-full sm:w-72 text-center shadow-md flex flex-col items-center relative border border-[#061A1C] cursor-pointer transition ${plan.height} `}
              style={{ minHeight: plan.minHeight }}
              onClick={() => handlePlanClick(plan.key)}
            >
           <div className="absolute top-0 right-0 bg-[#FFC300] text-white text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-tr-3xl rounded-bl-3xl shadow w-[5.5rem] sm:w-24 text-center"> br{billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}/ {billingCycle === "monthly" ? "mo" : "yr"} </div>
              <img
                src={feather}
                alt="Feather Icon"
                className="w-16 sm:w-20 h-16 sm:h-20 mb-4 mt-6 sm:mt-8"
              />
              <h2 className="text-xl sm:text-2xl text-[#1A1A1A] mb-4 sm:mb-6">
                {plan.name}
              </h2>

              <ul className="text-[#4A2C00] space-y-2 sm:space-y-3 text-xs sm:text-sm font-medium text-left w-full px-3 sm:px-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start sm:items-center">
                    <span className="text-[#FFC300] mr-2 sm:mr-3 text-lg sm:text-xl">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Plan;
