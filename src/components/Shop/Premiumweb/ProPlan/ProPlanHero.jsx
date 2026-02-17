import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backend_url } from "../../../../server";
import { FaChevronDown } from "react-icons/fa";

const ProPlanHero = ({ shop }) => {
  let bgImage = "/Uploads/placeholder-image.jpg";
  if (shop?.heroImage?.url && shop.heroImage.url !== "") {
    bgImage = shop.heroImage.url.startsWith("http")
      ? shop.heroImage.url
      : `${backend_url}${shop.heroImage.url}`;
  }

  const title = shop?.heroTagline || "Livii Golds\nJewellery";
  const navigate = useNavigate();
  const { id } = useParams();

  const [inView, setInView] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setInView(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [headerBg, setHeaderBg] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setHeaderBg(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToVideoShop = () => {
    const section = document.getElementById("video-shop-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={heroRef}
      className={`relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[100vh] bg-cover bg-center transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header overlay inside hero */}
      <header
        className={`w-full left-0 z-40 transition-all duration-500 ${
          headerBg ? "shadow-md fixed" : "absolute"
        }`}
        style={{
          top: 0,
          backdropFilter: headerBg ? "blur(8px)" : "none",
          backgroundColor: headerBg
            ? "rgba(249,246,242,0.85)"
            : "rgba(0,0,0,0.0)",
          transition: "background-color 0.5s, backdrop-filter 0.5s",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 sm:px-6 md:px-8">
          {/* Home Button Left */}
          <button
            className="text-white text-sm sm:text-base font-light bg-transparent hover:text-[#cc9a00] transition-all whitespace-nowrap"
            style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
            onClick={() => navigate("/")}
          >
            Home
          </button>

          {/* Logo Centered */}
          <div className="flex-1 flex justify-center items-center min-w-0 px-2">
            <img
              src={shop?.logo || "/Uploads/placeholder-image.jpg"}
              alt="Shop Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => (e.target.src = "/Uploads/placeholder-image.jpg")}
            />
          </div>

          {/* All Shop Button Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="text-white border border-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 rounded-full font-light bg-transparent hover:border-[#cc9a00] hover:text-[#cc9a00] transition-all text-xs sm:text-sm md:text-base whitespace-nowrap"
              style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
              onClick={() => navigate(`/proplan/${id}/all-products`)}
            >
              All Shop
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center mb-2 mt-16 sm:mt-20 justify-center text-center z-20 px-4">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-serif drop-shadow-lg whitespace-pre-line w-full md:w-3/4 lg:w-1/2 max-w-4xl xl:max-w-6xl"
          style={{
            fontFamily: "'Quesha', serif",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </h1>
        <p
          className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-white font-light max-w-xs sm:max-w-sm md:max-w-xl mb-12 sm:mb-16 md:mb-20 px-4"
          style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
        >
          {shop?.heroDescription || "Transforming interiors with personalized design, turning your vision into a reality both indoors and outdoors."}
        </p>

        {/* Down Icon Button */}
        <button
          className="flex items-center justify-center h-[4rem] p-2 border-2 border-white text-white rounded-full text-xl hover:border-[#cc9a00] hover:text-[#cc9a00] transition-all duration-300 transform hover:scale-105"
          style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
          onClick={scrollToVideoShop}
          aria-label="Scroll to Video Shop"
        >
          <FaChevronDown />
        </button>
      </div>
    </div>
  );
};

export default ProPlanHero;