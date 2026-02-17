// Aboutus.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Layout/Header";
import peacdash from "../Assests/peacdash.png";
import mascot from "../Assests/peacock.png";
import community from "../Assests/group_1.jpg";
import a1 from "../Assests/group_1.jpg";
import a2 from "../Assests/group_2.jpg";
import a3 from "../Assests/product-1.jpg";
import a4 from "../Assests/product-2.jpg";
import seller1 from "../Assests/seller-1.jpg";
import seller2 from "../Assests/seller-2.jpg";
import seller3 from "../Assests/seller-3.jpg";
import seller4 from "../Assests/seller-4.jpg";
import seller5 from "../Assests/seller-1.jpg";
import seller6 from "../Assests/seller-2.jpg";
import seller7 from "../Assests/seller-3.jpg";
import seller8 from "../Assests/seller-4.jpg";
import seller9 from "../Assests/seller-1.jpg";
import seller10 from "../Assests/seller-2.jpg";
import seller11 from "../Assests/seller-3.jpg";
import seller12 from "../Assests/seller-4.jpg";
import Footer from "../components/Layout/Footer";
import product from "../Assests/Product3.png";

const Aboutus = () => {
  const avatarPool = [community, a1, a2, a3, a4];
  const getAvatar = (i) => avatarPool[i % avatarPool.length];
  const sellers = [
    seller1, seller2, seller3, seller4, seller5, seller6,
    seller7, seller8, seller9, seller10, seller11, seller12
  ];
  const circlePositions = (count, radius, center = 250) => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      return {
        left: center + radius * Math.cos(angle),
        top: center + radius * Math.sin(angle),
      };
    });
  };
  const COUNT = 12;
  const CommunityCircle = ({ isMobile = false }) => {
    const size = isMobile ? 280 : 500;
    const outerRadius = isMobile ? 120 : 220;
    const middleRadius = isMobile ? 80 : 150;
    const innerRadius = isMobile ? 50 : 85;
    const outerAvatarSize = isMobile ? 48 : 72;
    const middleAvatarSize = isMobile ? 36 : 52;
    const innerAvatarSize = isMobile ? 24 : 36;
    const outer = circlePositions(COUNT, outerRadius, size/2);
    const middle = circlePositions(COUNT, middleRadius, size/2);
    const inner = circlePositions(COUNT, innerRadius, size/2);
    return (
      <div
        className={`relative ${isMobile ? 'w-[280px] h-[280px]' : 'w-[500px] h-[500px]'} rounded-full`}
      >
        {/* OUTER RING */}
        <div className="zoom-outer">
          {outer.map((pos, i) => (
            <img
              key={`outer-${i}`}
              src={getAvatar(i)}
              className="absolute rounded-full object-cover shadow-md hover:scale-105 transition"
              style={{
                width: outerAvatarSize,
                height: outerAvatarSize,
                left: pos.left - outerAvatarSize/2,
                top: pos.top - outerAvatarSize/2,
              }}
              alt="Community member"
            />
          ))}
        </div>
        {/* MIDDLE RING */}
        <div className="zoom-middle">
          {middle.map((pos, i) => (
            <img
              key={`middle-${i}`}
              src={getAvatar(i + 2)}
              className="absolute rounded-full object-cover shadow-md hover:scale-105 transition"
              style={{
                width: middleAvatarSize,
                height: middleAvatarSize,
                left: pos.left - middleAvatarSize/2,
                top: pos.top - middleAvatarSize/2,
              }}
              alt="Community member"
            />
          ))}
        </div>
        {/* INNER RING */}
        <div className="zoom-inner">
          {inner.map((pos, i) => (
            <img
              key={`inner-${i}`}
              src={getAvatar(i + 4)}
              className="absolute rounded-full object-cover shadow-md hover:scale-105 transition"
              style={{
                width: innerAvatarSize,
                height: innerAvatarSize,
                left: pos.left - innerAvatarSize/2,
                top: pos.top - innerAvatarSize/2,
              }}
              alt="Community member"
            />
          ))}
        </div>
      </div>
    );
  };
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(0);
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize(containerRef.current.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const isMobile = containerSize < 640;
  const count = isMobile ? 8 : 12;
  const radiusRatio = isMobile ? 110 / 130 : 390 / 420;
  const radius = (containerSize / 2) * radiusRatio;
  const avatarSize = isMobile ? (containerSize / 260) * 56 : (containerSize / 700) * 144;
  const positions = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
  return (
    <>
      <Header />
      <div className="bg-[#F3F4F6] min-h-screen">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 md:pt-24 pb-10 md:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center ">
          <div className="text-center lg:text-left">
            <span className="inline-block mb-4 md:mb-6 px-3 md:px-5 py-1 md:py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs md:text-sm font-medium">
              BUILT FOR EVERYDAY ETHIOPIA
            </span>
            <h1
              style={{ fontFamily: 'Quesha'}}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-[#163533] mb-6 md:mb-8"
            >
              Helping Ethiopian Sellers <br className="hidden md:block mt-[-2rem]" /> Build Real Businesses
            </h1>
            <p className="
              text-[#4F4F4F]
              font-light
              text-lg
              sm:text-xl
              md:text-1xl
              lg:text-2xl
              mb-6 md:mb-10
              max-w-xl
              mx-auto lg:mx-0
              leading-relaxed
            ">
              Everyday Ethiopian is being built to make selling easier by handling
              online selling, delivery, and payments in one simple place.
            </p>
            <button className="
              bg-[#0f5f5c] hover:bg-[#0c4c49] transition text-white
              px-6 py-2.5
              sm:px-8 sm:py-3
              md:px-40 md:py-5
              rounded-full
              text-sm
              sm:text-base
              md:text-lg
              font-medium
              shadow-lg
              w-full
              sm:w-auto
            ">
              Join as an Early Seller →
            </button>
          </div>
          {/* RIGHT SIDE – fixed structure */}
          <div className="relative w-full max-w-[500px] sm:max-w-[560px] mx-auto">
            <div className="lg:hidden relative h-[480px] xs:h-[520px] sm:h-[580px] w-full">
              {/* Payment Received – top-left */}
              <div className="absolute top-10 left-2 xs:left-2 w-40 xs:w-44 bg-white rounded-xl shadow-lg p-3 z-20">
                <div className="text-gray-500 text-xs">Payment Received</div>
                <div className="text-[#1C1917] font-bold text-base mt-0.5">2,500 ETB</div>
              </div>
              {/* Seller badge – top-right */}
              <div className="absolute top-20 right-4 xs:right-6 bg-white px-3 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 z-20">
                <img
                  src={seller1}
                  alt="Seller"
                  className="w-8 h-8 rounded-full object-cover border border-gray-100"
                />
                <div className="text-xs leading-tight">
                  <div className="font-medium text-gray-800">Hanna D.</div>
                  <div className="text-gray-500">Seller since 2025</div>
                </div>
              </div>
              {/* Mascot – centered, dominant */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[14rem] xs:w-[16rem] sm:w-[18rem] z-10">
                <img
                  src={mascot}
                  alt="Mascot"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>
              {/* Product Card – bottom-center */}
              <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 w-52 xs:w-60 bg-white rounded-xl shadow-xl p-3.5 z-20">
                <img
                  src={product}
                  alt="Product"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="text-gray-800 font-medium text-sm">Product Name</div>
                <div className="text-[#1C1917] font-bold text-base mt-1">2,500 ETB</div>
              </div>
              {/* Order Delivered – bottom-right, slightly higher */}
              <div className="absolute bottom-[5rem] right-4 xs:right-6 w-40 xs:w-44 bg-white rounded-xl shadow-lg p-3 z-20">
                <div className="text-gray-500 text-xs">Order #1234</div>
                <div className="text-[#1C1917] font-bold text-sm mt-0.5">Delivered</div>
              </div>
            </div>
            {/* ────────────────────────────────────────
                DESKTOP VERSION (lg and up)
            ──────────────────────────────────────── */}
            <div className="hidden lg:block relative h-[520px] w-full">
              {/* Product Card – top left */}
              <div className="absolute top-6 left-8 w-56 bg-white rounded-2xl shadow-xl p-4 hover:scale-105 transition float-fast">
                <img
                  src={product}
                  alt="Product"
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <div className="text-gray-800 font-medium text-sm">Product Name</div>
                <div className="text-[#1C1917] font-bold text-sm mt-0.5">2,500 ETB</div>
              </div>
              {/* Seller badge – top right */}
              <div className="absolute top-2 right-6 bg-white px-3 py-2 rounded shadow-md flex items-center gap-2 float">
                <img
                  src={seller1}
                  alt="Seller"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-xs leading-tight">
                  <div className="font-medium text-gray-800">Hanna D.</div>
                  <div className="text-[#1C1917] text-xs">Seller since 2025</div>
                </div>
              </div>
              {/* Mascot – center */}
              <div className="absolute top-[16rem] left-3/4 -translate-x-1/2 -translate-y-1/2 z-10 w-[18rem] float-slow">
                <img
                  src={mascot}
                  alt="Mascot"
                  className="w-full h-auto object-contain drop-shadow-xl"
                />
              </div>
              {/* Payment card – left bottom */}
              <div className="absolute top-[62%] left-16 w-52 bg-white rounded-2xl shadow-xl p-4 hover:scale-105 transition float">
                <div className="text-gray-400 text-xs">Payment Received</div>
                <div className="text-[#1C1917] font-bold text-sm">2,500 ETB</div>
              </div>
              {/* Order delivered – bottom right */}
              <div className="absolute bottom-6 right-10 w-52 bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between hover:scale-105 transition float-fast">
                <div>
                  <div className="text-gray-400 text-xs">Order #1234</div>
                  <div className="text-[#1C1917] font-bold text-sm mt-0.5">Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16 text-center">
          <h2
            style={{ fontFamily: 'Quesha' }}
            className="text-5xl sm:text-6xl md:text-8xl text-[#163533] mb-4 md:mb-6"
          >
            Who We Are
          </h2>
          <p className="
            text-gray-500
            font-light
            text-lg
            sm:text-xl
            md:text-1xl
            lg:text-2xl
            leading-relaxed
            max-w-3xl
            mx-auto
            px-4
          ">
            Everyday Ethiopian is being built for people who sell every day in
            Ethiopia — small businesses, growing brands, and sellers who want an
            easier way to reach customers.
          </p>
        </section>
        {/* ================= WHY ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="hidden md:block">
              <CommunityCircle />
            </div>
            <div className="md:hidden">
              <CommunityCircle isMobile={true} />
            </div>
          </div>
          {/* RIGHT: Text */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2
              style={{ fontFamily: 'Quesha' }}
              className="text-6xl sm:text-7xl md:text-6xl text-[#163533]"
            >
              Why We're Building This
            </h2>
            <p className="
              text-gray-500
              font-light
              text-lg
              sm:text-xl
              md:text-1xl
              lg:text-2xl
              leading-relaxed
            ">
              Selling in Ethiopia is hard. Sellers juggle promotion, delivery,
              payments, and customers on their own.
              <br /><br className="hidden md:block" />
              We're building Everyday Ethiopian to bring all of this into one
              simple system, so sellers can focus on their products — not the stress.
            </p>
          </div>
        </section>
        {/* ================= FEATURES ================= */}
        <section className="max-w-7xl mx-auto px-5 sm:px-7 md:px-8 py-12 md:py-24 bg-gray-100">
          <h2
            style={{ fontFamily: 'Quesha' }}
            className="text-5xl sm:text-6xl md:text-7xl text-[#163533] text-center mb-12 md:mb-20"
          >
            Here's How We're Different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 px-2 sm:px-0">
            {[
              {
                title: "More Than a Marketplace",
                desc: "We don't just list products. We help sellers run their whole business."
              },
              {
                title: "We Handle the Hard Parts",
                desc: "From delivery to payments, we take care of what slows sellers down."
              },
              {
                title: "Built for Ethiopian Sellers",
                desc: "Designed around local realities, not copied from elsewhere."
              },
              {
                title: "Growing With You",
                desc: "We're building step by step, listening to sellers as we grow."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition flex flex-col items-center sm:items-start"
              >
                {/* Icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFEDB2] rounded-full flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
                  {index === 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-[#CC9A00]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-[#CC9A00]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9.5 9.5 0 01-9.5 9.5c-1.39 0-2.73-.3-3.95-.86l-4.55 1.36 1.36-4.55a9.45 9.45 0 01-.86-3.95A9.5 9.5 0 0121 12z" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-[#CC9A00]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-[#CC9A00]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
                {/* Card title */}
                <h3
                  style={{ fontFamily: 'Quesha' }}
                  className="
                    text-3xl
                    sm:text-4xl
                    md:text-3xl
                    lg:text-3xl
                    text-[#163533]
                  
                    text-center
                    sm:text-left
                    w-full
                  "
                >
                  {item.title}
                </h3>
                {/* Description */}
                <p className="
                  text-gray-500
                  font-light
                  text-lg
                  sm:text-xl
                  leading-relaxed
                  text-center sm:text-left
                  w-full
                ">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
        {/* ================= JOIN COMMUNITY ================= */}
          <div className="relative flex items-center justify-center py-8 md:py-16">
          <div ref={containerRef} className="relative w-full aspect-square max-w-[840px] mx-auto flex items-center justify-center">
            {/* Orbiting sellers */}
            {containerSize > 0 && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              >
                {positions.map((pos, index) => (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
                    }}
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                      style={{
                        width: `${avatarSize}px`,
                        height: `${avatarSize}px`,
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                          src={sellers[index]}
                          alt={`Seller ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            )}
            {/* Center CTA */}
    <div className="absolute z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8">
  <h3
    style={{ fontFamily: 'Quesha' }}
    className="
      text-xl leading-snug
      xs:text-3xl xs:leading-tight
      sm:text-4xl sm:leading-tight
      md:text-5xl md:leading-snug
      lg:text-7xl
      font-medium
      mb-3 xs:mb-4 sm:mb-6 md:mb-8 lg:mb-10
      text-gray-900
      max-w-[280px] xs:max-w-[320px] sm:max-w-none
    "
  >
    Join us as an Early <br /> Business Builder
  </h3>
  <button
    onClick={() => {
      const el = document.getElementById("waitlist");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    }}
   
    className="
    bg-[#0f766e] hover:bg-[#115e59] text-white
    px-8 py-1 text-xs
    sm:px-10 sm:py-4.5 sm:text-base
    md:px-10 md:py-4 md:text-lg
    lg:px-12 lg:py-5 lg:text-xl
    rounded-full
    font-light transition-all duration-300
    shadow hover:shadow-lg
    w-auto
    min-w-[120px] sm:min-w-[260px] md:min-w-[320px]
    transform hover:scale-[1.02] active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-opacity-50
  "
>
  Join the Waitlist
</button>
</div>
          </div>
        </div>
    
        <Footer />
      </div>
    </>
  );
};

export default Aboutus;