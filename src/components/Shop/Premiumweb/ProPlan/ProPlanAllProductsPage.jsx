import React, { useEffect, useState, useCallback } from "react";

import { useSelector, useDispatch } from "react-redux";

import { useSearchParams, Link, useParams } from "react-router-dom";

import api from "../../../../utils/api";

import Footer from "../../../Layout/Footer";

import Loader from "../../../Layout/Loader";

import ProductCard from "../../../Route/ProductCard/ProductCard";

import { MdTune } from "react-icons/md";

import { getAllCategories } from "../../../../redux/actions/category";

import Pagination from "../../../Pagination";

import { server, backend_url } from "../../../../server";




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
  if (!url) return "/Uploads/placeholder-image.jpg";
  return url.startsWith("http") ? url : `${backend_url}${url}`;
};

const ProPlanAllProductsPage = () => {

  const dispatch = useDispatch();

  const { id } = useParams();

  const [shop, setShop] = useState({});

  const [products, setProducts] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const categoryData = searchParams.get("category") || "";

  const { categories = [], isLoading: catLoading, error: catError } = useSelector((state) => state.category);




  // Filter states

  const [selectedCategory, setSelectedCategory] = useState(categoryData);

  const [selectedPrices, setSelectedPrices] = useState([]);

  const [selectedDiscounts, setSelectedDiscounts] = useState([]);

  const [selectedRatings, setSelectedRatings] = useState([]);

  

  // Mobile filter drawer state

  const [showMobileFilters, setShowMobileFilters] = useState(false);




  // Pagination state

  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;




  // Filtered data

  const [filteredData, setFilteredData] = useState([]);

  const [searchQuery] = useSearchParams();

  const searchQueryValue = searchQuery.get("search") || "";




  // Loading state

  const [loading, setLoading] = useState(true);




  // Fetch shop info

  useEffect(() => {

    const fetchShop = async () => {

      try {

        const res = await axios.get(`${server}/shop/get-shop-info/${id}`);

        const shopRaw = res.data.shop;

        const logo = getImageUrl(shopRaw.avatar?.url);

        setShop({ ...shopRaw, logo });

      } catch (err) {

        setShop({});

      }

    };

    fetchShop();

  }, [id]);




  // Fetch products for this shop

  useEffect(() => {

    const fetchProducts = async () => {

      setLoading(true);

      try {

        const res = await axios.get(`${server}/product/get-all-products-shop/${id}`);

        setProducts(res.data.products || []);

      } catch (err) {

        setProducts([]);

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, [id]);




  // Fetch categories only if not already loaded

  useEffect(() => {

    if (!categories.length && !catLoading && !catError) {

      dispatch(getAllCategories());

    }

  }, [dispatch, categories.length, catLoading, catError]);




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

    // Only products with at least one image and no video

    result = result.filter(

      (p) =>

        Array.isArray(p.images) &&

        p.images.length > 0 &&

        p.images[0]?.url &&

        (!p.video && !p.newVideoPreview)

    );

    if (selectedCategory) {

      result = result.filter((p) => String(p.category) === String(selectedCategory));

    }

    if (selectedPrices.length > 0) {

      result = result.filter((p) =>

        selectedPrices.some(

          (rangeIdx) =>

            p.discountPrice >= PRICE_RANGES[rangeIdx].min &&

            p.discountPrice <= PRICE_RANGES[rangeIdx].max

        )

      );

    }

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

    if (selectedRatings.length > 0) {

      result = result.filter((p) =>

        selectedRatings.some(

          (rangeIdx) => Math.round(p.ratings || 0) >= RATING_RANGES[rangeIdx].min

        )

      );

    }

    if (searchQueryValue) {

      result = result.filter((product) =>

        product.name.toLowerCase().startsWith(searchQueryValue.toLowerCase())

      );

    }

    setFilteredData(result);

    setCurrentPage(1);

  }, [products, selectedCategory, selectedPrices, selectedDiscounts, selectedRatings, searchQueryValue]);




  const handleCategoryClick = useCallback((catId) => {

    const newCategory = catId || "";

    if (newCategory !== selectedCategory) {

      setSelectedCategory(newCategory);

      setSearchParams(newCategory ? { category: newCategory } : {}, { replace: true });

    }

    // Close mobile filters on selection

    setShowMobileFilters(false);

  }, [selectedCategory, setSearchParams]);




  const handleCheckbox = useCallback((idx, selectedArr, setSelectedArr) => {

    setSelectedArr((prev) =>

      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]

    );

  }, []);




  const handleResetFilters = () => {

    setSelectedCategory("");

    setSelectedPrices([]);

    setSelectedDiscounts([]);

    setSelectedRatings([]);

    setSearchParams({}, { replace: true });

    setCurrentPage(1);

  };




  const bestProducts = [...(products || [])]

    .sort((a, b) => (b.ratings || 0) - (a.ratings || 0) || (b.discountPrice || 0) - (a.discountPrice || 0))

    .slice(0, 4);




  const indexOfLastProduct = currentPage * productsPerPage;

  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredData.slice(indexOfFirstProduct, indexOfLastProduct);




  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-screen">

        Loading...

      </div>

    );

  }




  return (

    <div style={{ fontFamily: "Avenir LT Std" }}>

      {/* Header like ProPlanHero */}

      <div className="w-full left-0 z-40 shadow-md sticky top-0" style={{backdropFilter: 'blur(8px)'}}>

        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 md:px-6">

          {/* Home Button Left */}

          <button

            className="text-[#1c3b3c] text-sm md:text-base font-light bg-transparent hover:text-[#cc9a00] transition-all"

            style={{ fontFamily: "'AvenirLTStd', sans-serif" }}

            onClick={() => window.location.href = `/shop/proplan/${id}`}

          >

            Home

          </button>




          {/* Logo Centered */}

          <div className="flex-1 flex justify-center items-center min-w-0">

            <img

              src={shop.logo || '/Uploads/placeholder-image.jpg'}

              alt="Shop Logo"

              className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-gray-200"

              onError={e => { e.target.onerror = null; e.target.src = '/Uploads/placeholder-image.jpg'; }}

            />

          </div>




          {/* All Shop Button Right + Joined At */}

          <div className="flex items-center gap-2 md:gap-3">

            <button

              className="text-[#1c3b3c] border border-[#1c3b3c] px-3 py-1 md:px-5 md:py-2 rounded-full text-xs md:text-base font-light bg-transparent hover:border-[#cc9a00] hover:text-[#cc9a00] transition-all"

              style={{ fontFamily: "'AvenirLTStd', sans-serif" }}

              onClick={() => window.location.href = `/proplan/${id}/all-products`}

            >

              All Shop

            </button>

          </div>

        </div>

      </div>




      <div className="w-full bg-white py-6 md:py-10 px-4 md:px-6 lg:px-20">

        {/* Mobile: Title and Filter Button Side by Side */}

        <div className="lg:hidden flex justify-between items-center mb-6">

          <h1

            className="text-3xl md:text-4xl font-quesha text-[#1c3b3c]"

          >

            Products

          </h1>

          

          <button

            onClick={() => setShowMobileFilters(!showMobileFilters)}

            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"

          >

            <MdTune size={20} />

            {showMobileFilters ? 'Hide' : 'Filters'}

            {selectedCategory || selectedPrices.length > 0 || selectedDiscounts.length > 0 || selectedRatings.length > 0 ? (

              <span className="ml-2 bg-white text-yellow-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">

                !

              </span>

            ) : null}

          </button>

        </div>




        {/* Desktop: Centered Title Only */}

        <h1

          className="hidden lg:block text-center text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-quesha mb-6 md:mb-10 text-[#1c3b3c]"

        >

          Products

        </h1>

        

        {/* Active Filters Summary - Mobile */}

        <div className="lg:hidden mb-4">

          {(selectedCategory || selectedPrices.length > 0 || selectedDiscounts.length > 0 || selectedRatings.length > 0) && (

            <div className="p-3 bg-gray-50 rounded-lg">

              <div className="flex flex-wrap gap-2">

                {selectedCategory && (

                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">

                    {categories.find(c => c._id === selectedCategory)?.title || 'Category'}

                    <button onClick={() => handleCategoryClick("")} className="ml-1 text-yellow-600 hover:text-yellow-800">×</button>

                  </span>

                )}

                {selectedPrices.map(idx => (

                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">

                    {PRICE_RANGES[idx].label}

                    <button onClick={() => handleCheckbox(idx, selectedPrices, setSelectedPrices)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>

                  </span>

                ))}

                {selectedDiscounts.map(idx => (

                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">

                    {DISCOUNT_RANGES[idx].label}

                    <button onClick={() => handleCheckbox(idx, selectedDiscounts, setSelectedDiscounts)} className="ml-1 text-green-600 hover:text-green-800">×</button>

                  </span>

                ))}

                {selectedRatings.map(idx => (

                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">

                    {RATING_RANGES[idx].label}

                    <button onClick={() => handleCheckbox(idx, selectedRatings, setSelectedRatings)} className="ml-1 text-purple-600 hover:text-purple-800">×</button>

                  </span>

                ))}

                <button

                  onClick={handleResetFilters}

                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"

                >

                  Clear All

                </button>

              </div>

            </div>

          )}

        </div>




        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10" id="products-grid-section">

          {/* Mobile Filter Overlay - Right Side Drawer */}

          {showMobileFilters && (

            <div className="lg:hidden fixed inset-0 z-50" onClick={() => setShowMobileFilters(false)}>

              {/* Backdrop */}

              <div className="absolute inset-0 bg-black bg-opacity-50" />

              

              {/* Drawer from Right */}

              <div 

                className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto shadow-xl p-5 transform transition-transform duration-300"

                onClick={(e) => e.stopPropagation()}

              >

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-2xl font-semibold text-yellow-600 flex items-center gap-2">

                    <MdTune size={24} /> Filters

                  </h2>

                  <div className="flex gap-3">

                    <button

                      onClick={handleResetFilters}

                      className="text-sm text-gray-600 hover:text-yellow-600"

                    >

                      Reset

                    </button>

                    <button

                      onClick={() => setShowMobileFilters(false)}

                      className="text-sm text-gray-600 hover:text-red-600"

                    >

                      Close

                    </button>

                  </div>

                </div>

                

                {/* Mobile Filter Content */}

                <div className="space-y-6">

                  {/* Category Filter */}

                  <div>

                    <h3 className="text-lg font-semibold mb-3">Categories</h3>

                    <ul className="space-y-2 text-sm text-gray-700">

                      {categories

                        .filter((cat) => cat && cat.title)

                        .map((cat) => (

                          <li

                            key={cat._id}

                            className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 p-2 rounded ${

                              selectedCategory === cat._id

                                ? "bg-yellow-100 text-yellow-600 font-semibold"

                                : ""

                            }`}

                            onClick={() => handleCategoryClick(cat._id)}

                          >

                            {cat.title}

                          </li>

                        ))}

                      <li

                        className={`cursor-pointer transition-all duration-200 hover:text-yellow-600 p-2 rounded ${

                          !selectedCategory ? "bg-yellow-100 text-yellow-600 font-semibold" : ""

                        }`}

                        onClick={() => handleCategoryClick("")}

                      >

                        All

                      </li>

                    </ul>

                  </div>




                  {/* Price Filter */}

                  <div>

                    <h3 className="text-lg font-semibold mb-3">Price</h3>

                    <ul className="space-y-2 text-sm text-gray-600">

                      {PRICE_RANGES.map((range, i) => (

                        <li

                          key={i}

                          className={`flex items-center justify-between px-2 py-2 rounded-md ${

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

                  <div>

                    <h3 className="text-lg font-semibold mb-3">Discount</h3>

                    <ul className="space-y-2 text-sm text-gray-600">

                      {DISCOUNT_RANGES.map((range, i) => (

                        <li

                          key={i}

                          className={`flex items-center justify-between px-2 py-2 rounded-md ${

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

                          className={`flex items-center justify-between px-2 py-2 rounded-md ${

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




          {/* Desktop Sidebar Filters - Hidden on mobile */}

          <div className="hidden lg:block w-full lg:w-1/5 border border-gray-300 rounded-lg shadow-sm p-5">

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

                {bestProducts.slice(0, 2).map((product, index) => (

                  <Link

                    to={`/product/${product._id}`}

                    key={product._id || index}

                    className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"

                  >

                    <img

                      src={getImageUrl(product.images?.[0]?.url)}

                      alt={product.name}

                      className="w-full h-24 object-cover rounded-md"

                      onError={(e) => {

                        e.target.onerror = null;

                        e.target.src = "/Uploads/placeholder-image.jpg";

                      }}

                    />

                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">

                      <h4 className="text-sm font-medium text-white truncate px-2">{product.name}</h4>

                      <p className="text-sm text-gray-300 mt-1">{product.discountPrice} ETB</p>

                    </div>

                  </Link>

                ))}

              </div>

            </div>

          </div>




          {/* Product Grid Container */}

          <div className="w-full lg:w-4/5">

            {/* Products Grid - Mobile */}

            <div className="lg:hidden">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                {currentProducts &&

                  currentProducts.map((product, index) => (

                    <div

                      key={product._id || index}

                      className="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"

                    >

                      <ProductCard data={product} />

                    </div>

                  ))}

              </div>




              {filteredData && filteredData.length === 0 && (

                <div className="text-center w-full py-10 md:py-20">

                  <h1 className="text-[18px] md:text-[20px] text-gray-600">

                    No products found!

                  </h1>

                  <p className="text-gray-500 mt-2">Try adjusting your filters</p>

                </div>

              )}




              {/* Pagination */}

              {filteredData && filteredData.length > 0 && (

                <div className="mt-8 md:mt-12">

                  <Pagination

                    currentPage={currentPage}

                    totalItems={filteredData.length}

                    itemsPerPage={productsPerPage}

                    onPageChange={setCurrentPage}

                    maxPagesToShow={window.innerWidth < 768 ? 3 : 5}

                  />

                </div>

              )}

            </div>




            {/* Desktop: Products Grid */}

            <div className="hidden lg:block">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

                {currentProducts &&

                  currentProducts.map((product, index) => (

                    <div

                      key={product._id || index}

                      className="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"

                    >

                      <ProductCard data={product} />

                    </div>

                  ))}

              </div>




              {filteredData && filteredData.length === 0 && (

                <div className="text-center w-full py-10 md:py-20">

                  <h1 className="text-[18px] md:text-[20px] text-gray-600">

                    No products found!

                  </h1>

                  <p className="text-gray-500 mt-2">Try adjusting your filters</p>

                </div>

              )}




              {/* Pagination */}

              {filteredData && filteredData.length > 0 && (

                <div className="mt-8 md:mt-12">

                  <Pagination

                    currentPage={currentPage}

                    totalItems={filteredData.length}

                    itemsPerPage={productsPerPage}

                    onPageChange={setCurrentPage}

                    maxPagesToShow={window.innerWidth < 768 ? 3 : 5}

                  />

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      <Footer />

    </div>

  );

};




export default ProPlanAllProductsPage;