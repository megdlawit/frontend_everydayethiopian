import React from "react";
import ProductCard from "../../../Route/ProductCard/ProductCard";

const ProPlanAllProducts = ({ products = [], shopId }) => {
  // Filter products for this shop and without video
  const filtered = products.filter(
    (product) =>
      (product.shopId === shopId || (typeof product.shopId === "object" && product.shopId?._id === shopId)) &&
      Array.isArray(product.images) &&
      product.images.length > 0 &&
      !product.video
  );

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 bg-white rounded-2xl mt-4">
      <h2 className="text-3xl md:text-6xl text-[#1c3b3c] text-center mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
        Shop Our Collection
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {filtered.length > 0 ? (
          filtered.slice(0, 4).map((product) => (
            <ProductCard key={product._id} data={product} hideShopLink={true} />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">
            No products available yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProPlanAllProducts; 