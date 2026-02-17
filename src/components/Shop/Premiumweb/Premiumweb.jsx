import React, { useState } from "react";
import Footer from "../../Layout/Footer";

const products = [
  { id: 1, img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d", name: "Elegant Necklace", price: "$129", category: "Necklaces" },
  { id: 2, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e", name: "Gold Earrings", price: "$89", category: "Earrings" },
  { id: 3, img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d", name: "Silver Bracelet", price: "$99", category: "Bracelets" },
  { id: 4, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", name: "Diamond Ring", price: "$199", category: "Rings" },
  { id: 5, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e", name: "Pearl Necklace", price: "$149", category: "Necklaces" },
  { id: 6, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e", name: "Luxury Watch", price: "$249", category: "Watches" },
  { id: 7, img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d", name: "Chic Pendant", price: "$79", category: "Pendants" },
  { id: 8, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e", name: "Statement Jewelry", price: "$159", category: "Statement" },
];

const Premiumweb = () => {
  const shopUrl = "https://PremiumShop.example.com";
  const [activeSection, setActiveSection] = useState("Home");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "PremiumShop - Premium Jewelry Shop",
        text: "Discover exquisite jewelry at PremiumShop!",
        url: shopUrl,
      }).catch((error) => console.log("Error sharing:", error));
    } else {
      alert(`Share this link with your buyers: ${shopUrl}`);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-yellow-100 via-white to-yellow-50 min-h-screen font-sans relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg text-center py-6 md:py-8 animate-fadeInDown">
        <div className="flex flex-col items-center gap-4 mb-4 md:mb-6">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-yellow-600 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-600 tracking-wide animate-pulse" style={{ fontFamily: "'Playfair Display', serif" }}>
            PremiumShop
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
      <section id="home" className="max-w-7xl mx-auto pt-12 md:pt-16 pb-10 md:pb-12 px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
        <div className="relative group">
          <img
            src={products[3].img}
            alt={products[3].name}
            className="w-full rounded-2xl object-cover h-[300px] md:h-[500px] transform transition-transform duration-700 group-hover:scale-105 shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 md:top-6 left-4 md:left-6 text-white">
            <p className="text-lg md:text-xl font-medium animate-slideInLeft">{products[3].category}</p>
            <h3 className="text-2xl md:text-3xl font-bold animate-slideInLeft delay-200">{products[3].name}</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[products[0], products[1], products[2], products[4]].map((product, index) => (
            <div key={product.id} className="relative group overflow-hidden">
              <img
                src={product.img}
                alt={product.name}
                className="w-full rounded-2xl object-cover h-[140px] md:h-[240px] transform transition-transform duration-700 group-hover:scale-110 shadow-xl"
              />
              <div className="absolute inset-0 bg-yellow-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-2 md:top-4 left-2 md:left-4 text-white">
                <p className={`text-xs md:text-sm font-medium animate-slideInRight delay-${index * 100}`}>{product.category}</p>
                <h3 className={`text-sm md:text-lg font-semibold animate-slideInRight delay-${(index + 1) * 100}`}>{product.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 flex flex-col md:flex-row gap-8 md:gap-12 animate-fadeIn">
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight animate-slideInUp">New Arrivals</h2>
          <div className="mt-6 md:mt-10 grid grid-cols-2 gap-6 md:gap-8">
            {products.slice(0, 2).map((product) => (
              <div key={product.id} className="relative group overflow-hidden">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full rounded-lg object-cover h-[140px] md:h-[240px] transform transition-transform duration-500 scale-100 group-hover:scale-125 shadow-lg"
                />
                <div className="absolute inset-0 bg-yellow-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <p className="mt-2 md:mt-4 text-gray-800 font-medium text-base md:text-lg animate-fadeInUp">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center">
          <div>
            <p className="text-gray-600 mt-4 md:mt-6 text-lg md:text-xl leading-relaxed animate-slideInRight delay-200">
              Experience luxury like never before. This premium shop is crafted to showcase your finest jewelry, captivate buyers, and elevate your brand to new heights.
            </p>
          </div>
        </div>
      </section>

      {/* Running Events Section */}
      <section id="events" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-r from-yellow-200 to-white rounded-2xl shadow-2xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">Running Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Spring Jewelry Gala", date: "April 15, 2025", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d" },
            { title: "Summer Sale Extravaganza", date: "July 20, 2025", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" },
            { title: "Winter Luxury Showcase", date: "December 10, 2025", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d" },
          ].map((event, index) => (
            <div key={index} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500">
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-48 object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg md:text-xl font-semibold animate-slideInUp">{event.title}</h3>
                <p className="text-sm md:text-base animate-slideInUp delay-100">{event.date}</p>
              </div>
              <button className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                Join Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Sarah J.", review: "Absolutely stunning jewelry! The quality is unmatched.", rating: 5 },
            { name: "Michael R.", review: "Fast shipping and beautiful pieces. Highly recommend!", rating: 4 },
            { name: "Emily T.", review: "The best luxury shop I've ever found. Worth every penny!", rating: 5 },
          ].map((review, index) => (
            <div key={index} className="p-6 bg-yellow-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${index * 200}ms` }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl">
                  {review.name[0]}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">{review.review}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">About Us</h2>
        <div className="text-center">
          <p className="text-gray-600 mt-4 md:mt-6 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto animate-fadeInUp delay-200">
            At PremiumShop, we craft timeless pieces that reflect your unique style. Founded with a passion for luxury and craftsmanship, we empower sellers to build their dream shops and connect with discerning buyers worldwide.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section id="shop" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">Shop Our Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="border border-yellow-100 p-4 md:p-5 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group animate-fadeInUp relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full object-cover h-[180px] md:h-[220px] transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <button className="absolute top-2 md:top-3 right-2 md:right-3 text-gray-400 hover:text-red-500 transition-colors duration-300">
                  <svg className="w-5 md:w-6 h-5 md:h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                  </svg>
                </button>
              </div>
              <h3 className="mt-3 md:mt-4 font-semibold text-gray-800 text-lg md:text-xl">{product.name}</h3>
              <p className="text-yellow-600 font-medium text-base md:text-lg mt-1 md:mt-2">{product.price}</p>
              <button className="mt-3 md:mt-4 px-4 md:px-6 py-1 md:py-2 bg-yellow-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-sm md:text-base">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-br from-[#FAC50C]/10 to-white rounded-2xl shadow-2xl animate-fadeIn relative overflow-hidden">
        <div className="text-center max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 md:mb-8 animate-slideInUp" style={{ fontFamily: "'Playfair Display', serif" }}>
            Get in Touch
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 md:mb-12 animate-fadeInUp delay-200">
            We'd love to hear from you! Reach out through any of these channels.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-8 md:gap-12 animate-fadeInUp delay-300">
            <a href="mailto:support@PremiumShop.com" className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">Email Us</span>
            </a>
            <a href="tel:+15551234567" className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.23.37-.57.25-.91-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">Call Us</span>
            </a>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300">Find Us</span>
            </a>
          </div>
          <div className="mt-10 flex justify-center gap-6">
            <a href="https://twitter.com/PremiumShop" target="_blank" rel="noopener noreferrer" className="text-[#FAC50C] hover:text-[#FAC50C]/80 transition-colors duration-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://facebook.com/PremiumShop" target="_blank" rel="noopener noreferrer" className="text-[#FAC50C] hover:text-[#FAC50C]/80 transition-colors duration-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://instagram.com/PremiumShop" target="_blank" rel="noopener noreferrer" className="text-[#FAC50C] hover:text-[#FAC50C]/80 transition-colors duration-300">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Floating Share Button */}
      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center shadow-2xl z-30 animate-bounce"
      >
        <svg className="w-5 md:w-6 h-5 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
      </button>

      {/* Footer */}
      <Footer />

      {/* Custom CSS for Animations and Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
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

export default Premiumweb;