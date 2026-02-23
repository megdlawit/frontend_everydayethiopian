import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { getAllEventsShop } from "../../redux/actions/event";
import { server, backend_url } from "../../server";
import axios from "axios";
import Footer from "../../components/Layout/Footer";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import EventCard from "../../components/Events/EventCard";
import Ratings from "../../components/Products/Ratings";
import CountDown from "../../components/Events/CountDown";
import { Link } from "react-router-dom"; 

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return "/uploads/placeholder-image.jpg";
  return url.startsWith("http") ? url : `${backend_url}${url}`;
};

const PremiumShopPreview = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const [shopData, setShopData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const shopResponse = await axios.get(`${server}/shop/get-shop-info/${id}`);
        setShopData(shopResponse.data.shop);
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
    const url = `${window.location.origin}/shop/premiumpreview/${id}`;
    if (navigator.share) {
      navigator.share({
        title: `${shopData?.name} - Premium Shop`,
        text: `Explore exquisite products at ${shopData?.name}!`,
        url,
      }).catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Shop URL copied to clipboard!");
      }).catch((err) => console.error("Failed to copy: ", err));
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
    e.target.src = "/uploads/placeholder-image.jpg";
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="w-full bg-gradient-to-b from-yellow-100 via-white to-yellow-50 min-h-screen font-sans relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg text-center py-6 md:py-8 animate-fadeInDown">
        <div className="flex flex-col items-center gap-4 mb-4 md:mb-6">
          <Link to={`/shop/premiumpreview/${id}`}>
            <div className="relative">
              <img
                src={getImageUrl(shopData.avatar?.url)}
                alt="Shop Logo"
                className="w-[50px] h-[50px] rounded-full object-cover border-2 border-yellow-600 animate-spin-slow"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/30 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </Link>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-yellow-600 tracking-wide animate-pulse"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {shopData.name || "Premium Shop"}
          </h1>
        </div>
        <ul className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
          {["Home", "Shop", "Events", "Reviews", "About", "Contact"].map((item) => (
            <li
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className={`cursor-pointer text-gray-600 hover:text-yellow-600 transition-all duration-300 font-medium text-base md:text-lg transform hover:scale-110 hover:shadow-md px-3 py-1 rounded-full ${
                activeSection === item.toLowerCase() ? "text-yellow-600 bg-yellow-100 border-2 border-yellow-600" : ""
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto pt-12 md:pt-16 pb-10 md:pb-12 px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn"
      >
        <div className="relative group">
          <img
            src={getImageUrl(products?.[0]?.images?.[0]?.url)}
            alt={products?.[0]?.name || "Featured Product"}
            className="w-full rounded-2xl object-cover h-[300px] md:h-[500px] transform transition-transform duration-700 group-hover:scale-105 shadow-2xl"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 md:top-6 left-4 md:left-6 text-white">
            <p className="text-lg md:text-xl font-medium animate-slideInLeft">Featured Product</p>
            <h3 className="text-2xl md:text-3xl font-bold animate-slideInLeft delay-200">
              {products?.[0]?.name || "Elegant Item"}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products?.length > 1 ? (
            products.slice(1, 5).map((product, index) => (
              <div key={product._id} className="relative group overflow-hidden">
                <img
                  src={getImageUrl(product?.images?.[0]?.url)}
                  alt={product.name || "Product"}
                  className="w-full rounded-2xl object-cover h-[140px] md:h-[240px] transform transition-transform duration-700 group-hover:scale-110 shadow-xl"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-yellow-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-2 md:top-4 left-2 md:left-4 text-white">
                  <p className={`text-xs md:text-sm font-medium animate-slideInRight delay-${index * 100}`}>
                    Featured
                  </p>
                  <h3 className={`text-sm md:text-lg font-semibold animate-slideInRight delay-${(index + 1) * 100}`}>
                    {product.name}
                  </h3>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-500 text-center">No additional products to display.</p>
          )}
        </div>
      </section>

      {/* Shop Products Section */}
      <section id="shop" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Shop Our Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} data={product} isShop={true} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No products available yet.</p>
          )}
        </div>
      </section>

      {/* Running Events Section */}
      <section
        id="events"
        className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-r from-yellow-200 to-white rounded-2xl shadow-2xl animate-fadeIn"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Running Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <div
                key={event._id}
                className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={getImageUrl(event.images?.[0]?.url)}
                  alt={event.name}
                  className="w-full h-48 object-cover transform transition-transform duration-700 group-hover:scale-110"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg md:text-xl font-semibold animate-slideInUp">
                    {event.name}
                  </h3>
                  {/* <CountDown data={event} /> */}
                </div>
                <button
                  onClick={() => console.log(`Joining event: ${event.name}`)}
                  className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                >
                  Join Now
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No running events at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((review, index) => (
              <div
                key={index}
                className="p-6 bg-yellow-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={getImageUrl(review.user.avatar?.url)}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-yellow-400"
                    onError={handleImageError}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{review.user.name}</h3>
                    <Ratings rating={review.rating} />
                  </div>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No reviews yet.</p>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          About {shopData.name}
        </h2>
        <div className="text-center">
          <p className="text-gray-600 mt-4 md:mt-6 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto animate-fadeInUp delay-200">
            {shopData.description || "Welcome to our shop! We offer premium products crafted with passion and care."}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-br from-[#FAC50C]/10 to-white rounded-2xl shadow-2xl animate-fadeIn">
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 md:mb-8 animate-slideInUp"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in Touch
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 md:mb-12 animate-fadeInUp delay-200">
            Reach out to us for inquiries or support!
          </p>
          <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-8 md:gap-12 animate-fadeInUp delay-300">
            <a
              href={`mailto:${shopData.email}`}
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">
                Email Us
              </span>
            </a>
            <a
              href={`tel:${shopData.phoneNumber}`}
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.23.37-.57.25-.91-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">
                Call Us
              </span>
            </a>
            <a
              href={shopData.contact?.mapUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">
                Visit Us
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Floating Share Button */}
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center shadow-2xl z-30 animate-bounce"
      >
        <svg className="w-5 md:w-6 h-5 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>

      {/* Footer */}
      <Footer />

      {/* Custom CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
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
      `}</style>
    </div>
  );
};

export default PremiumShopPreview;