import React from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

import meg1 from "../Assests/images/meg1.jpg";
import meg2 from "../Assests/images/meg2.jpg";
import meg3 from "../Assests/images/meg3.png";

/* ================= ARTICLES DATA ================= */
const articles = {
  abeba: {
    title: "Every thread has \n a memory.",
    hero: meg2,
    images: [meg1, meg2, meg3],
    date: { day: "22", month: "April" },

    introLabel: "Everyday Ethiopia",
    mainQuote:
      "Everyday Ethiopia is more than ecommerce — it is a bridge between artisans, culture, and modern living.",
    
    paragraph1:
      "Everyday Ethiopia was created to celebrate the richness of Ethiopian craftsmanship. From hand-woven textiles to carefully curated lifestyle pieces, each product carries history, skill, and pride. Our marketplace connects local makers with a global audience while preserving authenticity.",

    paragraph2:
      "Through digital commerce, we empower small businesses, women-led workshops, and independent creators to reach customers beyond borders. Every purchase directly supports families, communities, and sustainable production practices rooted in Ethiopian tradition.",

    secondTitle: "Tradition meets modern ecommerce",

    paragraph3:
      "Our platform blends timeless heritage with modern convenience. Customers can explore curated collections, discover artisan stories, and shop confidently with secure and seamless online experiences.",

    secondQuote:
      "When you shop Everyday Ethiopia, you are not just buying a product — you are preserving culture and creating opportunity.",
  },
  dawit: {
    title: "Every thread has \n a memory.",
    hero: meg3,
    images: [meg1, meg2, meg3],
    date: { day: "22", month: "April" },

    introLabel: "Everyday Ethiopia",
    mainQuote:
      "Everyday Ethiopia is more than ecommerce — it is a bridge between artisans, culture, and modern living.",
    
    paragraph1:
      "Everyday Ethiopia was created to celebrate the richness of Ethiopian craftsmanship. From hand-woven textiles to carefully curated lifestyle pieces, each product carries history, skill, and pride. Our marketplace connects local makers with a global audience while preserving authenticity.",

    paragraph2:
      "Through digital commerce, we empower small businesses, women-led workshops, and independent creators to reach customers beyond borders. Every purchase directly supports families, communities, and sustainable production practices rooted in Ethiopian tradition.",

    secondTitle: "Tradition meets modern ecommerce",

    paragraph3:
      "Our platform blends timeless heritage with modern convenience. Customers can explore curated collections, discover artisan stories, and shop confidently with secure and seamless online experiences.",

    secondQuote:
      "When you shop Everyday Ethiopia, you are not just buying a product — you are preserving culture and creating opportunity.",
  },
  hana: {
    title: "Every thread has \n a memory.",
    hero: meg3,
    images: [meg1, meg2, meg3],
    date: { day: "22", month: "April" },

    introLabel: "Everyday Ethiopia",
    mainQuote:
      "Everyday Ethiopia is more than ecommerce — it is a bridge between artisans, culture, and modern living.",
    
    paragraph1:
      "Everyday Ethiopia was created to celebrate the richness of Ethiopian craftsmanship. From hand-woven textiles to carefully curated lifestyle pieces, each product carries history, skill, and pride. Our marketplace connects local makers with a global audience while preserving authenticity.",

    paragraph2:
      "Through digital commerce, we empower small businesses, women-led workshops, and independent creators to reach customers beyond borders. Every purchase directly supports families, communities, and sustainable production practices rooted in Ethiopian tradition.",

    secondTitle: "Tradition meets modern ecommerce",

    paragraph3:
      "Our platform blends timeless heritage with modern convenience. Customers can explore curated collections, discover artisan stories, and shop confidently with secure and seamless online experiences.",

    secondQuote:
      "When you shop Everyday Ethiopia, you are not just buying a product — you are preserving culture and creating opportunity.",
  },
};


