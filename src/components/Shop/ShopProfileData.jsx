import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { getAllEventsShop } from "../../redux/actions/event";
import { server, backend_url } from "../../server";
import api from "../../utils/api";
import Footer from "../../components/Layout/Footer";
import ProductCard from "../Route/ProductCard/ProductCard";
import EventCard from "../Events/EventCard";
import Ratings from "../Products/Ratings";
import { FaShareAlt } from "react-icons/fa";
import Pagination from "../Pagination";
import Loader from "../Layout/Loader";
import ShopProfileHeader from "./ShopProfileHeader";
import ScrollableProductCarousel from "../../pages/Shop/ScrollableProductCarousel";
import peac from "../../Assests/images/peac.png";
import TemplatesHeader from "../Layout/TemplatesHeader";

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { id } = useParams();
  const dispatch = useDispatch();
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/Uploads/placeholder-image.jpg";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const shopResponse = await api.get(`${server}/shop/get-shop-info/${id}`);
        setData(shopResponse.data.shop);
        dispatch(getAllProductsShop(id));
        dispatch(getAllEventsShop(id));
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  const allReviews = products && products.map((product) => product.reviews).flat();

  const handleShare = () => {
    const url = `${window.location.origin}/shop/preview/${id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${data?.name} - Shop Profile`,
          text: `Explore exquisite products at ${data?.name}!`,
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/Uploads/placeholder-image.jpg";
  };

  const joinedYear = data.createdAt ? new Date(data.createdAt).getFullYear() : "N/A";

  // Helper function to check if a file is an image (not a video)
  const isImage = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    return !videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  // Filter products to only those with an image (not video) as the first media
  const imageProducts = products
    ? products.filter(
        (product) =>
          product.images &&
          product.images[0] &&
          isImage(product.images[0].url)
      )
    : [];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
    <TemplatesHeader />
    <div className="w-full bg-white min-h-screen font-sans relative overflow-hidden">
      <ShopProfileHeader
        data={data}
        joinedYear={joinedYear}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        id={id}
      />
      
      {/* Hero Section - Responsive */}
      <section
        id="home"
        className={`max-w-7xl mx-auto pt-6 md:pt-12 lg:pt-16 pb-6 md:pb-10 lg:pb-12 px-4 sm:px-6 lg:px-10 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 md:gap-6 animate-fadeIn bg-white`}
      >
        <div className="relative group">
          <img
            src={getImageUrl(imageProducts?.[0]?.images?.[0]?.url)}
            alt={imageProducts?.[0]?.name || "Featured Product"}
            className={`w-full rounded-xl md:rounded-2xl object-cover ${isMobile ? 'h-[200px] sm:h-[250px]' : 'h-[300px] md:h-[400px] lg:h-[500px]'} transform transition-transform duration-700 group-hover:scale-105 shadow-lg md:shadow-2xl`}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c3b3c]/30 to-transparent rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`absolute top-3 md:top-4 lg:top-6 left-3 md:left-4 lg:left-6 text-white`}>
            <p className={`${isMobile ? 'text-sm' : 'text-lg md:text-xl'} font-medium animate-slideInLeft`}>Featured Product</p>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'} font-bold animate-slideInLeft delay-200`}>
              {imageProducts?.[0]?.name || "Elegant Item"}
            </h3>
            {imageProducts?.[0]?.discountPrice && (
              <p className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'} font-semibold animate-slideInLeft delay-300 text-[#fff]`}>
                {imageProducts[0].discountPrice} ETB
              </p>
            )}
          </div>
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-3 md:gap-4`}>
          {imageProducts?.length > 1 ? (
            imageProducts.slice(1, 5).map((product, index) => (
              <div key={product._id} className="relative group overflow-hidden">
                <img
                  src={getImageUrl(product?.images?.[0]?.url)}
                  alt={product.name || "Product"}
                  className={`w-full rounded-xl md:rounded-2xl object-cover ${isMobile ? 'h-[100px] sm:h-[120px]' : 'h-[140px] md:h-[190px] lg:h-[240px]'} transform transition-transform duration-700 group-hover:scale-110 shadow-md md:shadow-xl`}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-[#1c3b3c]/20 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`absolute top-2 md:top-3 lg:top-4 left-2 md:left-3 lg:left-4 text-white`}>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} font-medium animate-slideInRight delay-${index * 100}`}>
                    Featured
                  </p>
                  <h3 className={`${isMobile ? 'text-xs' : 'text-sm md:text-lg'} font-semibold animate-slideInRight delay-${(index + 1) * 100} line-clamp-1`}>
                    {product.name || "Unnamed Product"}
                  </h3>
                  {product.discountPrice && (
                    <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} font-semibold animate-slideInRight delay-${(index + 2) * 100} text-[#fff]`}>
                      {product.discountPrice} ETB
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-500 text-center text-sm md:text-base">No additional products to display.</p>
          )}
        </div>
      </section>

      {/* Shop Products Section - Responsive */}
      <section id="shop" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 lg:py-20 bg-white`}>
        <h2
          className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'} text-[#1c3b3c] text-center mb-6 md:mb-8 lg:mb-12 animate-slideInUp`}
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Shop Our Collection
        </h2>
        <div className={`grid ${isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4 md:gap-6 justify-items-center`}>
          {imageProducts && imageProducts.length > 0 ? (
            imageProducts.slice(0, isMobile ? 2 : 4).map((product) => (
              <ProductCard key={product._id} data={product} hideShopLink={true} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full text-sm md:text-base">No products available yet.</p>
          )}
        </div>
      </section>
      
      <ScrollableProductCarousel products={products} />

      {/* Running Events Section - Responsive */}
      <section
        id="events"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 lg:py-20 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl animate-fadeIn`}
      >
        <h2
          className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'} text-[#1c3b3c] text-center mb-6 md:mb-8 lg:mb-12 animate-slideInUp`}
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Running Events
        </h2>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-6`}>
          {events && events.length > 0 ? (
            events.slice(0, isMobile ? 1 : 3).map((event, index) => (
              <div
                key={event._id}
                className="relative group overflow-hidden rounded-xl md:rounded-2xl shadow-md md:shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={getImageUrl(event.images?.[0]?.url)}
                  alt={event.name || "Event"}
                  className={`w-full ${isMobile ? 'h-40 sm:h-48' : 'h-48 md:h-56'} object-cover transform transition-transform duration-700 group-hover:scale-110`}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c3b3c]/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className={`absolute bottom-3 md:bottom-4 left-3 md:left-4 text-white`}>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'} font-semibold animate-slideInUp line-clamp-1`}>
                    {event.name || "Unnamed Event"}
                  </h3>
                </div>
                <button
                  onClick={() => console.log(`Joining event: ${event.name}`)}
                  className={`absolute top-2 right-2 bg-[#cc9a00] text-white px-2 md:px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 hover:bg-[#b38600] text-xs md:text-sm`}
                >
                  Join Now
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full text-sm md:text-base">
              No running events at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Reviews Section - Responsive */}
      {allReviews && allReviews.length > 0 && (
        <section id="reviews" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 lg:py-20 bg-white animate-fadeIn`}>
          <h2
            className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'} text-[#1c3b3c] text-center mb-6 md:mb-8 lg:mb-12 animate-slideInUp`}
            style={{ fontFamily: "'Quesha', sans-serif" }}
          >
            Customer Reviews
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-6`}>
            {allReviews.map((review, index) => (
              <div
                key={index}
                className="p-4 md:p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-3 md:mb-4">
                  <img
                    src={getImageUrl(review.user.avatar?.url)}
                    alt="User Avatar"
                    className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover mr-3 border-2 border-[#cc9a00]`}
                    onError={handleImageError}
                  />
                  <div>
                    <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold text-[#1c3b3c] line-clamp-1`}>
                      {review.user.name || "Anonymous"}
                    </h3>
                    <Ratings rating={review.rating} size={isMobile ? 14 : 16} />
                  </div>
                </div>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed line-clamp-3 md:line-clamp-4`}>
                  {review.comment || "No comment provided."}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Us Section - Responsive */}
      <section id="about" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 lg:py-20 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl animate-fadeIn`}>
        <h2
          className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'} text-[#1c3b3c] text-center mb-6 md:mb-8 lg:mb-12 animate-slideInUp`}
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          About {data.name}
        </h2>
        <div className="text-center">
          <p className={`text-gray-600 mt-3 md:mt-4 lg:mt-6 ${isMobile ? 'text-base' : 'text-lg md:text-xl'} leading-relaxed max-w-4xl mx-auto animate-fadeInUp delay-200`}>
            {data.description || "Welcome to our shop! We offer premium products crafted with passion and care."}
          </p>
        </div>
      </section>

      {/* Contact Section - Responsive */}
      <section id="contact" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 lg:py-20 bg-white animate-fadeIn`}>
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl lg:text-5xl'} text-[#1c3b3c] mb-4 md:mb-6 lg:mb-8 animate-slideInUp`}
            style={{ fontFamily: "'Quesha', sans-serif" }}
          >
            Get in Touch
          </h2>
          <p className={`text-gray-600 ${isMobile ? 'text-base' : 'text-lg md:text-xl'} leading-relaxed mb-6 md:mb-8 lg:mb-12 animate-fadeInUp delay-200`}>
            Reach out to us for inquiries or support!
          </p>
          <div className={`mt-4 md:mt-6 lg:mt-8 flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} justify-center ${isMobile ? 'gap-6' : 'gap-6 md:gap-8 lg:gap-12'} animate-fadeInUp delay-300`}>
            <a
              href={`mailto:${data.email || "support@example.com"}`}
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-3 md:p-4 rounded-full shadow-lg border-2 border-[#cc9a00] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-[#cc9a00] group-hover:scale-110 transition-transform duration-300`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <span className={`mt-2 md:mt-3 text-[#1c3b3c] group-hover:text-[#cc9a00] ${isMobile ? 'text-sm' : 'font-medium'} transition-colors duration-300`}>
                Email Us
              </span>
            </a>
            <a
              href={`tel:${data.phoneNumber || "+1234567890"}`}
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-3 md:p-4 rounded-full shadow-lg border-2 border-[#cc9a00] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-[#cc9a00] group-hover:scale-110 transition-transform duration-300`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.23.37-.57.25-.91-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              <span className={`mt-2 md:mt-3 text-[#1c3b3c] group-hover:text-[#cc9a00] ${isMobile ? 'text-sm' : 'font-medium'} transition-colors duration-300`}>
                Call Us
              </span>
            </a>
            <a
              href={data.contact?.mapUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-3 md:p-4 rounded-full shadow-lg border-2 border-[#cc9a00] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-[#cc9a00] group-hover:scale-110 transition-transform duration-300`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className={`mt-2 md:mt-3 text-[#1c3b3c] group-hover:text-[#cc9a00] ${isMobile ? 'text-sm' : 'font-medium'} transition-colors duration-300`}>
                Visit Us
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Floating Share Button - Responsive */}
      <button
        onClick={handleShare}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 ${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-16 md:h-16'} bg-[#cc9a00] text-white rounded-full hover:bg-[#b38600] transition-all duration-300 flex items-center justify-center shadow-xl md:shadow-2xl z-30 animate-bounce`}
      >
        <FaShareAlt className={`${isMobile ? 'w-4 h-4' : 'w-5 md:w-6 h-5 md:h-6'}`} />
      </button>

      {/* Custom CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
        .animate-bounce { animation: bounce 2s infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
    </>
  );
};

export default ShopProfileData;