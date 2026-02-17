import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";

const SuggestedProduct = ({ data }) => {
  const { allProducts } = useSelector((state) => state.products);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    // Filter: same category, has image, no video
    const d =
      allProducts &&
      allProducts.filter(
        (i) =>
          i.category === data.category &&
          i.images?.length > 0 &&
          !i.video
      );
    setProductData(d);
  }, [allProducts, data.category]);

  // Split products into rows of 4
  const rows = [];
  for (let i = 0; i < productData.length; i += 4) {
    rows.push(productData.slice(i, i + 4));
  }

  return (
    <div>
      {data ? (
        <div className={`p-4 ${styles.section}`}>
          <h2
            className={`${styles.heading} text-[50px] font-[500] mb-5`}
            style={{ fontFamily: "'Quesha'" }}
          >
            Related Product
          </h2>
          <div className="flex flex-col gap-6 mb-12">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[20px]"
              >
                {row.map((i, index) => (
                  <ProductCard data={i} key={i._id || index} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProduct;