import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header2 from "../components/Layout/Header2";
import ProductDetails from "../components/Products/VideoProductDetail";
import SuggestedProduct from "../components/Products/SuggestedProduct";
import { useSelector } from "react-redux";

const VideoProductDetailsPage = () => {
  const { allProducts } = useSelector((state) => state.products);
  const { allEvents } = useSelector((state) => state.events);
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [searchParams] = useSearchParams();
  const eventData = searchParams.get("isEvent");

  useEffect(() => {
    if (eventData !== null) {
      const data = allEvents && allEvents.find((i) => i._id === id);
      setData(data);
    } else {
      
      const data = allProducts && allProducts.find((i) => i._id === id);
      setData(data);
    }
  }, [allProducts, allEvents]);

  return (
    <div>
      <Header2 />
      <ProductDetails data={data} />
        {
          !eventData && (
            <>
            {data && <SuggestedProduct data={data} />}
            </>
          )
        }
      <Footer />
    </div>
  );
};

export default VideoProductDetailsPage;