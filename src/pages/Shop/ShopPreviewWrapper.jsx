import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { server } from "../../server";
import ShopPreviewPage from "./ShopPreviewPage"; // Basic version
import PremiumShopPreview from "./PremiumShopPreview"; // Premium version

const ShopPreviewWrapper = () => {
  const { id } = useParams();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await api.get(`${server}/shop/get-shop-info/${id}`);
        setShopData(response.data.shop);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Render PremiumShopPreview if isPremium is true, otherwise ShopPreviewPage
  return shopData?.isPremium ? <PremiumShopPreview shopData={shopData} /> : <ShopPreviewPage shopData={shopData} />;
};

export default ShopPreviewWrapper;