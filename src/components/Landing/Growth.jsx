import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const bars = [
  { title: "Free Training", height: 140 },
  { title: "Access to loans", height: 200 },
  { title: "Market Research", height: 260 },
  { title: "Connect with other sellers", height: 320 },
];

const Growth = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="bg-[#0b1a1c] text-white py-20 px-6 md:px-20 font-sans overflow-hidden">
      {/* --- Title --- */}
      <h2 className="text-left text-3xl md:text-5xl mb-20 tracking-wide text-[#d9ede1] font-['Quesha'] font-light">
        We stand beside you as you grow
      </h2>

      {/* --- Bars Container --- */}
      <div className="flex flex-col sm:flex-row justify-between items-end max-w-5xl mx-auto gap-6">
        {bars.map((bar, index) => (
          <motion.div
            key={index}
            className="flex justify-center items-center text-center w-full sm:w-auto sm:flex-1 min-w-0 rounded-lg shadow-md border-2"
            style={{
              background: "linear-gradient(to top, #418990, #214649ff)",
              height: `${isMobile ? 200 : bar.height}px`,
              borderColor: "#0358557a",
            }}
            initial={{ scaleY: 0, opacity: 0, originY: 1 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              delay: index * 0.2,
              ease: "easeOut",
            }}
          >
            <p className="text-base sm:text-lg md:text-xl font-semibold text-white px-3 text-center">
              {bar.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Growth;