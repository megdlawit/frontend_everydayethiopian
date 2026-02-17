import React from "react";
import styles from "../../styles/styles";
import { backend_url } from "../../server";

const DropDown = ({ categoriesData, setDropDown, handleCategories }) => {
  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/placeholder-image.jpg";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  return (
    <div className="pb-4 w-[270px] bg-[#fff] absolute z-30 rounded-b-md shadow-sm">
      {categoriesData &&
        categoriesData.map((category, index) => (
          <div
            key={index}
            className={`${styles.noramlFlex} hover:bg-[#f0f0f0] transition duration-300`}
            onClick={() => handleCategories(category._id)}
          >
            <img
              src={getImageUrl(category.image_Url)}
              style={{
                width: "25px",
                height: "25px",
                objectFit: "contain",
                marginLeft: "10px",
                userSelect: "none",
              }}
              alt={category.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />
            <h3 className="m-3 cursor-pointer select-none">{category.title}</h3>
          </div>
        ))}
    </div>
  );
};

export default DropDown;