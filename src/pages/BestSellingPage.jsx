import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../components/Layout/Header2";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import Footer from "../components/Layout/Footer";
import { MdTune } from "react-icons/md";
import { IoCheckmarkOutline } from "react-icons/io5";
import { getAllCategories } from "../redux/actions/category";
import Pagination from "../components/Pagination";
import { backend_url } from "../server";

const PRICE_RANGES = [
  { label: "200 Birr - 500 Birr", min: 200, max: 500 },
  { label: "600 Birr - 800 Birr", min: 600, max: 800 },
  { label: "900 Birr - 1100 Birr", min: 900, max: 1100 },
  { label: "1200 Birr - 1500 Birr", min: 1200, max: 1500 },
  { label: "1600 Birr - 1900 Birr", min: 1600, max: 1900 },
  { label: "2000 Birr - 2500 Birr", min: 2000, max: 2500 },
];

const DISCOUNT_RANGES = [
  { label: "10% - 20%", min: 10, max: 20 },
  { label: "20% - 30%", min: 20, max: 30 },
  { label: "30% - 40%", min: 30, max: 40 },
  { label: "40% - 50%", min: 40, max: 50 },
  { label: "50% - 60%", min: 50, max: 60 },
  { label: "60% - 70%", min: 60, max: 70 },
];

const RATING_RANGES = [
  { label: "★★★★★", min: 5 },
  { label: "★★★★☆", min: 4 },
  { label: "★★★☆☆", min: 3 },
  { label: "★★☆☆☆", min: 2 },
  { label: "★☆☆☆☆", min: 1 },
];

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return "/placeholder-image.png";
  if (url.startsWith("http")) return url;
  // Ensure single slash between backend_url and url
  return `${backend_url}${url.startsWith("/") ? "" : "/"}${url}`;
};

const BestSellingPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category") || "";
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const { categories = [], isLoading: catLoading, error: catError } = useSelector((state) => state.category);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // 3x3 grid

  // Filtered data
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery] = useSearchParams();
  const searchQueryValue = searchQuery.get("search") || "";

  // Fetch categories only if not already loaded
  useEffect(() => {
    if (!categories.length && !catLoading && !catError) {
      console.log("Dispatching getAllCategories");
      dispatch(getAllCategories());
    }
  }, [dispatch, categories.length, catLoading, catError]);

  // Sync selectedCategory with URL param
  useEffect(() => {
    if (categoryData !== selectedCategory) {
      console.log("Syncing selectedCategory with categoryData:", { categoryData, selectedCategory });
      setSelectedCategory(categoryData);
      setCurrentPage(1); // Reset to first page when category changes
    }
  }, [categoryData]);

  // Filtering logic
  useEffect(() => {
    let result = allProducts ? [...allProducts] : [];

    // Only show products with status "Active", at least one image, and no video
    result = result.filter((p) => p.status === "Active" && p.images?.length > 0 && !p.video);

    // Filter out sample products and special discount product
    result = result.filter((p) => !p.name.startsWith("Sample Product") && p.name !== "Special Discount Product");

    // Sort by sold_out for best-selling
    result = result.sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0));

    // Category filter (compare by ID)
    if (selectedCategory) {
      result = result.filter((p) => String(p.category) === String(selectedCategory));
    }

    // Price filter
    if (selectedPrices.length > 0) {
      result = result.filter((p) =>
        selectedPrices.some(
          (rangeIdx) =>
            p.discountPrice >= PRICE_RANGES[rangeIdx].min &&
            p.discountPrice <= PRICE_RANGES[rangeIdx].max
        )
      );
    }

    // Discount filter
    if (selectedDiscounts.length > 0) {
      result = result.filter((p) => {
        if (!p.originalPrice || !p.discountPrice) return false;
        const discount =
          ((p.originalPrice - p.discountPrice) / p.originalPrice) * 100;
        return selectedDiscounts.some(
          (rangeIdx) =>
            discount >= DISCOUNT_RANGES[rangeIdx].min &&
            discount <= DISCOUNT_RANGES[rangeIdx].max
        );
      });
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      result = result.filter((p) =>
        selectedRatings.some(
          (rangeIdx) => Math.round(p.ratings || 0) >= RATING_RANGES[rangeIdx].min
        )
      );
    }

    // Search filter
    if (searchQueryValue) {
      result = result.filter((product) =>
        product.name.toLowerCase().startsWith(searchQueryValue.toLowerCase())
      );
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allProducts, selectedCategory, selectedPrices, selectedDiscounts, selectedRatings, searchQueryValue]);

  // Memoized handler to prevent unnecessary re-renders
  const handleCategoryClick = useCallback((catId) => {
    const newCategory = catId || "";
    console.log("handleCategoryClick:", { catId, selectedCategory, newCategory });
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
      setSearchParams(newCategory ? { category: newCategory } : {}, { replace: true });
    }
    setIsFiltersOpen(false); // Close filters on mobile after selection
  }, [selectedCategory, setSearchParams]);

  const handleCheckbox = useCallback((idx, selectedArr, setSelectedArr) => {
    setSelectedArr((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setSearchParams({}, { replace: true });
    setCurrentPage(1); // Reset to first page
  };

  // Select best products (top 4 by rating or discount, with images and no video)
  const bestProducts = [...(allProducts || [])]
    .filter((p) => p.status === "Active" && p.images?.length > 0 && !p.video)
    .filter((p) => !p.name.startsWith("Sample Product") && p.name !== "Special Discount Product")
    .sort((a, b) => (b.ratings || 0) - (a.ratings || 0) || (b.discountPrice || 0) - (a.discountPrice || 0))
    .slice(0, 4);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredData.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <>
      {catError ? (
        <div className="text-red-500 text-center py-10">Failed to load categories: {catError}</div>
      ) : isLoading || catLoading ? (
        <Loader />
      ) : (
        <div style={{ fontFamily: "Avenir LT Std" }}>
          <Header activeHeading={3} />
          <div className="responsive-container px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            {/* Mobile Filter Header */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h1 className="text-2xl font-quesha text-center flex-1">
                Best Selling
              </h1>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg"
              >
                <MdTune size={20} />
                Filters
              </button>
            </div>

            {/* Desktop Title */}
            <h1 className="hidden lg:block text-center text-4xl font-quesha mb-10">
              Best Selling
            </h1>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Mobile Filters Overlay */}
              {isFiltersOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                  <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-yellow-600 flex items-center gap-2">
                          <MdTune size={24} /> Filters
                        </h2>
                        <div className="flex gap-2">
                          <button
                            onClick={handleResetFilters}
                            className="text-sm text-gray-600 hover:text-yellow-600"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setIsFiltersOpen(false)}
                            className="text-sm text-gray-600 hover:text-yellow-600"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Categories</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {categories
                            .filter((cat) => cat && cat.title)
                            .map((cat) => (
                              <li
                                key={cat._id}
                                className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 ${
                                  selectedCategory === cat._id
                                    ? "underline text-yellow-600 font-semibold"
                                    : ""
                                }`}
                                onClick={() => handleCategoryClick(cat._id)}
                              >
                                {cat.title}
                              </li>
                            ))}
                          <li
                            className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 ${
                              !selectedCategory ? "underline text-yellow-600 font-semibold" : ""
                            }`}
                            onClick={() => handleCategoryClick("")}
                          >
                            All
                          </li>
                        </ul>
                      </div>

                      {/* Price Filter */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Price</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {PRICE_RANGES.map((range, i) => (
                            <li
                              key={i}
                              className={`flex items-center justify-between px-2 py-1 rounded-md ${
                                selectedPrices.includes(i) ? "bg-yellow-100" : ""
                              }`}
                            >
                              <span>{range.label}</span>
                              <label className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedPrices.includes(i)}
                                  onChange={() =>
                                    handleCheckbox(i, selectedPrices, setSelectedPrices)
                                  }
                                  className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                                />
                                <IoCheckmarkOutline
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                                />
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Discount Filter */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Discount</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {DISCOUNT_RANGES.map((range, i) => (
                            <li
                              key={i}
                              className={`flex items-center justify-between px-2 py-1 rounded-md ${
                                selectedDiscounts.includes(i) ? "bg-yellow-100" : ""
                              }`}
                            >
                              <span>{range.label}</span>
                              <label className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedDiscounts.includes(i)}
                                  onChange={() =>
                                    handleCheckbox(i, selectedDiscounts, setSelectedDiscounts)
                                  }
                                  className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                                />
                                <IoCheckmarkOutline
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                                />
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Rating Filter */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Rating</h3>
                        <ul className="space-y-2 text-sm">
                          {RATING_RANGES.map((range, i) => (
                            <li
                              key={i}
                              className={`flex items-center justify-between px-2 py-1 rounded-md ${
                                selectedRatings.includes(i) ? "bg-yellow-100" : ""
                              }`}
                            >
                              <span className="text-yellow-500">{range.label}</span>
                              <label className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedRatings.includes(i)}
                                  onChange={() =>
                                    handleCheckbox(i, selectedRatings, setSelectedRatings)
                                  }
                                  className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                                />
                                <IoCheckmarkOutline
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                                />
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Best Deals Section - Mobile */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Best Deals</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {bestProducts.slice(0, 2).map((product, index) => (
                            <Link
                              to={`/product/${product._id}`}
                              key={product._id}
                              className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"
                              onClick={() => setIsFiltersOpen(false)}
                            >
                              <img
                                src={getImageUrl(product.images?.[0]?.url)}
                                alt={product.name}
                                className="w-20 h-16 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder-image.png";
                                }}
                              />
                              <div className="absolute inset-0 bg-[#CA8A0A] bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                                <h4 className="text-sm font-medium text-white truncate w-[120px]">{product.name}</h4>
                                <p className="text-sm text-gray-300 mt-1">{product.discountPrice} ETB</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Sidebar Filters - Unchanged */}
              <div className="hidden lg:block lg:w-1/5 border border-gray-300 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-yellow-600 flex items-center gap-2">
                    <MdTune size={24} /> Filters
                  </h2>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-gray-600 hover:text-yellow-600"
                  >
                    Reset
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {categories
                      .filter((cat) => cat && cat.title)
                      .map((cat) => (
                        <li
                          key={cat._id}
                          className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 ${
                            selectedCategory === cat._id
                              ? "underline text-yellow-600 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleCategoryClick(cat._id)}
                        >
                          {cat.title}
                        </li>
                      ))}
                    <li
                      className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 ${
                        !selectedCategory ? "underline text-yellow-600 font-semibold" : ""
                      }`}
                      onClick={() => handleCategoryClick("")}
                    >
                      All
                    </li>
                  </ul>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Price</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {PRICE_RANGES.map((range, i) => (
                      <li
                        key={i}
                        className={`flex items-center justify-between px-2 py-1 rounded-md ${
                          selectedPrices.includes(i) ? "bg-yellow-100" : ""
                        }`}
                      >
                        <span>{range.label}</span>
                        <label className="relative">
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(i)}
                            onChange={() =>
                              handleCheckbox(i, selectedPrices, setSelectedPrices)
                            }
                            className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                          />
                          <IoCheckmarkOutline
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Discount Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Discount</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {DISCOUNT_RANGES.map((range, i) => (
                      <li
                        key={i}
                        className={`flex items-center justify-between px-2 py-1 rounded-md ${
                          selectedDiscounts.includes(i) ? "bg-yellow-100" : ""
                        }`}
                      >
                        <span>{range.label}</span>
                        <label className="relative">
                          <input
                            type="checkbox"
                            checked={selectedDiscounts.includes(i)}
                            onChange={() =>
                              handleCheckbox(i, selectedDiscounts, setSelectedDiscounts)
                            }
                            className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                          />
                          <IoCheckmarkOutline
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Rating</h3>
                  <ul className="space-y-2 text-sm">
                    {RATING_RANGES.map((range, i) => (
                      <li
                        key={i}
                        className={`flex items-center justify-between px-2 py-1 rounded-md ${
                          selectedRatings.includes(i) ? "bg-yellow-100" : ""
                        }`}
                      >
                        <span className="text-yellow-500">{range.label}</span>
                        <label className="relative">
                          <input
                            type="checkbox"
                            checked={selectedRatings.includes(i)}
                            onChange={() =>
                              handleCheckbox(i, selectedRatings, setSelectedRatings)
                            }
                            className="appearance-none w-5 h-5 border-2 border-[#FFC300] rounded-sm peer checked:bg-[#FFC300] checked:border-[#FFC300]"
                          />
                          <IoCheckmarkOutline
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg pointer-events-none peer-checked:block hidden"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Deals Section - Desktop */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 w-[200px]">Best Deals</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {bestProducts.slice(0, 2).map((product, index) => (
                      <Link
                        to={`/product/${product._id}`}
                        key={product._id}
                        className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"
                      >
                        <img
                          src={getImageUrl(product.images?.[0]?.url)}
                          alt={product.name}
                          className="w-[300px] h-[100px] object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-[#CA8A0A] bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                          <h4 className="text-sm font-medium text-white truncate w-[150px]">{product.name}</h4>
                          <p className="text-sm text-gray-300 mt-1">{product.discountPrice} ETB</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="w-full lg:w-4/5">
                {/* Mobile Active Filters */}
                <div className="lg:hidden mb-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        Category: {categories.find(c => c._id === selectedCategory)?.title}
                      </span>
                    )}
                    {selectedPrices.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        {selectedPrices.length} price filter(s)
                      </span>
                    )}
                    {selectedDiscounts.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        {selectedDiscounts.length} discount filter(s)
                      </span>
                    )}
                    {selectedRatings.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        {selectedRatings.length} rating filter(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {currentProducts &&
                    currentProducts.map((product, index) => {
                      const isFirstColumn = index % 3 === 0;
                      const isLastColumn = index % 3 === 2;
                      const isFirstRow = index < 3;
                      const isLastRow = index >= Math.floor(currentProducts.length / 3) * 3;

                      return (
                        <div
                          key={product._id}
                          className={`p-2 sm:p-3
                            ${!isLastColumn ? "lg:border-r" : ""}
                            ${!isLastRow ? "lg:border-b" : ""}
                            ${!isFirstColumn ? "lg:border-l" : ""}
                            ${!isFirstRow ? "lg:border-t" : ""}
                            border-gray-200
                          `}
                        >
                          <ProductCard data={product} />
                        </div>
                      );
                    })}
                </div>

                {filteredData && filteredData.length === 0 && (
                  <h1 className="text-center w-full py-10 text-lg sm:py-20 sm:text-[20px]">
                    No products found!
                  </h1>
                )}

                {/* Pagination */}
                {filteredData && filteredData.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={productsPerPage}
                    onPageChange={setCurrentPage}
                    maxPagesToShow={5}
                  />
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default BestSellingPage;