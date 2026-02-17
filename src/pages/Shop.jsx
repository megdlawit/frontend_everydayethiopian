import React from "react";
import Header2 from "../components/Layout/Header2";
import Hero from "../components/Route/Hero/Hero";
import Categories from "../components/Route/Categories/Categories";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Events from "../components/Events/Events";
import Sponsored from "../components/Route/Sponsored";
import Footer from "../components/Layout/Footer";
import SliderComponent from "../components/Layout/SellerAdvertisment";
import Description from "../components/Layout/Description";
import FAQPageW from "./FAQPageW";
import PeacockShopL from "../components/Route/PeacockShopL/PeacockShopL";
import ShopAdd from "../components/Route/ShopAdd/ShopAdd";
import { useSelector } from "react-redux";
import VideoProductShow from "../components/Shop/VideoProductShow";
import Chatbot from "../components/Chatbot/Chatbot"; // Import Chatbot

const Shop = () => {
  const { isAuthenticated } = useSelector((state) => state.user);

  return (
    <div>
      <Header2 activeHeading={1} />
      <Hero />
      <Categories />
      <VideoProductShow />
      <Events />
      <FeaturedProduct />
      <BestDeals />
      {isAuthenticated ? (
        <ShopAdd />
      ) : (
        <>
          <FAQPageW />
          <PeacockShopL />
        </>
      )}
      <Footer />
      <Chatbot /> 
    </div>
  );
};

export default Shop;