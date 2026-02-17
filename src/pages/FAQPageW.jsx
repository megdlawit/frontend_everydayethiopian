import React, { useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import feather from "../Assests/images/feather.svg";
import white from "../Assests/images/White.png";

const faqData = [
  {
    question: "How easy is it to create my shop on the platform?",
    answer: "It's incredibly simple! With our drag-and-drop editor, you can design a custom shop reflecting your unique style in minutes—no coding needed. Just add your products, customize your layout, and go live to start selling.",
  },
  {
    question: "Do I need to handle delivery logistics myself?",
    answer: "No, our platform offers integrated shipping solutions. You can print labels, track shipments, and offer buyers real-time updates—all from your dashboard.",
  },
  {
    question: "How can I access funding to grow my business?",
    answer: "We offer flexible financing options tailored to your needs. Apply directly from your dashboard and get funds in days to invest in inventory, marketing, or anything else.",
  },
  {
    question: "How do I connect with buyers worldwide?",
    answer: "Our global marketplace and social integrations help you reach buyers in over 190 countries. Personalize your profile and start building lasting relationships.",
  },
  {
    question: "Are there any fees to get started?",
    answer: "No setup fees! You can launch your shop for free and only pay a small commission when you make a sale.",
  },
  {
    question: "Can I customize my shop to match my brand's style?",
    answer: "Absolutely! Choose from a variety of themes and use our editor to make your shop truly yours.",
  },
];

const FAQPageW = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* <Header activeHeading={5} /> */}
      <Faq />
      {/* <Footer /> */}
    </div>
  );
};

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (idx) => {
    if (activeIndex === idx) return;
    setLoading(true);
    setActiveIndex(idx);
    setTimeout(() => setLoading(false), 1000); // 1s loading
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "60px 1rem",
        color: "#563C3C",
        fontFamily: "'Avenir LT Std', Arial, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: 40,
          fontWeight: 200,
          marginBottom: 10,
          fontFamily: "'Quesha', serif",
        }}
      >
        Frequently Asked Questions
      </h2>
      <p style={{ color: "#563C3C", marginBottom: 40, fontSize: 17, maxWidth: "40rem" }}>
        Have questions? We’ve got answers to help you launch your shop and grow your business with ease.
      </p>

      <div 
        style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          gap: 24,
          flexDirection: window.innerWidth <= 768 ? "column" : "row"
        }}
        className="faq-container"
      >
        {/* Questions list */}
        <div 
          style={{ flex: 1 }} 
          className="faq-list"
        >
          {faqData.map((item, idx) => (
            <div key={idx} className="faq-item" style={{ marginBottom: 18 }}>
              <button
                onClick={() => handleClick(idx)}
                className={`faq-question ${activeIndex === idx ? "active" : ""}`}
                style={{
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  color: activeIndex === idx ? "#FFE180" : "#563C3C",
                  fontWeight: activeIndex === idx ? 700 : 200,
                  fontSize: 15,
                  cursor: "pointer",
                  padding: "8px 0",
                  borderBottom: activeIndex === idx ? "none" : "1px solid #563C3C",
                  fontFamily: "'Avenir LT Std', Arial, sans-serif",
                  transition: "color 0.2s",
                }}
              >
                {item.question}
                <span
                  style={{
                    float: "right",
                    fontWeight: 700,
                    fontSize: 22,
                    color: activeIndex === idx ? "#FFE180" : "#563C3C",
                    fontFamily: "'Avenir LT Std', Arial, sans-serif",
                  }}
                >
                  {activeIndex === idx ? "−" : "+"}
                </span>
              </button>

              {/* Mobile/Tablet: answer below question */}
              <div
                className={`faq-mobile-answer ${activeIndex === idx ? "show" : ""}`}
                style={{
                  display: window.innerWidth <= 768 ? "block" : "none",
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#FFEDB2",
                  borderRadius: "8px",
                  border: "1px solid #FFE180",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <img src={feather} alt="feather" style={{ width: "40px", height: "40px" }} />
                  <p style={{ margin: 0, color: "#1C3B3E", fontSize: "15px", textAlign: "center" }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: right side answer card */}
        <div 
          style={{ 
            minWidth: 320, 
            display: window.innerWidth <= 768 ? "none" : "flex", 
            flexDirection: "column", 
            alignItems: "center" 
          }} 
          className="faq-right"
        >
          <div className="faq-loader" style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}>
            <span
              className="faq-dot"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FFC300",
                display: "inline-block",
                animation: "faqDot 1s infinite",
              }}
            />
            <span
              className="faq-dot delay-1"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FFC300",
                display: "inline-block",
                animation: "faqDot 1s infinite 0.2s",
              }}
            />
            <span
              className="faq-dot delay-2"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FFC300",
                display: "inline-block",
                animation: "faqDot 1s infinite 0.4s",
              }}
            />
          </div>

          {!loading && activeIndex !== null && (
            <div className="faq-answer-card" style={{
              border: "1px solid #FFE180",
              borderRadius: 14,
              marginRight: "-7rem",
              marginTop: 60,
              animation: "faqRollDown 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
              padding: "12px",
            }}>
              <div
                className="faq-answer-content"
                style={{
                  backgroundImage: `url(${white})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "#FFEDB2",
                  border: "none",
                  borderRadius: 14,
                  padding: "24px 24px 24px 32px",
                  color: "#1C3B3E",
                  fontSize: 15,
                  fontFamily: "'Avenir LT Std', Arial, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 0,
                  maxWidth: 320,
                  width: "fit-content",
                  height: "100%",
                }}
              >
                <img
                  src={feather}
                  alt="feather"
                  style={{ width: 60, height: 60, marginBottom: "1rem", marginTop: 0 }}
                />
                <div
                  style={{
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 15px",
                    textAlign: "center",
                    fontFamily: "'Avenir LT Std', Arial, sans-serif",
                  }}
                >
                  {faqData[activeIndex].answer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes faqDot {
            0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
            40% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes faqRollDown {
            0% { opacity: 0; transform: translateY(-30px) scaleY(0.8); }
            100% { opacity: 1; transform: translateY(0) scaleY(1); }
          }
          @media (max-width: 768px) {
            .faq-container {
              flex-direction: column !important;
            }
            .faq-right {
              display: none !important;
            }
            .faq-mobile-answer {
              display: block !important;
              animation: faqMobileSlide 0.3s ease-out;
            }
            .faq-mobile-answer:not(.show) {
              display: none !important;
            }
            @keyframes faqMobileSlide {
              from { opacity: 0; max-height: 0; }
              to { opacity: 1; max-height: 200px; }
            }
            .faq-list {
              margin-left: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FAQPageW;