import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header2";
import Loader from "../components/Layout/Loader";
import { MdTune } from "react-icons/md";
import { getAllCategories } from "../redux/actions/category";
import { addToWishlist, removeFromWishlist } from "../redux/actions/wishlist";
import { addTocart } from "../redux/actions/cart";
import { toast } from "react-toastify";
import Toast from "../components/Toast";
import api from "../utils/api";
import { AiFillHeart, AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai";
import Pagination from "../components/Pagination";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { server, backend_url } from "../server";

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

const getVideoUrl = (video) => {
  if (!video) return "/Uploads/placeholder-video.mp4";
  if (video.startsWith("blob:") || video.startsWith("http")) return video;
  return `${backend_url}${video.startsWith("/") ? video : `/${video}`}`;
};

const VideoShoppingPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category") || "";
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { categories = [], isLoading: catLoading, error: catError } = useSelector((state) => state.category);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryData);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // 3x3 grid
  const [mutedVideos, setMutedVideos] = useState({}); // Track mute state per product
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Fetch products with videos only
  useEffect(() => {
    const fetchProductsWithVideos = async () => {
      try {
        // First try normal request
        let response = await api.get(`/product/get-products-with-videos`, { params: { limit: 100 } });

        // If server returned 304 or no body (cached), refetch with cache-busting
        if (response.status === 304 || !response.data) {
          response = await api.get(`/product/get-products-with-videos`, {
            params: { limit: 100, t: Date.now() },
            headers: { "Cache-Control": "no-cache" },
          });
        }

        const productsData = response?.data?.products || [];
        setProducts(productsData);

        // Set first video unmuted, others muted
        const vids = {};
        productsData.forEach((p, idx) => {
          vids[p._id] = idx === 0 ? false : true;
        });
        setMutedVideos(vids);
      } catch (error) {
        console.error("Error fetching products with videos:", error?.message || error);
      }
    };
    fetchProductsWithVideos();
  }, []);

  // Sync selectedCategory with URL param
  useEffect(() => {
    if (categoryData !== selectedCategory) {
      setSelectedCategory(categoryData);
      setCurrentPage(1); // Reset to first page
    }
  }, [categoryData]);

  // Filtering logic
  useEffect(() => {
    let result = products || [];

    // Only show products with a video
    result = result.filter((p) => p.video && p.video !== "");

    // Only show active products
    result = result.filter((p) => p.status === "Active");

    // Filter out sample products
    result = result.filter((p) => !p.name.startsWith("Sample Product"));

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

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, selectedCategory, selectedPrices, selectedDiscounts, selectedRatings]);

  // Memoized handlers
  const handleCategoryClick = useCallback((catId) => {
    const newCategory = catId || "";
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

  // Wishlist toggle
  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist?.some((i) => i._id === product._id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product));
      showToast("success", "Wishlist", "Removed from wishlist!");
    } else {
      dispatch(addToWishlist(product));
      showToast("success", "Wishlist", "Added to wishlist!");
    }
  };

  // Add to cart
  const addToCartHandler = (product) => {
    const isItemExists = cart?.some((i) => i._id === product._id);
    if (isItemExists) {
      showToast("error", "Cart", "Item already in cart!");
    } else {
      if (product.stock < 1) {
        showToast("error", "Cart", "Product stock limited!");
      } else {
        const cartData = {
          ...product,
          qty: 1,
          selectedSize: null,
          selectedColor: null,
          shopId: product.shopId?._id || product.shopId,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Cart", "Item added to cart successfully!");
      }
    }
    if (product.stock > 0 && product.stock <= 5) {
      showToast("info", "Low Stock", `Only ${product.stock} items left in stock!`);
    }
  };

  // Toggle mute for a specific product
  const toggleMute = (productId) => {
    setMutedVideos((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredData.slice(indexOfFirstProduct, indexOfLastProduct);

  return (
    <>
      {catError ? (
        <div className="text-red-500 text-center py-10">Failed to load categories: {catError}</div>
      ) : catLoading ? (
        <Loader />
      ) : (
        <div style={{ fontFamily: "Avenir LT Std" }}>
          <Header activeHeading={2} />
          <div className="w-full bg-white py-6 lg:py-10 px-4 lg:px-20">
            {/* Mobile Header */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h1 className="text-2xl font-quesha text-center flex-1">
                Video Shopping
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
            <h1 className="hidden lg:block text-center text-4xl font-quesha mb-10" style={{ fontSize: "70px" }}>
              Video Shopping
            </h1>

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
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Desktop Sidebar Filters - Unchanged */}
              <div className="hidden lg:block lg:w-1/5 border border-gray-300 rounded-lg shadow-sm p-5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0">
                  {currentProducts.map((product, index) => {
                    const isFirstColumn = index % 3 === 0;
                    const isLastColumn = index % 3 === 2;
                    const isFirstRow = index < 3;
                    const isLastRow = index >= Math.floor(currentProducts.length / 3) * 3;

                    return (
                      <Link
                        key={product._id || index}
                        to={`/video-product-page/${product._id}`}
                        className={`p-2 lg:p-3
                          ${!isLastColumn ? "lg:border-r" : ""}
                          ${!isLastRow ? "lg:border-b" : ""}
                          ${!isFirstColumn ? "lg:border-l" : ""}
                          ${!isFirstRow ? "lg:border-t" : ""}
                          border-gray-200
                        `}
                      >
                        <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[460px] max-w-[300px] mx-auto group overflow-hidden rounded-md transition-all duration-300 p-1">
                          <div className="w-full h-full rounded-md transition-all duration-300 group-hover:bg-[#FFC30054] group-hover:p-2">
                            <div className="relative h-[200px] sm:h-[250px] lg:h-[360px] overflow-hidden rounded-md">
                              <video
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                                autoPlay
                                loop
                                muted={mutedVideos[product._id] !== false}
                                playsInline
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.poster = "/Uploads/placeholder-image.jpg";
                                }}
                              >
                                <source
                                  src={getVideoUrl(product.video)}
                                  type="video/mp4"
                                />
                                Your browser does not support the video tag.
                              </video>

                              {/* Mute/Unmute Button */}
                              <button
                                className="absolute left-2 bottom-2 z-10 bg-[#D9D9D9C4] hover:bg-[#ccc] rounded-full p-1 lg:p-2 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMute(product._id);
                                }}
                                title={mutedVideos[product._id] !== false ? "Unmute" : "Mute"}
                              >
                                <div className="lg:hidden">
                                  {mutedVideos[product._id] !== false ? (
                                    <FaVolumeMute size={16} color="#333" />
                                  ) : (
                                    <FaVolumeUp size={16} color="#333" />
                                  )}
                                </div>
                                <div className="hidden lg:block">
                                  {mutedVideos[product._id] !== false ? (
                                    <FaVolumeMute size={18} color="#333" />
                                  ) : (
                                    <FaVolumeUp size={18} color="#333" />
                                  )}
                                </div>
                              </button>

                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlistToggle(product);
                                  }}
                                  className="p-1 lg:p-2 rounded-full bg-[#D9D9D9C4] hover:bg-[#ccc] text-white"
                                  title={
                                    wishlist?.some((i) => i._id === product._id)
                                      ? "Remove from Wishlist"
                                      : "Add to Wishlist"
                                  }
                                >
                                  <div className="lg:hidden">
                                    {wishlist?.some((i) => i._id === product._id) ? (
                                      <AiFillHeart size={16} color="red" />
                                    ) : (
                                      <AiOutlineHeart size={16} />
                                    )}
                                  </div>
                                  <div className="hidden lg:block">
                                    {wishlist?.some((i) => i._id === product._id) ? (
                                      <AiFillHeart size={18} color="red" />
                                    ) : (
                                      <AiOutlineHeart size={18} />
                                    )}
                                  </div>
                                </button>
                              </div>

                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCartHandler(product);
                                  }}
                                  className="p-2 lg:p-3 rounded-full bg-[#FFC300] text-white hover:scale-110 shadow-md"
                                  title="Add to Cart"
                                >
                                  <div className="lg:hidden">
                                    <AiOutlineShoppingCart size={20} />
                                  </div>
                                  <div className="hidden lg:block">
                                    <AiOutlineShoppingCart size={24} />
                                  </div>
                                </button>
                              </div>
                            </div>

                            <div className="pt-3 px-3 pb-4 flex items-end justify-between">
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="text-sm font-medium text-gray-900 truncate"
                                  style={{ width: "180px" }}
                                  title={product.name}
                                >
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {product.discountPrice} ETB
                                </p>
                              </div>
                              {product.shopId && product.shopId._id && (
                                <Link
                                  to={
                                    product.shopId.isPremium
                                      ? `/shop/premiumpreview/${product.shopId._id}`
                                      : `/shop/preview/${product.shopId._id}`
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-2"
                                >
                                  <button
                                    className="inline-block text-[#FFC300] text-xs px-2 py-1 rounded-full group-hover:bg-white group-hover:text-[#FFC300] transition-all duration-300"
                                    title="Visit Shop"
                                  >
                                    Visit Shop
                                  </button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {filteredData.length === 0 && (
                  <h1 className="text-center w-full py-10 lg:py-20 text-lg lg:text-[20px]">
                    No video products found!
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

export default VideoShoppingPage;