import React from "react";
import {
  AiOutlineFacebook,
  AiOutlineInstagram,
  AiOutlineYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";
import Logo from "../../Assests/images/edaylogo 1.png";
import pattern from "../../Assests/images/pattern2.svg";

const Footer = () => {
  return (
    <div className="bg-[#030F10] text-white font-['Avenir LT Std']">
      {/* Top Section - Logo and Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between sm:px-8 px-5 py-8 md:py-16 mx-auto max-w-7xl gap-6 md:gap-0">
        <div className="flex items-center">
          <img src={Logo} alt="Everyday Ethiopian Logo" className="w-28 md:w-32 h-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-16 font-light text-sm">
          <h1 className="hover:text-[#FAC50C] duration-300 cursor-pointer">Home</h1>
          <h1 className="hover:text-[#FAC50C] duration-300 cursor-pointer">About us</h1>
          <h1 className="hover:text-[#FAC50C] duration-300 cursor-pointer">Plans</h1>
          <h1 className="hover:text-[#FAC50C] duration-300 cursor-pointer">Faq</h1>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-600 my-6 md:my-8 w-[90%] mx-auto" />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center px-5 sm:px-8 text-gray-300 text-xs sm:text-sm pb-6 md:pb-8 mx-auto max-w-7xl">
        {/* Copyright */}
        <div className="order-2 md:order-1">
          Copyright © 2024 Perspective. All rights reserved
        </div>
        
        {/* Policies */}
        <div className="order-1 md:order-2 flex flex-wrap justify-center gap-2 md:gap-4">
          <Link to="/privacy" className="hover:text-[#FAC50C] duration-300 cursor-pointer">Privacy Policy</Link>
          <span className="hidden md:inline">·</span>
          <Link to="/terms" className="hover:text-[#FAC50C] duration-300 cursor-pointer">Terms & Conditions</Link>
        </div>
        
        {/* Social Media */}
        <div className="order-3 flex justify-center md:justify-end items-center gap-3 md:gap-4">
          <AiOutlineFacebook 
            size={20} 
            className="cursor-pointer hover:text-[#FAC50C] duration-300" 
          />
          <AiOutlineInstagram
            size={20}
            className="cursor-pointer hover:text-[#FAC50C] duration-300"
          />
          <AiOutlineYoutube
            size={20}
            className="cursor-pointer hover:text-[#FAC50C] duration-300"
          />
          <AiOutlineTwitter
            size={20}
            className="cursor-pointer hover:text-[#FAC50C] duration-300 hidden sm:block"
          />
        </div>
      </div>

      {/* Pattern Background */}
      <div
        className="w-full h-8 md:h-[50px] bg-no-repeat"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default Footer;