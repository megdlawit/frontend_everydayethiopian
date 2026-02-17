import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../../../Assests/images/bg.png';
import { backend_url } from '../../../../server';

const HeroContent = ({ shop, onNav }) => {
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return backgroundImage;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  const heroBg = getImageUrl(shop?.heroImage?.url);

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 md:px-8"
        style={{ fontFamily: "'Quesha', sans-serif" }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl leading-tight text-white max-w-4xl mx-auto mt-12 lg:mt-[6rem]">
          {shop?.heroTagline || (
            <>
              Crafting Your Dream<br />Space, Inside And Out
            </>
          )}
        </h1>
        <p
          className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-white font-light max-w-md sm:max-w-lg md:max-w-xl mx-auto"
          style={{ fontFamily: "'Avenier ST LTD', sans-serif" }}
        >
          {shop?.heroDescription ||
            'Transforming interiors with personalized design, turning your vision into a reality both indoors and outdoors.'}
        </p>
        <button
          className="mt-4 sm:mt-6 text-white px-5 py-2 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: '#FFC300',
            border: '2px solid #FFC300',
            fontFamily: "'Avenier ST LTD', sans-serif",
            minHeight: '44px',
            minWidth: '120px',
          }}
          onClick={() => shop?._id && navigate(`/shop/${shop._id}/all-products`)}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroContent;