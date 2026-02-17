import React, { useState } from "react";
import Footer from "../components/Layout/Footer";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/Layout/Header2";
import pecSvg from "../Assests/Happy.png"; 

const OrderSuccessPage = () => {
  return (
    <div>
      <Header2 />
      <Success />
      <Footer />
    </div>
  );
};

const Success = () => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSvgClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      
      {/* Card Container */}
      <div className=" p-10 sm:p-14 text-center max-w-lg w-full relative overflow-hidden">
        
        {/* Success Image */}
        <img
          src={pecSvg}
          alt="Success"
          onClick={handleSvgClick}
          className={`mx-auto w-48 sm:w-60 mb-6 cursor-pointer transition-transform duration-300 ${
            isClicked ? "scale-110" : "hover:scale-105"
          }`}
        />

        {/* Heading */}
        <h1
          className="text-4xl sm:text-5xl mb-4"
          style={{ fontFamily: "Quesha" }}
        >
          <span className="text-[#061A1C]">Order </span>
          <span className="text-[#FFC300]">Successful!</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 mb-8 text-sm sm:text-base">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Button */}
        <button
          onClick={handleHomeClick}
          className="bg-[#FFC300] hover:bg-[#e6b000] text-white px-8 py-3 rounded-full text-sm font-normal shadow-lg transition-all duration-300 hover:scale-105"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;