const MagazineArticle = () => {
  const { slug } = useParams();
  const article = articles[slug];
  if (!article) return null;

  return (
    <div style={{ backgroundColor: "#F4F1EB", overflowX: "hidden" }}>
      <Header />

      {/* ================= INLINE GLOBAL STYLES ================= */}
      <style>{`
        /* hide scrollbar */
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }

        @keyframes horizontalScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* Responsive breakpoints */
        @media (max-width: 1024px) {
          .article-grid {
            grid-template-columns: 120px 1fr !important;
            gap: 40px !important;
          }
          
          .scroll-strip-wrapper {
            margin-left: 32px !important;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: clamp(2.5rem, 8vw, 4rem) !important;
          }

          .article-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 60px 20px !important;
          }

          .article-aside {
            display: flex !important;
            align-items: baseline !important;
            gap: 16px !important;
            margin-bottom: 20px !important;
          }

          .article-aside .day {
            font-size: 2rem !important;
          }

          .article-aside .month {
            margin-top: 0 !important;
          }

          .scroll-strip-wrapper {
            margin-left: 20px !important;
          }

          .scroll-strip {
            gap: 16px !important; /* Reduced from 24px */
          }

          .scroll-strip-image {
            width: 280px !important;
            height: 200px !important;
          }

          .second-text-block {
            padding: 60px 20px !important;
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }

          .hero-section {
            height: 60vh !important;
          }
          
          .desktop-only {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: clamp(2rem, 10vw, 2.5rem) !important;
            max-width: 280px !important;
          }

          .hero-section {
            height: 50vh !important;
          }

          .hero-padding {
            padding: 0 20px !important;
          }

          .scroll-strip {
            gap: 12px !important; /* Reduced from 16px */
          }

          .scroll-strip-image {
            width: 200px !important;
            height: 140px !important;
          }
          
          .article-grid {
            padding: 40px 16px !important;
          }
          
          .second-text-block {
            padding: 40px 16px !important;
          }
          
          blockquote {
            padding-left: 16px !important;
          }
        }
        
        /* Fix for very small devices */
        @media (max-width: 360px) {
          .scroll-strip-image {
            width: 160px !important;
            height: 120px !important;
          }
          
          .scroll-strip {
            gap: 8px !important; /* Reduced from 12px */
          }
        }
        
        /* Desktop scroll strip gap reduced */
        @media (min-width: 1025px) {
          .scroll-strip {
            gap: 32px !important; /* Reduced from 64px */
          }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section 
        className="hero-section"
        style={{ 
          position: "relative", 
          width: "100%", 
          height: "90vh",
          minHeight: "400px"
        }}
      >
        <img
          src={article.hero}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />

        <div
          className="hero-padding"
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1
            className="hero-title"
            style={{
              fontFamily: "Quesha, serif",
              color: "#fff",
              fontSize: "clamp(3.5rem, 6.5vw, 6.6rem)",
              lineHeight: 1,
              whiteSpace: "pre-line",
              maxWidth: "520px",
            }}
          >
            {article.title}
          </h1>
        </div>
      </section>

      {/* ================= ARTICLE BODY ================= */}
      <section
        className="article-grid"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "140px 32px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "80px",
        }}
      >
        {/* DATE */}
        <aside className="article-aside">
          <div className="day" style={{ fontSize: "3rem", fontWeight: 300 }}>
            {article.date.day}
          </div>
          <div
            className="month"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginTop: "8px",
              color: "#777",
            }}
          >
            {article.date.month}
          </div>
        </aside>

        {/* CONTENT */}
        <article style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
 <p
  style={{
    fontSize: "0.75rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#777",
  }}
>
  {article.introLabel}
</p>



          <blockquote
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              lineHeight: 1.6,
              fontWeight: 300,
              color: "#222",
              maxWidth: "100%",
            }}
          >
          {article.mainQuote}

          </blockquote>

          <p style={{ 
            maxWidth: "520px", 
            color: "#666", 
            lineHeight: 1.7,
            fontSize: "clamp(0.9rem, 2vw, 1rem)"
          }}>
            {article.paragraph1}

          </p>
        </article>
      </section>

      {/* ================= AUTO SCROLL IMAGE STRIP ================= */}
      <section style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        <div
          className="scroll-strip-wrapper"
          style={{
            marginLeft: "calc((100vw - 1200px) / 2 )",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            className="scroll-strip"
            style={{
              display: "flex",
              gap: "32px", /* Reduced from 64px */
              width: "max-content",
              animation: "horizontalScroll 40s linear infinite",
            }}
          >
            {[...article.images, ...article.images, ...article.images].map((img, i) => (
              <div
                key={i}
                className="scroll-strip-image"
                style={{
                  width: "720px",
                  height: "480px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={img}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECOND TEXT BLOCK ================= */}
      <section
        className="second-text-block"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "140px 32px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "80px",
        }}
      >
        <div className="desktop-only" style={{ 
          display: "block"
        }} />

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "clamp(24px, 4vw, 40px)" 
        }}>
          <h2 style={{ 
            fontSize: "clamp(1.5rem, 4vw, 2rem)", 
            fontWeight: 300,
            maxWidth: "100%"
          }}>
           {article.secondTitle}
          </h2>

          <p style={{ 
            maxWidth: "520px", 
            lineHeight: 1.7, 
            color: "#666",
            fontSize: "clamp(0.9rem, 2vw, 1rem)"
          }}>
            {article.paragraph3}
          </p>

          <blockquote
            style={{
              borderLeft: "2px solid #ccc",
              paddingLeft: "24px",
              fontStyle: "italic",
              maxWidth: "520px",
              color: "#666",
              fontSize: "clamp(0.9rem, 2vw, 1rem)"
            }}
          >
         {article.secondQuote}
          </blockquote>

          <div style={{ borderTop: "1px solid #ddd", paddingTop: "40px" }}>
            <Link
              to="/"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#666",
                textDecoration: "none",
                display: "inline-block",
                padding: "10px 0",
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MagazineArticle;