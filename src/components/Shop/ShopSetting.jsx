import React, { useEffect, useState } from "react";
import axios from "axios";
import { server, backend_url } from "../../server";
import styles from "../../styles/styles";
import { useParams } from "react-router-dom";

const ShopSetting = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/uploads/placeholder-image.jpg";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setData(res.data.shop);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [id]);

  const handleImageError = (e) => {
    e.target.src = "/uploads/placeholder-image.jpg"; // Provide a default fallback image
  };

  return (
    <div className="w-full mt-0">
      <div className="w-full bg-white shadow-md flex items-center justify-between px-8 py-4 border-b mt-0">
        {/* Logo & Name */}
        <div className="flex items-center gap-6">
          <img
            src={getImageUrl(data.avatar?.url)}
            alt="Shop Logo"
            className="w-[80px] h-[80px] rounded-full object-cover border-2 border-gray-300"
            onError={handleImageError}
          />
          <h3 className="text-[24px] font-bold">{data.name}</h3>
        </div>
      </div>

      {/* Additional settings and content can be added here */}
    </div>
  );
};

export default ShopSetting;