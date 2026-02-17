import React, { useState } from "react";
import feather from "../Assests/images/feather.svg";
import white from "../Assests/images/White.png";
import "./FAQ.css";

const faqData = [
  {
    question: "How easy is it to create my shop on the platform?",
    answer:
      "It's incredibly simple! With our drag-and-drop editor, you can design a custom shop reflecting your unique style in minutes—no coding needed. Just add your products, customize your layout, and go live to start selling.",
  },
  {
    question: "Do I need to handle delivery logistics myself?",
    answer:
      "No, our platform offers integrated shipping solutions. You can print labels, track shipments, and offer buyers real-time updates—all from your dashboard.",
  },
  {
    question: "How can I access funding to grow my business?",
    answer:
      "We offer flexible financing options tailored to your needs. Apply directly from your dashboard and get funds in days to invest in inventory, marketing, or anything else.",
  },
  {
    question: "How do I connect with buyers worldwide?",
    answer:
      "Our global marketplace and social integrations help you reach buyers in over 190 countries. Personalize your profile and start building lasting relationships.",
  },
  {
    question: "Are there any fees to get started?",
    answer:
      "No setup fees! You can launch your shop for free and only pay a small commission when you make a sale.",
  },
  {
    question: "Can I customize my shop to match my brand's style?",
    answer:
      "Absolutely! Choose from a variety of themes and use our editor to make your shop truly yours.",
  },
];

const FAQ = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#030f10" }}>
      <Faq />
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
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "60px 1rem",
        color: "#fff",
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
      <p
        style={{
          color: "#d3d3d3",
          marginBottom: 40,
          fontSize: 17,
          maxWidth: "40rem",
        }}
      >
        Have questions? We’ve got answers to help you launch your shop and grow
        your business with ease.
      </p>

      <div className="faq-container">
        {/* Questions list */}
        <div className="faq-list">
          {faqData.map((item, idx) => (
            <div key={idx} className="faq-item">
              <button
                onClick={() => handleClick(idx)}
                className={`faq-question ${
                  activeIndex === idx ? "active" : ""
                }`}
              >
                {item.question}
                <span>{activeIndex === idx ? "−" : "+"}</span>
              </button>

              {/* Mobile/Tablet: answer below question */}
              <div
                className={`faq-mobile-answer ${
                  activeIndex === idx ? "show" : ""
                }`}
              >
                <div className="faq-answer-inner">
                  <img src={feather} alt="feather" style={{ display: 'block', margin: '0 auto' }} />
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: right side answer card */}
        <div className="faq-right">
          <div className="faq-loader">
            <span className="faq-dot" />
            <span className="faq-dot delay-1" />
            <span className="faq-dot delay-2" />
          </div>

          {!loading && activeIndex !== null && (
            <div className="faq-answer-card" style={{ marginTop: '0.5rem' }}>
              <div
                className="faq-answer-content"
                style={{ backgroundImage: `url(${white})` }}
              >
                <img src={feather} alt="feather" />
                <div>{faqData[activeIndex].answer}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;