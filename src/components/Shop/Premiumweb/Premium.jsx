import React from "react";
import { Link } from "react-router-dom";
import Footer from "../../Layout/Footer";
import Header2 from "../../Layout/Header2";

const Premium = () => {
  const premiumFeatures = [
    {
      title: "Elite Seller Training Academy",
      description: "Master e-commerce with exclusive training from industry leaders.",
      icon: "🎓",
    },
    {
      title: "Unlimited Transaction Power",
      description: "Scale effortlessly with no transaction limits.",
      icon: "💰",
    },
    {
      title: "Infinite Orders Unleashed",
      description: "Handle unlimited orders with ease.",
      icon: "📦",
    },
    {
      title: "Microfinance VIP Access",
      description: "Unlock exclusive loans to fuel your ambitions.",
      icon: "🏦",
    },
    {
      title: "Concierge-Level Guidance",
      description: "Personalized support for explosive growth.",
      icon: "🤝",
    },
    {
      title: "Luxury Website Experience",
      description: "Stunning, customizable websites built to convert.",
      icon: "🌐",
    },
  ];

  return (
    <>
      <Header2 />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-black text-white font-sans overflow-hidden">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto pt-24 pb-20 px-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl opacity-50 animate-glow"></div>
          <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight animate-fadeIn" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400">Premium Excellence</span>
          </h1>
          <p className="relative text-lg md:text-2xl mt-6 max-w-2xl mx-auto animate-fadeIn delay-200">
            Unlock a world of luxury, power, and boundless opportunities with Premium.
          </p>
          <Link
            to="/signup-premium"
            className="mt-10 inline-block bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulseGlow"
          >
            Claim Your Premium Now
          </Link>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 animate-slideInUp" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">Premium Perks</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <div
                key={index}
                className="relative bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-yellow-500/30 animate-fadeInUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl mb-4 text-yellow-400">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl opacity-60 animate-glowSlow"></div>
          <h2 className="relative text-4xl md:text-6xl font-bold mb-12 animate-slideInUp" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">Start Your Journey</span>
          </h2>
          <div className="relative max-w-md mx-auto bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-yellow-500/40">
            <h3 className="text-2xl font-semibold text-white">Premium Plan</h3>
            <p className="text-5xl font-bold text-yellow-400 mt-4">
              5000br <span className="text-lg text-gray-400">/month</span>
            </p>
            <p className="text-gray-300 mt-4">Dominate the market with unrivaled tools and support.</p>
            <Link
              to="/signup-premium"
              className="mt-6 inline-block bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Upgrade Now
            </Link>
            <p className="text-sm text-orange-400 mt-4 animate-pulse">Limited Offer: 20% off for the first 100!</p>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 animate-slideInUp" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">Success Stories</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", quote: "Premium doubled my revenue in just months!" },
              { name: "Arjun M.", quote: "Unlimited orders gave me the competitive edge." },
              { name: "Neha K.", quote: "My website now attracts dream customers!" },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-fadeInUp border border-yellow-500/20"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-white font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl opacity-50 animate-glow"></div>
          <h2 className="relative text-4xl md:text-6xl font-bold mb-8 animate-slideInUp" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-400">Build Your Empire</span>
          </h2>
          <p className="relative text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fadeIn delay-200">
            Join the elite and transform your business with Premium’s unmatched power.
          </p>
          <Link
            to="/signup-premium"
            className="relative inline-block bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-12 py-5 rounded-full text-xl font-semibold hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-110 animate-pulseGlow"
          >
            Go Premium Today
          </Link>
          <p className="relative text-sm text-orange-400 mt-6 animate-pulse">Hurry—exclusive perks won’t last!</p>
        </section>

        <Footer />
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        @keyframes glowSlow {
          0% { opacity: 0.5; }
          50% { opacity: 0.7; }
          100% { opacity: 0.5; }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(234, 179, 8, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(234, 179, 8, 0.8); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(234, 179, 8, 0.5); }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
        .animate-glow { animation: glow 4s infinite ease-in-out; }
        .animate-glowSlow { animation: glowSlow 6s infinite ease-in-out; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>
    </>
  );
};

export default Premium;