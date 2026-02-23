import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import { server, backend_url } from "../../../../server";
import ProPlanHero from "./ProPlanHero";
import ProPlanEvents from "./ProPlanEvents";
import ProPlanVideo from "./ProPlanVideo";
import ProPlanAllProducts from "./ProPlanAllProducts";
import ProPlanAbout from "./ProPlanAbout";
import ProPlanCollection from "./ProPlanCollection";
import ProPlanContact from "./ProPlanContact"
import Footer from "../../../Layout/Footer";
import { FaShoppingCart, FaUser, FaSearch, FaShareAlt } from "react-icons/fa";
import TemplatesHeader from "../../../Layout/TemplatesHeader";

const ProPlanMain = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState({});
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerBg, setHeaderBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setHeaderBg(true);
      } else {
        setHeaderBg(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      try {
        const shopRes = await api.get(`${server}/shop/get-shop-info/${id}`);
        const shopRaw = shopRes.data.shop;
        const logo = shopRaw.avatar?.url ? `${backend_url}${shopRaw.avatar.url}` : "/Uploads/placeholder-image.jpg";
        setShop({ ...shopRaw, logo });

        const productsRes = await api.get(
          `${server}/product/get-all-products-shop/${id}`
        );
        setProducts(productsRes.data.products);

        const eventsRes = await api.get(`${server}/event/get-all-events/${id}`);
        setEvents(eventsRes.data.events);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: shop?.name ? `${shop.name} - Shop` : "Shop",
          text: shop?.heroTagline || "Check out this shop!",
          url,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Shop URL copied to clipboard!");
        })
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FAC50C]"></div>
      </div>
    );

  return (
    <>
    <TemplatesHeader />
    <div className="min-h-screen bg-[#fff] overflow-x-hidden">
      {/* Hero Section (header will be inside hero) */}
      <ProPlanHero shop={shop} />

      {/* Video Shop Section */}
      <div id="video-shop-section" className="px-4 sm:px-6 lg:px-8">
        <ProPlanVideo products={products.filter(p => p.video || p.newVideoPreview)} shopId={id} />
      </div>

      {/* Shop Our Collection Section */}
     
        {/* Events/Collection Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <ProPlanEvents events={events} />
        </div>
        
        <div id="shop-section" className="px-4 sm:px-6 lg:px-8">
          <ProPlanAllProducts products={products} shopId={id} />
        </div>
        
        {/* Collection Section (Choose The Type) */}
        {/* <div id="collection-section" className="px-4 sm:px-6 lg:px-8">
          <ProPlanCollection />
        </div> */}
      
      {/* About Section */}
      <div id="about-section">
        <ProPlanAbout shop={shop} />
      </div>

      {/* Contact Section */}
      <div id="contact-section" className="px-4 sm:px-6 lg:px-8">
        <ProPlanContact shop={shop} />
      </div>

      <Footer />

      {/* Floating Share Button - Responsive positioning and sizing */}
      <button
        onClick={handleShare}
        className="fixed z-50 flex items-center justify-center text-white transition-all duration-300 bg-[#cc9a00] hover:bg-[#b38600] rounded-full shadow-2xl animate-bounce"
        style={{
          bottom: 'clamp(1.5rem, 5vw, 2rem)',
          right: 'clamp(1.5rem, 5vw, 2rem)',
          width: 'clamp(3rem, 8vw, 4rem)',
          height: 'clamp(3rem, 8vw, 4rem)',
        }}
        aria-label="Share Shop"
      >
        <FaShareAlt className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Mobile Navigation Indicator (optional) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center md:hidden">
        <div className="flex items-center justify-around w-full max-w-md p-3 mb-2 bg-white rounded-full shadow-lg">
          <button 
            onClick={() => document.getElementById('video-shop-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:text-[#FAC50C]"
          >
            Videos
          </button>
          <button 
            onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:text-[#FAC50C]"
          >
            Products
          </button>
          <button 
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:text-[#FAC50C]"
          >
            About
          </button>
          <button 
            onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:text-[#FAC50C]"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProPlanMain;