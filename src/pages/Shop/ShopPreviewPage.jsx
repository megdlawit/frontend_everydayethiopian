import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import Header2 from "../../components/Layout/Header2";
import ScrollableProductCarousel from "../../pages/Shop/ScrollableProductCarousel";
import Footer from "../../components/Layout/Footer";

const ShopPreviewPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products"); // Adjust endpoint as needed
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {/* <Header2 /> */}
      <div className={`bg-gradient-to-b from-yellow-50 to-white min-h-screen`}>
        <div className="w-full">
          <div className=" gap-8">
            {/* Uncomment ShopInfo if needed */}
            {/* <div className="lg:w-[25%] bg-white rounded-lg shadow-md lg:sticky top-10 h-fit">
              <ShopInfo isOwner={false} />
            </div> */}
            <div className="w-full">
              
              <ShopProfileData isOwner={false} />
            </div>
          </div>
        </div>
      </div>
      {/* <ScrollableProductCarousel products={products} /> */}
      <Footer />
    </>
  );
};

export default ShopPreviewPage;