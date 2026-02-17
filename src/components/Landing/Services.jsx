import React, { useState, useEffect, useRef } from "react";
import "./Services.css";
import { FaPlus, FaLock, FaLockOpen, FaUsers, FaUniversity, FaShoppingCart, FaStore, FaCreditCard, FaGlobe, FaHandshake, FaChartLine, FaUserFriends, FaBuilding } from "react-icons/fa";

const Services = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const pathRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimate(true);
      },
      { threshold: 0.1 }
    );

    if (pathRef.current) observer.observe(pathRef.current);
    return () => {
      if (pathRef.current) observer.unobserve(pathRef.current);
    };
  }, []);

  const services = [
    {
      id: 1,
      title: "Create",
      description: "Easily build a stunning storefront to showcase your designs",
      icon: <FaPlus />,
      floatingIcons: [
        <FaStore />,
        <FaShoppingCart />,
        <FaGlobe />
      ]
    },
    {
      id: 2,
      title: "Unlock",
      description: "Expand your income by featuring your products in our marketplace",
      icon: isUnlocked ? <FaLockOpen /> : <FaLock />,
      floatingIcons: [
        <FaCreditCard />,
        <FaChartLine />,
        <FaStore />
      ]
    },
    {
      id: 3,
      title: "Connect",
      description: "Build lasting relationships with buyers worldwide",
      icon: <FaUsers />,
      floatingIcons: [
        <FaHandshake />,
        <FaUserFriends />,
        <FaGlobe />
      ]
    },
    {
      id: 4,
      title: "Access",
      description: "Fuel your business growth with tailored financing options",
      icon: <FaUniversity />,
      floatingIcons: [
        <FaBuilding />,
        <FaChartLine />,
        <FaCreditCard />
      ]
    },
  ];

  return (
    <section className="service-section">
      <div className="service-header">
        <h1>
          Design <span className="dot">·</span> Share <span className="dot">·</span> Thrive
        </h1>
        <p className="service-subtitle">
          Join a platform that empowers you to design your shop, share your culture, and thrive with buyers worldwide.
        </p>
        <button className="learn-more-btn">Learn More</button>
      </div>

      <div className="service-path">
        <div className="path-container" style={{ marginTop: "-15.5rem", marginLeft: "-5rem" }}>
          {/* Animated path with curved corners */}
          <svg width="1300" height="600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7"
                refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#d8b139" />
              </marker>
            </defs>

            {/* START DOT */}
            <circle cx="120" cy="500" r="6" fill="#d8b139" />

            {/* PATH */}
            <path
              ref={pathRef}
              className={animate ? "animate-path" : ""}
              d="
                M120,500
                H420
                Q430,500 430,470
                V400
                Q430,390 440,390
                H720
                Q730,390 730,360
                V280
                Q730,270 740,270
                H1020
                Q1030,270 1030,240
                V160
                Q1030,150 1040,150
                H1300
              "
              stroke="#d8b139"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>

        {/* Service cards */}
        <div className="cards-container">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className={`step-card step${index + 1}`}
              onMouseEnter={() => service.title === "Unlock" && setIsUnlocked(true)}
              onMouseLeave={() => service.title === "Unlock" && setIsUnlocked(false)}
            >
              <div className="icon-container">
                {service.icon}
                {service.floatingIcons.map((floatingIcon, i) => (
                  <div key={i} className={`floating-icon-wrapper floating-icon-${i + 1}`}>
                    {floatingIcon}
                  </div>
                ))}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;