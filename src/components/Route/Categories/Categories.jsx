import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../../redux/actions/category";
import { backend_url } from "../../../server";
import "./Categories.css";

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories = [], loading } = useSelector((state) => state.category);
  const [currentIndex, setCurrentIndex] = useState(2);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder-image.jpg";
    return imageUrl.startsWith('http') ? imageUrl : `${backend_url}${imageUrl}`;
  };

  const infiniteArray = [...categories, ...categories, ...categories];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const handleSubmit = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <section className="section-wrapper" style={{ marginTop: "-4rem" }}>
      <div className="gradient-box main-container">
        {/* Desktop Title */}
        <h2 className="seller-title hidden md:block" style={{ marginLeft: "-45rem" }}>
          Over <span style={{ color: "#CC9A00" }}>20+</span> categories
          <span className="title-second-line">to explore from</span>
        </h2>

        {/* Mobile Title */}
        <h2 className="seller-title-mobile md:hidden">
          Over <span style={{ color: "#CC9A00" }}>20+</span> categories
          <span className="title-second-line-mobile">to explore from</span>
        </h2>

        {/* Categories Display */}
        <div className="sellers-display">
          {loading ? (
            <p className="loading-text">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="loading-text">No categories available.</p>
          ) : (
            <div className="sellers-row">
              {infiniteArray.map((category, index) => {
                const normalizedIndex = index % categories.length;
                const isActive = normalizedIndex === currentIndex;
                const position = index - (currentIndex + categories.length);
                const transformValue = windowWidth < 768 ? position * 220 : position * 180;

                return (
                  <div
                    key={index}
                    className={`seller-circle ${isActive ? "active" : ""}`}
                    style={{
                      transform: `translateX(${transformValue}%)`,
                      opacity: Math.abs(position) <= 2 ? 1 : 0,
                      visibility: Math.abs(position) <= 2 ? "visible" : "hidden",
                    }}
                    onClick={() => handleSubmit(category._id)}
                  >
                    <img
                      src={getImageUrl(category.image_Url)}
                      alt={category.title || "Category Image"}
                      className="seller-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                );
              })}
              {categories.length > 0 && (
                <span className="category-title hidden md:block" style={{ color: "white", fontSize: "18px", marginBottom: "-10rem", fontWeight: "normal" }}>
                  {categories[currentIndex].title || ""}
                </span>
              )}
              {/* Mobile Category Title */}
              {categories.length > 0 && (
                <span className="category-title-mobile md:hidden">
                  {categories[currentIndex].title || ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;