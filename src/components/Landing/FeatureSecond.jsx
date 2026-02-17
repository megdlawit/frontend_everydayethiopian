import React, { useEffect, useRef, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import sell1 from "../../Assests/images/sell1.svg";
import socials from "../../Assests/images/socials.svg";
import award from "../../Assests/images/award.svg";
import ppl from "../../Assests/images/ppl.svg";
import house from "../../Assests/images/house.png";

const FeatureSecond = () => {
  const buttonsRef = useRef([]);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      buttonsRef.current.forEach((btn, index) => {
        if (btn) {
          btn.style.animationDelay = `${index * 0.2}s`;
        }
      });
    }
  }, [isVisible]);

  const fadeClass = isVisible ? "animate-fade" : "reset-fade";
  const slideClass = isVisible ? "animate-slide" : "reset-slide";
  const scaleClass = isVisible ? "animate-scale" : "reset-scale";
  const slideLeftClass = isVisible ? "animate-slide-left" : "reset-slide-left";

  return (
    <section ref={sectionRef} className="bg-[#0b1a1c] text-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-20 font-sans">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .reset-fade {
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-fade {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .reset-slide {
          opacity: 0;
          transform: translateX(20px);
        }
        .animate-slide {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .reset-slide-left {
          opacity: 0;
          transform: translateX(-20px);
        }
        .animate-slide-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .reset-scale {
          opacity: 0;
          transform: scale(0.8);
        }
        .animate-scale {
          animation: scaleIn 0.6s ease-out forwards;
        }
      `}</style>
      {/* --- Section Title --- */}
      <h2 className="text-left text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Quesha'] mb-8 sm:mb-10 md:mb-12 tracking-wide text-[#d9ede1]">
        We are here to help you be seen
      </h2>

      {/* --- Container --- */}
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        {/* --- Top Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 sm:gap-8 md:gap-10">
          {/* --- Sell your products in videos --- */}
          <div className="bg-[#0C1B1E] border border-[#14282B] rounded-xl p-4 sm:p-6 md:p-8 flex flex-col shadow-lg w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] justify-center">
            <h3 className={`text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-[#d9ede1] mb-4 sm:mb-6 text-left font-['Quesha'] ${fadeClass}`}>
              Sell your products in short, fun videos.
            </h3>
            <div className="bg-[#0D181B] border border-[#14282B] rounded-xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 w-full flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6 md:gap-8">
              <img
                src={sell1}
                alt="Sell in videos"
                className={`w-32 sm:w-40 md:w-44 lg:w-56 h-auto object-contain mb-4 lg:mb-0 ${slideClass}`}
              />
              <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-full lg:max-w-[280px]">
                <button 
                  ref={(el) => (buttonsRef.current[0] = el)}
                  className={`bg-gradient-to-r from-[#1C3B3E] to-[#4A9CA4] text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base border border-[#0891b2] w-full flex items-center justify-start pl-4 sm:pl-6 tracking-wide shadow-md ${fadeClass}`}
                >
                  <FaShoppingCart className="mr-2 text-lg sm:text-xl" /> You have a new order
                </button>
                <button 
                  ref={(el) => (buttonsRef.current[1] = el)}
                  className={`bg-gradient-to-r from-[#1C3B3E] to-[#4A9CA4] text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base border border-[#0891b2] w-full flex items-center justify-start pl-4 sm:pl-6 tracking-wide shadow-md ${fadeClass}`}
                >
                  <FaShoppingCart className="mr-2 text-lg sm:text-xl" /> You have a new order
                </button>
                <button 
                  ref={(el) => (buttonsRef.current[2] = el)}
                  className={`bg-gradient-to-r from-[#1C3B3E] to-[#4A9CA4] text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base border border-[#0891b2] w-full flex items-center justify-start pl-4 sm:pl-6 tracking-wide shadow-md ${fadeClass}`}
                >
                  <FaShoppingCart className="mr-2 text-lg sm:text-xl" /> You have a new order
                </button>
              </div>
            </div>
          </div>

          {/* --- Socials / Promotions --- */}
          <div className="bg-[#0C1B1E] border border-[#14282B] rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow-lg w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] justify-center">
            <h3 className={`text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-[#d9ede1] mb-4 sm:mb-6 text-left font-['Quesha'] ${fadeClass}`}>
              We promote your products to more buyers.
            </h3>
            <div className="bg-[#0D181B] border border-[#14282B] rounded-xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 w-full flex justify-center items-center">
              <img
                src={socials}
                alt="Social promotion"
                className={`w-48 sm:w-60 md:w-72 lg:w-80 h-auto object-contain ${slideLeftClass}`}
              />
            </div>
          </div>
        </div>

        {/* --- Bottom Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 sm:gap-8 md:gap-10">
          {/* --- Seller of the Month --- */}
          <div className="bg-[#0C1B1E] border border-[#14282B] rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow-lg w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] justify-center">
            <h3 className={`text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-[#d9ede1] mb-4 sm:mb-6 font-['Quesha'] text-left ${fadeClass}`}>
              Shine as Seller of the Month.
            </h3>
            <div className="bg-[#0D181B] border border-[#14282B] rounded-xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 w-full flex items-center justify-start">
              <img
                src={award}
                alt="Award trophy"
                className={`w-16 sm:w-20 md:w-22 lg:w-24 h-auto object-contain flex-shrink-0 -ml-1 sm:-ml-2 md:-ml-4 -mt-1 sm:-mt-2 md:-mt-4 ${slideClass}`}
              />
              <p className={`bg-gradient-to-r from-[#1C3B3E] to-[#4A9CA4] px-3 sm:px-5 py-2 sm:py-3 w-full sm:w-[200px] text-base sm:text-lg rounded-xl font-medium text-[#FFFFFF] border border-[#E2E2E2] ml-0 sm:ml-4 md:ml-[3.75rem] mt-0 sm:mt-2 md:mt-4 ${fadeClass}`} style={{ animationDelay: '0.4s' }}>
                This month, <br className="hidden sm:block" />
                <span className="block sm:inline">the stage is yours.</span>
              </p>
            </div>
          </div>

          {/* --- 100 Birr Sunday --- */}
          <div className="bg-[#0C1B1E] border border-[#14282B] rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow-lg w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] justify-center">
            <h3 className={`text-2xl sm:text-3xl md:text-3xl lg:text-3xl text-[#d9ede1] mb-4 sm:mb-6 text-left font-['Quesha'] ${fadeClass}`}>
              Sell at our weekly "100 Birr Sunday" event.
            </h3>
            <div className="bg-[#0D181B] border border-[#14282B] rounded-xl px-4 sm:px-6 py-4 sm:py-6 md:py-8 w-full flex flex-col md:flex-row items-end justify-between gap-6 sm:gap-8 md:gap-10">
              <img
                src={ppl}
                alt="People walking"
                className={`w-40 sm:w-50 md:w-60 lg:w-70 h-auto object-contain self-end md:self-auto ${slideClass}`}
              />
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full md:w-auto">
                <img
                  src={house}
                  alt="Event stall"
                  className={`w-48 sm:w-56 md:w-64 lg:w-80 xl:w-90 h-auto object-contain ${slideClass}`}
                  style={{ animationDelay: '0.2s' }}
                />
                <button className={`bg-gradient-to-r from-[#1C3B3E] to-[#4A9CA4] mt-0 md:mt-[-6rem] mr-0 md:mr-[1rem] px-4 sm:px-5 py-2 sm:py-3 w-full sm:w-[225px] text-base sm:text-lg rounded-xl font-medium text-[#FFFFFF] border border-[#E2E2E2] ${fadeClass}`} style={{ animationDelay: '0.6s' }}>
                  Join our 100 Birr event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSecond;