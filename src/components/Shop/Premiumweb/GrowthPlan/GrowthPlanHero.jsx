import React, { useEffect, useState } from 'react';
import img from "../../../../Assests/images/bg.png";
import HeroHeader from './HeroHeader';
import HeroContent from './HeroContent';
import api from "../../../../utils/api";
import { server, backend_url } from "../../../../server";

const GrowthPlanHero = ({ shop, onNav }) => {
  const [thumbnails, setThumbnails] = useState([]);
  const [scrollSpeed, setScrollSpeed] = useState(40); // seconds

  // Adjust scroll speed based on screen size
  useEffect(() => {
    const updateScrollSpeed = () => {
      if (window.innerWidth < 768) {
        setScrollSpeed(60); // Slower on mobile for better visibility
      } else if (window.innerWidth < 1024) {
        setScrollSpeed(50); // Medium speed on tablet
      } else {
        setScrollSpeed(40); // Original speed on desktop
      }
    };

    updateScrollSpeed();
    window.addEventListener('resize', updateScrollSpeed);
    return () => window.removeEventListener('resize', updateScrollSpeed);
  }, []);

  // Fetch product thumbnails for this shop
  useEffect(() => {
    if (shop && shop._id) {
      axios
        .get(`${server}/shop/${shop._id}/product-thumbnails`)
        .then((res) => {
          setThumbnails(res.data.thumbnails.map(t =>
            (t.url || t).startsWith('http') ? (t.url || t) : `${backend_url}${t.url || t}`
          ));
        })
        .catch(() => setThumbnails([]));
    }
  }, [shop]);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${img})` }}
    >
      {/* Top background color bar */}
      <div className="w-full h-16 absolute top-0 left-0 z-30" />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <HeroHeader shop={shop} onNav={onNav} />
      
      {/* 🔁 Full-width Infinite Scrolling Gallery - Responsive */}
      <div className="absolute top-0 left-0 w-full overflow-hidden z-50 ">
        {/* Mobile & Tablet: Hidden or smaller size */}
        <div className="md:hidden mt-[10rem]">
          <div
            className="flex gap-3 md:gap-4"
            style={{
              width: 'max-content',
              animation: `scrollHorizontalMobile ${scrollSpeed}s linear infinite`,
            }}
          >
            {(() => {
              const repeatCount = Math.max(4, Math.ceil(12 / (thumbnails.length || 1)));
              const looped = [];
              for (let i = 0; i < repeatCount; i++) {
                looped.push(...thumbnails);
              }
              return looped.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`product-thumb-${index + 1}`}
                  className="rounded-lg shadow-md"
                  style={{
                    width: '120px',
                    height: '150px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ));
            })()}
          </div>
        </div>

        {/* Desktop: Original size and position */}
        <div className="hidden md:block">
          <div
            className="flex gap-4"
            style={{
              width: 'max-content',
              animation: `scrollHorizontal ${scrollSpeed}s linear infinite`,
            }}
          >
            {(() => {
              const repeatCount = Math.max(4, Math.ceil(12 / (thumbnails.length || 1)));
              const looped = [];
              for (let i = 0; i < repeatCount; i++) {
                looped.push(...thumbnails);
              }
              return looped.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`product-thumb-${index + 1}`}
                  className="rounded-lg shadow-lg"
                  style={{
                    width: '250px',
                    height: '300px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Hero Content - Ensure it's not covered by scrolling gallery on mobile */}
      <div className="relative z-40 h-full flex items-center">
        <HeroContent shop={shop} />
      </div>

      {/* Inline keyframe CSS */}
      <style>{`
        @keyframes scrollHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scrollHorizontalMobile {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Responsive positioning */
        @media (max-width: 767px) {
          .absolute.top-0 {
            top: 20rem !important; /* Position below hero content on mobile */
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .absolute.top-0 {
            top: 25rem !important; /* Adjust for tablet */
          }
          
          .hidden.md\\:block {
            display: none !important;
          }
          
          .md\\:hidden {
            display: block !important;
          }
          
          .md\\:hidden > div {
            animation: scrollHorizontalMobile ${scrollSpeed}s linear infinite !important;
          }
        }

        @media (min-width: 1024px) {
          .absolute.top-0 {
            top: 35rem !important; /* Original desktop position */
          }
          
          .md\\:hidden {
            display: none !important;
          }
          
          .hidden.md\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GrowthPlanHero;