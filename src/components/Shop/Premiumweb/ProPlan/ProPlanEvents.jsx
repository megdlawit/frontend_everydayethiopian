import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../../../redux/actions/cart";
import { toast } from "react-toastify";
import CountDown from "../../../Events/CountDown";
import Toast from "../../../Toast";
import { backend_url } from "../../../../server";

const ProPlanEvents = ({ events = [] }) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const mainEvent = events[0] || null;
  const tallEvent = events[1] || mainEvent;
  const lightEvent = events[2] || mainEvent;

  const getImageUrl = (image) => {
    if (image?.url) {
      return image.url.startsWith("http")
        ? image.url
        : `${backend_url}${image.url}`;
    }
    return "/Uploads/placeholder-image.jpg";
  };

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false,
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  const handleAddToCart = (event) => {
    const exists = cart?.find((i) => i._id === event._id);
    if (exists) {
      showToast("error", "Error toast message", "Item already in cart!");
    } else if (event.stock < 1) {
      showToast("error", "Error toast message", "Product stock limited!");
    } else {
      dispatch(addTocart({ ...event, qty: 1 }));
      showToast("success", "Success toast message", "Item added to cart successfully!");
    }
  };

  const EventCard = ({ event, textColor, tall = false }) => (
    <div
      className={`relative rounded-2xl shadow-lg flex flex-col justify-end overflow-hidden p-0 ${tall ? 'h-full' : ''}`}
      style={{
        backgroundImage: `url(${getImageUrl(event?.images?.[0])})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: tall ? '520px' : '250px',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />
      <div className="relative z-10 p-4 sm:p-5 md:p-6 w-full">
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-1 sm:mb-2 leading-tight" style={{ fontFamily: 'Quesha' }}>
          {event?.name || "Event Name"}
        </h2>
        <p className="text-gray-200 text-xs sm:text-sm md:text-sm mb-3 sm:mb-4 line-clamp-2 sm:truncate">
          {event?.description || "No description available."}
        </p>
        <button
          onClick={() => handleAddToCart(event)}
          className={`text-white border border-white px-4 sm:px-5 py-1 sm:py-1.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-white hover:text-black transition duration-200 w-fit`}
        >
          GET NOW
        </button>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      {/* Desktop Layout (unchanged) */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
        <div className="col-span-2 row-span-1">
          {mainEvent ? <EventCard event={mainEvent} textColor="text-green-400" /> : <p>No main event available.</p>}
        </div>
        <div className="col-span-1 row-span-2">
          {tallEvent ? <EventCard event={tallEvent} textColor="text-blue-400" tall /> : <p>No tall event available.</p>}
        </div>
        <div className="col-span-1 row-start-2">
          {lightEvent ? <EventCard event={lightEvent} textColor="text-yellow-500" /> : <p>No light event available.</p>}
        </div>
        <div className="col-span-1 row-start-2 flex items-center justify-center">
          <div className="bg-[#1C3B3E] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center min-h-[250px] w-full">
            <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
              GET DISCOUNT
            </span>
            <span className="text-5xl text-white mb-2" style={{ fontFamily: 'Quesha' }}>
              30% Off
            </span>
            <p className="text-white text-base font-light mb-2">
              Limited Time Offer
            </p>
            <div className="text-white text-sm font-medium" style={{ fontSize: "1rem" }}>
              {mainEvent && mainEvent.Finish_Date ? (
                <CountDown data={mainEvent} />
              ) : (
                <span>No countdown available.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout (768px - 1023px) */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:hidden">
        <div className="md:col-span-2">
          {mainEvent ? <EventCard event={mainEvent} textColor="text-green-400" /> : <p>No main event available.</p>}
        </div>
        <div className="md:col-span-1">
          {tallEvent ? <EventCard event={tallEvent} textColor="text-blue-400" /> : <p>No tall event available.</p>}
        </div>
        <div className="md:col-span-1">
          {lightEvent ? <EventCard event={lightEvent} textColor="text-yellow-500" /> : <p>No light event available.</p>}
        </div>
        <div className="md:col-span-2 flex items-center justify-center">
          <div className="bg-[#1C3B3E] rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col items-center justify-center text-center min-h-[200px] w-full mt-4">
            <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3 sm:mb-4">
              GET DISCOUNT
            </span>
            <span className="text-4xl sm:text-5xl text-white mb-1 sm:mb-2" style={{ fontFamily: 'Quesha' }}>
              30% Off
            </span>
            <p className="text-white text-sm sm:text-base font-light mb-2">
              Limited Time Offer
            </p>
            <div className="text-white text-xs sm:text-sm font-medium">
              {mainEvent && mainEvent.Finish_Date ? (
                <CountDown data={mainEvent} />
              ) : (
                <span>No countdown available.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (below 768px) */}
      <div className="flex flex-col gap-4 md:hidden">
        <div>
          {mainEvent ? <EventCard event={mainEvent} textColor="text-green-400" /> : <p>No main event available.</p>}
        </div>
        <div>
          {tallEvent ? <EventCard event={tallEvent} textColor="text-blue-400" /> : <p>No tall event available.</p>}
        </div>
        <div>
          {lightEvent ? <EventCard event={lightEvent} textColor="text-yellow-500" /> : <p>No light event available.</p>}
        </div>
        <div className="flex items-center justify-center">
          <div className="bg-[#1C3B3E] rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center text-center min-h-[180px] w-full">
            <span className="bg-yellow-400 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3">
              GET DISCOUNT
            </span>
            <span className="text-3xl sm:text-4xl text-white mb-1" style={{ fontFamily: 'Quesha' }}>
              30% Off
            </span>
            <p className="text-white text-sm font-light mb-2">
              Limited Time Offer
            </p>
            <div className="text-white text-xs font-medium">
              {mainEvent && mainEvent.Finish_Date ? (
                <CountDown data={mainEvent} />
              ) : (
                <span>No countdown available.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <style>{`
        @font-face {
          font-family: 'Quesha';
          src: url('/fonts/Quesha.otf') format('opentype');
        }
        
        /* Line clamp utility for description text */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default ProPlanEvents;