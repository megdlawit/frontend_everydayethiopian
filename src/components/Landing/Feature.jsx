import React, { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Feature.css";
import openGif from "../../Assests/images/open.gif";
import img1 from "../../Assests/images/Rectangle31.png";
import img2 from "../../Assests/images/Rectangle32.png";
import img3 from "../../Assests/images/Rectangle33.png";
import img4 from "../../Assests/images/Rectangle34.png";

const Feature = () => {
  const contentArray = [
    {
      image: img1,
      quote:
        "“Setting up my shop was so easy I had a stunning storefront live in just hours!”",
      author: "Selam Desta",
      title: "Founder, Desta Designs",
      count: 150,
      label: "Shops Created",
    },
    {
      image: img2,
      quote:
        "“The shipping tools saved me time and money, delighting my customers!”",
      author: "John Smith",
      title: "Creator, Smith Creations",
      count: 202,
      label: "Products Delivered",
    },
    {
      image: img3,
      quote:
        "“The fast funding helped me scale my business without giving up equity!”",
      author: "Emma Brown",
      title: "Owner, Brown Boutique",
      count: 70,
      label: "100 Birr Events",
    },
    {
      image: img4,
      quote: "“Connecting with buyers globally has never been easier!”",
      author: "Liam Chen",
      title: "Founder, Chen Crafts",
      count: 5,
      label: "Training Sessions",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentContent = contentArray[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contentArray.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const { ref } = useInView({ triggerOnce: true });
  const motionValue = useMotionValue(
    currentContent.count - Math.floor(currentContent.count * 0.3)
  );
  const [displayCount, setDisplayCount] = useState(motionValue.get());

  useEffect(() => {
    const controls = animate(motionValue, currentContent.count, {
      duration: 1,
      onUpdate: (value) => setDisplayCount(Math.floor(value)),
    });
    return () => controls.stop();
  }, [currentIndex, currentContent.count]);

  return (
    <div className="feature-wrapper font-sans">
      {/* Left Section */}
      <div className="feature-left">
        <img
          src={currentContent.image}
          alt="Person working"
          className="feature-image"
        />
        <div className="feature-quote-card">
          <p className="quote">{currentContent.quote}</p>
          <p className="author">
            {currentContent.author}
            <br />
            {currentContent.title}
          </p>
        </div>
        <img src={openGif} alt="Open Button" className="open-gif" />
      </div>

      {/* Right Section */}
      <div ref={ref} className="feature-right">
        <motion.h1
          key={currentIndex}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="feature-count"
        >
          {displayCount}
        </motion.h1>

        <motion.p
          key={currentContent.label}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="feature-label"
        >
          {currentContent.label}
        </motion.p>
      </div>
    </div>
  );
};

export default Feature;
