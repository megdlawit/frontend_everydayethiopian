import React from "react";
import peacockLogo from "../../../Assests/images/peac.png"; // Update the path as needed
import necklaceImage from "../../../Assests/images/Rectangle123.png"; // Update the path as needed

const ShopAdd = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center bg-white p-10 text-center">
        <img
          src={peacockLogo}
          alt="Peacock Logo"
          className="w-24 h-24 mb-6"
        />
        <h2
          className="text-2xl font-semibold text-black-700"
          style={{ fontFamily: "'Avenir LT Std'" }}
        >
          Introducing
        </h2>
        <h1
          className="text-4xl text-black-400 mt-2"
          style={{ fontFamily: "'Avenir LT Std'" }}
        >
          Axum Beaded Necklace
        </h1>
        <p
          className="text-xl font-semibold text-black-800 mt-2"
          style={{ fontFamily: "'Avenir LT Std'" }}
        >
          By Ak Designs
        </p>
        <button
          className="mt-6 bg-yellow-400 text-white font-medium text-lg py-2 px-6 rounded-full hover:bg-yellow-500 transition"
          style={{ fontFamily: "'Avenir LT Std', Helvetica, Arial, sans-serif" }}
        >
          View Shop
        </button>
      </div>

      {/* Right Section */}
      <div className="justify-center items-center relative">
        <div className="relative z-10">
          <img
            src={necklaceImage}
            alt="Axum Beaded Necklace Display"
            className="w-[50rem] h-[40rem] rounded-md shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ShopAdd;