import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { server, backend_url } from "../../server";

const ScrollableProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/uploads/placeholder-image.jpg";
    return url.startsWith("http") ? url : `${backend_url}${url}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${server}/product/get-all-products`);
        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Infinite Scrolling Effect
  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth) {
          scrollRef.current.scrollLeft = 0; // Reset scroll to the start
        } else {
          scrollRef.current.scrollBy({ left: 1, behavior: "smooth" });
        }
      }
    };

    const interval = setInterval(scroll, 10); // Smooth & Continuous scrolling

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-hidden p-4 scrollbar-hide whitespace-nowrap"
      >
        {[...products, ...products].map((product, index) => (
          <div key={index} className="min-w-[220px] bg-white rounded-lg shadow-md relative group">
            {/* Product Image */}
            <img
              src={getImageUrl(product.images[0]?.url)}
              alt={product.name}
              className="w-full h-[200px] object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/uploads/placeholder-image.jpg"; // Fallback
              }}
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              <p className="text-white text-center font-semibold">{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollableProductCarousel;