import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "../ProductCard/ProductCard";

const FeaturedProduct = () => {
  const { allProducts } = useSelector((state) => state.products);

  // Filter active products with at least one image and no video, excluding sample products and special discount product
  const activeProducts = allProducts?.filter(
    (p) => p.status === "Active" && p.images?.length > 0 && !p.video && !p.name.startsWith("Sample Product") && p.name !== "Special Discount Product"
  );
  const productsToShow = activeProducts?.slice(0, 8); // Show max 8 products

  return (
    <div className="w-full bg-white py-10 px-5 lg:px-20">
     <div className="text-center mb-10">
  <h1
    className="font-quesha  text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl leading-tight"
  >
    Featured <span className="text-yellow-600">Products</span>
  </h1>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
        {productsToShow && productsToShow.length > 0 ? (
          productsToShow.map((product, index) => {
            const isFirstColumn = index % 4 === 0;
            const isLastColumn = index % 4 === 3;
            const isFirstRow = index < 4;
            const isLastRow = index >= 4;

            return (
              <div
                key={product._id} // Use unique product ID for key
                className={`p-1
                  ${!isFirstColumn ? "border-l" : ""}
                  ${!isFirstRow ? "border-t" : ""}
                  border-gray-300
                `}
              >
                <ProductCard data={product} />
              </div>
            );
          })
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No featured products available.
          </p>
        )}
      </div>
    </div>
  );
};

export default FeaturedProduct;