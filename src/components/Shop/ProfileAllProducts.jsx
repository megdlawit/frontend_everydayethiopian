import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Loader from "../Layout/Loader";
import Footer from "../Layout/Footer";
import ProductCard from "../Route/ProductCard/ProductCard";
import ShopProfileHeader from "./ShopProfileHeader";
import { toast } from "react-toastify";
import { MdTune } from "react-icons/md";
import Pagination from "../Pagination";
import { server } from "../../server";
import Toast from "../../components/Toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const ProfileAllProducts = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category") || "";
  const searchQueryValue = searchParams.get("search") || "";

  // Shop and product states
  const [shopData, setShopData] = useState(null);
  const [isLoadingShop, setIsLoadingShop] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [activeSection, setActiveSection] = useState(2); // 2 represents 'All Products'
  const [categories, setCategories] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // 3x3 grid

  // Filtered data
  const [filteredData, setFilteredData] = useState([]);

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false, // disable react-toastify default icon
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  // Fetch shop data, products, and categories
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoadingShop(true);
        const res = await axios.get(`${server}/shop/get-shop-info/${id}`);
        if (res.data && res.data.shop) {
          setShopData(res.data.shop);
        } else {
          showToast("error", "Shop Error", "Failed to load shop information.");
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
        showToast("error", "Shop Error", "Error loading shop information.");
      } finally {
        setIsLoadingShop(false);
      }
    };

    const fetchShopProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const res = await axios.get(`${server}/product/get-all-products-shop/${id}`);
        setProducts(res.data.products || []);
        showToast("success", "Products Success", "Products fetched successfully!");
      } catch (err) {
        console.error("Error fetching products:", err);
        showToast("error", "Products Error", "Error loading products.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${server}/category/get-all-categories`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        showToast("error", "Categories Error", "Error loading categories.");
      }
    };

    fetchShopData();
    fetchShopProducts();
    fetchCategories();
  }, [id]);

  // Sync selectedCategory with URL param
  useEffect(() => {
    if (categoryData !== selectedCategory) {
      setSelectedCategory(categoryData);
      setCurrentPage(1);
    }
  }, [categoryData]);

  // Filtering logic
  useEffect(() => {
    let result = products || [];

    // Category filter
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
        const discount = ((p.originalPrice - p.discountPrice) / p.originalPrice) * 100;
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
    setCurrentPage(1);
  }, [products, selectedCategory, selectedPrices, selectedDiscounts, selectedRatings, searchQueryValue]);

  // Handle category click
  const handleCategoryClick = useCallback((catId) => {
    const newCategory = catId || "";
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
      setSearchParams(newCategory ? { category: newCategory } : {}, { replace: true });
    }
  }, [selectedCategory, setSearchParams]);

  // Handle checkbox for filters
  const handleCheckbox = useCallback((idx, selectedArr, setSelectedArr) => {
    setSelectedArr((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  };

  // Best products (top 2 by rating or discount)
  const bestProducts = [...(products || [])]
    .sort((a, b) => (b.ratings || 0) - (a.ratings || 0) || (b.discountPrice || 0) - (a.discountPrice || 0))
    .slice(0, 2);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredData.slice(indexOfFirstProduct, indexOfLastProduct);

  const joinedYear = shopData?.createdAt
    ? new Date(shopData.createdAt).getFullYear()
    : "N/A";

  return (
    <>
      {isLoadingShop || isLoadingProducts ? (
        <Loader />
      ) : shopData ? (
        <div className="w-full bg-gradient-to-b from-[#1c3b3c]/10 via-white to-[#1c3b3c]/5 min-h-screen font-sans relative overflow-hidden">
          <ShopProfileHeader
            data={shopData}
            joinedYear={joinedYear}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            id={id}
          />

          {/* Shop Hero Section */}
       

          {/* Main Content */}
          <div className="w-full bg-white py-10 px-5 lg:px-20">
            <h1
              className="text-center text-3xl xl:text-4xl font-quesha mb-10"
              style={{ fontSize: "60px" }}
            >
              Shop Products
            </h1>
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar Filters */}
              <div className="w-full lg:w-1/5 border border-gray-300 rounded-lg shadow-sm p-5">
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
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none peer-checked:block hidden">
                            ✓
                          </span>
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
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none peer-checked:block hidden">
                            ✓
                          </span>
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
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none peer-checked:block hidden">
                            ✓
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best Deals Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Best Deals</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {bestProducts.map((product, index) => (
                      <a
                        href={`/product/${product._id}`}
                        key={product._id || index}
                        className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"
                      >
                        <img
                          src={`${server}${product.images?.[0]?.url}`}
                          alt={product.name}
                          className="w-[300px] h-[100px] object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/Uploads/placeholder-image.png";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                          <h4 className="text-sm font-medium text-white truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{product.discountPrice} ETB</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="w-full lg:w-4/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {currentProducts.map((product, index) => {
                    const isFirstColumn = index % 3 === 0;
                    const isLastColumn = index % 3 === 2;
                    const isFirstRow = index < 3;
                    const isLastRow = index >= Math.floor(currentProducts.length / 3) * 3;

                    return (
                      <div
                        key={product._id || index}
                        className={`p-3
                          ${!isLastColumn ? "border-r" : ""}
                          ${!isLastRow ? "border-b" : ""}
                          ${!isFirstColumn ? "border-l" : ""}
                          ${!isFirstRow ? "border-t" : ""}
                          border-gray-200
                        `}
                      >
                        <ProductCard data={product} hideShopLink={true} />
                      </div>
                    );
                  })}
                </div>

                {filteredData && filteredData.length === 0 && (
                  <h1 className="text-center w-full py-10 text-[20px]">
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
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{
              top: "80px", // give some space from top like in your image
            }}
          />
        </div>
      ) : (
        <p className="text-center mt-10 text-red-500">Shop not found.</p>
      )}
    </>
  );
};

export default ProfileAllProducts;