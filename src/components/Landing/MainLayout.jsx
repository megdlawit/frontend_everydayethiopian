import React from "react";
import Header from "../Layout/Header";
import HeroSection from "./HeroSection";
import TopSellersSection from "./TopSellersSection"; // Import the new section
import Feature from "./Feature";
import FeatureSecond from "./FeatureSecond";
import MagazineSnippet from "./MagazineSnippet";
import FeatureThird from "./FeatureThird";
import Growth from "./Growth";
import Services from "./Services";
import Review from "./Review";
import FAQPage from "../../pages/FAQ";
import PeacockShop from "./PeacockShop"

const MainLayout = ({ activeHeading }) => {
  return (
    <div className="min-h-screen bg-[#030F10]">
      <Header activeHeading={activeHeading} />
      <HeroSection />
      <TopSellersSection /> 
      <Services />
        <FeatureSecond />
      <FeatureThird />
      <Review />
      <Growth />
      <Feature />  
      <MagazineSnippet />
      <PeacockShop />
      <FAQPage />
      
    </div>
  );
};

export default MainLayout;