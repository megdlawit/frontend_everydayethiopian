import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Layout/Header2";
import Loader from "../components/Layout/Loader";
import OffPercentCard from "../components/Events/OffPercentCard";
import EventCard from "../components/Events/EventCard";
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
  const placeholder = `${backend_url}/placeholder-image.png`;
  if (!url) return placeholder;
  return url.startsWith("http") ? url : `${backend_url}${url}`;
};

const EventsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category") || "";
  const { allEvents = [], isLoading } = useSelector((state) => state.events) || {};
  const { categories = [], isLoading: catLoading, error: catError } = useSelector((state) => state.category);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  // Filtered data
  const [filteredData, setFilteredData] = useState([]);
  const searchQueryValue = searchParams.get("search") || "";

  // Fetch categories
  useEffect(() => {
    if (!categories.length && !catLoading && !catError) {
      console.log("Dispatching getAllCategories");
      dispatch(getAllCategories());
    }
  }, [dispatch, categories.length, catLoading, catError]);

  // Sync selectedCategory with URL param
  useEffect(() => {
    if (categoryData !== selectedCategory) {
      console.log("Syncing selectedCategory:", { categoryData, selectedCategory });
      setSelectedCategory(categoryData);
      setCurrentPage(1);
    }
  }, [categoryData]);

  // Filtering logic
  useEffect(() => {
    let result = allEvents ? [...allEvents] : [];
    console.log("Initial events:", result.length);

    // Relaxed filter: only check for valid events
    result = result.filter((e) => {
      const isValid = e && e.name && (e.images?.length > 0 || !e.video);
      if (!isValid) console.log("Filtered out event:", e);
      return isValid;
    });

    // Filter out Welcome Event
    result = result.filter((e) => e.name !== "Welcome Event");

    // Category filter
    if (selectedCategory) {
      result = result.filter((e) => {
        const match = String(e.category?._id || e.category) === String(selectedCategory);
        if (!match) console.log("Category filter out:", e.name, e.category, selectedCategory);
        return match;
      });
    }

    // Price filter
    if (selectedPrices.length > 0) {
      result = result.filter((e) => {
        const price = Number(e.discountPrice) || 0;
        const match = selectedPrices.some(
          (rangeIdx) => price >= PRICE_RANGES[rangeIdx].min && price <= PRICE_RANGES[rangeIdx].max
        );
        if (!match) console.log("Price filter out:", e.name, price);
        return match;
      });
    }

    // Discount filter
    if (selectedDiscounts.length > 0) {
      result = result.filter((e) => {
        const original = Number(e.originalPrice) || 0;
        const discountPrice = Number(e.discountPrice) || 0;
        if (!original || !discountPrice) {
          console.log("Discount filter out (no prices):", e.name);
          return false;
        }
        const discount = ((original - discountPrice) / original) * 100;
        const match = selectedDiscounts.some(
          (rangeIdx) => discount >= DISCOUNT_RANGES[rangeIdx].min && discount <= DISCOUNT_RANGES[rangeIdx].max
        );
        if (!match) console.log("Discount filter out:", e.name, discount);
        return match;
      });
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      result = result.filter((e) => {
        const rating = Math.round(Number(e.ratings) || 0);
        const match = selectedRatings.some(
          (rangeIdx) => rating >= RATING_RANGES[rangeIdx].min
        );
        if (!match) console.log("Rating filter out:", e.name, rating);
        return match;
      });
    }

    // Search filter
    if (searchQueryValue) {
      result = result.filter((e) => {
        const match = e.name?.toLowerCase().includes(searchQueryValue.toLowerCase());
        if (!match) console.log("Search filter out:", e.name, searchQueryValue);
        return match;
      });
    }

    // Sort by ratings or discount
    result = result.sort((a, b) => {
      const ratingDiff = (Number(b.ratings) || 0) - (Number(a.ratings) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (Number(b.discountPrice) || 0) - (Number(a.discountPrice) || 0);
    });

    console.log("Filtered events:", result.length);
    setFilteredData(result);
    setCurrentPage(1);
  }, [allEvents, selectedCategory, selectedPrices, selectedDiscounts, selectedRatings, searchQueryValue]);

  // Category handler
  const handleCategoryClick = useCallback((catId) => {
    const newCategory = catId || "";
    console.log("Category clicked:", { catId, selectedCategory, newCategory });
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
      setSearchParams(newCategory ? { category: newCategory } : {}, { replace: true });
    }
    setIsFiltersOpen(false); // Close filters on mobile after selection
  }, [selectedCategory, setSearchParams]);

  // Checkbox handler
  const handleCheckbox = useCallback((idx, selectedArr, setSelectedArr) => {
    setSelectedArr((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  // Reset filters
  const handleResetFilters = () => {
    console.log("Resetting filters");
    setSelectedCategory("");
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  };

  // Best events for sidebar
  const bestEvents = [...(allEvents || [])]
    .filter((e) => e && e.name && (e.images?.length > 0 || !e.video))
    .filter((e) => e.name !== "Welcome Event")
    .sort((a, b) => {
      const ratingDiff = (Number(b.ratings) || 0) - (Number(a.ratings) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (Number(b.discountPrice) || 0) - (Number(a.discountPrice) || 0);
    })
    .slice(0, 2);

  // Pagination logic for remaining events
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  // Exclude the first 4 events (3 for OffPercentCard + 1 for Popular Offers)
  const remainingEvents = filteredData.slice(4);
  const currentEvents = remainingEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <>
      {catError ? (
        <div className="text-red-500 text-center py-10">Failed to load categories: {catError}</div>
      ) : isLoading || catLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
          <Header activeHeading={5} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            {/* Mobile Header */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h1 className="text-2xl font-quesha text-center flex-1">
                Off Percent
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
            <h1 className="hidden lg:block text-center text-3xl xl:text-4xl font-quesha mb-10" style={{ fontSize: "70px" }}>
              Off Percent
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

                    {/* Best Events Section - Mobile */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Best Events</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {bestEvents.length > 0 ? (
                          bestEvents.map((event) => (
                            <a
                              href={`/event/${event._id}`}
                              key={event._id}
                              className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"
                              onClick={() => setIsFiltersOpen(false)}
                            >
                              <img
                                src={getImageUrl(event.images?.[0]?.url)}
                                alt={event.name || "Event"}
                                className="w-20 h-16 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getImageUrl(null);
                                }}
                              />
                              <div className="absolute inset-0 bg-[#CA8A0A] bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                                <h4 className="text-sm font-medium text-white truncate w-[120px]">
                                  {event.name || "Unnamed Event"}
                                </h4>
                                <p className="text-sm text-gray-300 mt-1">{event.discountPrice || "N/A"} ETB</p>
                              </div>
                            </a>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No best events available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Desktop Sidebar Filters - Unchanged */}
              <div className="hidden lg:block lg:w-1/5 border border-gray-300 rounded-lg shadow-sm p-6">
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

                {/* Best Events Section - Desktop */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Best Events</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {bestEvents.length > 0 ? (
                      bestEvents.map((event) => (
                        <a
                          href={`/event/${event._id}`}
                          key={event._id}
                          className="relative flex items-center gap-4 p-2 border rounded-md shadow-sm group"
                        >
                          <img
                            src={getImageUrl(event.images?.[0]?.url)}
                            alt={event.name || "Event"}
                            className="w-[300px] h-[100px] object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-[#CA8A0A] bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                            <h4 className="text-sm font-medium text-white truncate w-[150px]">
                              {event.name || "Unnamed Event"}
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">{event.discountPrice || "N/A"} ETB</p>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No best events available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Grid */}
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

                {filteredData.length > 0 ? (
                  <>
                    {/* First three OffPercentCard components */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {filteredData.slice(0, 3).map((event, index) => (
                        <div
                          key={event._id}
                          className={`p-2 lg:p-3
                            ${index % 3 !== 2 ? "lg:border-r" : ""}
                            ${index < Math.floor(Math.min(filteredData.length, 3) / 3) * 3 ? "lg:border-b" : ""}
                            ${index % 3 !== 0 ? "lg:border-l" : ""}
                            ${index >= 3 ? "lg:border-t" : ""}
                            border-gray-200
                          `}
                        >
                          <OffPercentCard data={event} />
                        </div>
                      ))}
                    </div>

                    {/* Popular Offers Section */}
                    {filteredData.length > 0 && (
                      <div className="w-full py-6 lg:py-8 mb-6 lg:mb-8">
                        <div className="w-full animate-slideInUp">
                          <EventCard data={filteredData[Math.min(3, filteredData.length - 1)]} />
                        </div>
                      </div>
                    )}

                    {/* Remaining events */}
                    {remainingEvents.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {currentEvents.map((event, index) => {
                            const isFirstColumn = index % 3 === 0;
                            const isLastColumn = index % 3 === 2;
                            const isFirstRow = index < 3;
                            const isLastRow = index >= Math.floor(currentEvents.length / 3) * 3;

                            return (
                              <div
                                key={event._id}
                                className={`p-2 lg:p-3
                                  ${!isLastColumn ? "lg:border-r" : ""}
                                  ${!isLastRow ? "lg:border-b" : ""}
                                  ${!isFirstColumn ? "lg:border-l" : ""}
                                  ${!isFirstRow ? "lg:border-t" : ""}
                                  border-gray-200
                                `}
                              >
                                <OffPercentCard data={event} />
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        <Pagination
                          currentPage={currentPage}
                          totalItems={remainingEvents.length}
                          itemsPerPage={eventsPerPage}
                          onPageChange={setCurrentPage}
                          maxPagesToShow={5}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-8 animate-fadeIn">
                    <p className="text-xl font-medium text-gray-600 mb-4">
                      {allEvents.length === 0 ? "No Events Available" : "No Events Match Your Filters"}
                    </p>
                    <p className="text-gray-500">
                      {allEvents.length === 0
                        ? "Check back later for exciting new events!"
                        : "Try adjusting your filters to find events."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer />
          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 1s ease-out;
            }
            .animate-slideInUp {
              animation: slideInUp 0.8s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default EventsPage;