import React from 'react';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from '../../styles/styles';
import EventCard from './EventCard';


const NextArrow = ({ onClick }) => (
  <div
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer  text-yellow-400 p-2 rounded-full hover:bg-gray-900 transition-all duration-300"
    onClick={onClick}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-yellow-400 p-2 rounded-full hover:bg-gray-900 transition-all duration-300"
    onClick={onClick}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  </div>
);

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);
  const activeEvents = (allEvents || []).filter((e) => new Date(e.Finish_Date) > new Date() && e.name !== "Welcome Event");

  const sliderSettings = {
    dots: true,
    infinite: activeEvents && activeEvents.length > 1, // Infinite loop only if multiple events
    speed: 500, // Transition speed in milliseconds
    cssEase: 'ease-in-out', // Smooth transition effect
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: activeEvents && activeEvents.length > 1, // Autoplay only if multiple events
    autoplaySpeed: 3000, // Change slide every 3 seconds
    pauseOnHover: true, // Pause on hover for better UX
    pauseOnDotsHover: true, // Pause when hovering over dots
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false, // Hide arrows on small screens
          dots: true,
        },
      },
    ],
  };

  return (
    <div>
      {isLoading ? (
        <div className="w-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      ) : (
        <div className={`${styles.section}`}>
          <div className={`${styles.heading}`}>
            {/* <h1>Popular Events</h1> */}
          </div>

          <div className="w-full">
            {activeEvents && activeEvents.length !== 0 ? (
              <Slider {...sliderSettings}>
                {activeEvents.map((event, index) => (
                  <div key={event._id || index} className="px-2">
                    <EventCard data={event} />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-500 rounded-xl shadow-2xl text-gray-800 transform hover:scale-105 transition-transform duration-300">             
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;