import React from 'react'
import Header from "../components/Layout/Header";
import Hero from "../components/Landing/Hero";
import Services from "../components/Landing/Services";
import Categories from "../components/Route/Categories/Categories";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Events from "../components/Events/Events";
import Sponsored from "../components/Route/Sponsored";
import Footer from "../components/Layout/Footer";
import SliderComponent from '../components/Layout/SellerAdvertisment';
import MainLayout from '../components/Landing/MainLayout';

const HomePage = () => {
  return (
    <div>
       <MainLayout />
        {/* <Header activeHeading={0} />
        <Hero /> */}
        {/* <Sponsored />  */}
        {/* <Services/> */}
        {/* <SliderComponent/> */}
        <Footer />
    </div>
  )
}

export default HomePage