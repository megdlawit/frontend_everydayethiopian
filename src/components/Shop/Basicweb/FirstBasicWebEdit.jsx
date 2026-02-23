import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import api from "../../../utils/api";
import { server, backend_url } from "../../../server";
import { getAllProductsShop, updateProduct } from "../../../redux/actions/product";
import { getAllEventsShop, updateEvent } from "../../../redux/actions/event";
import { loadSeller } from "../../../redux/actions/user";
import { toast } from "react-toastify";
import Footer from "../../../components/Layout/Footer";

import ProductCard from "../../Route/ProductCard/ProductCard";
import Ratings from "../../Products/Ratings";
import { FaPen, FaShareAlt, FaCamera, FaTimes } from "react-icons/fa";
import peac from "../../../Assests/images/peac.png";

const FirstBasicWebEdit = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const { id } = useParams();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [updatedEvents, setUpdatedEvents] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [dismissedTooltips, setDismissedTooltips] = useState({});
  const [showEditTooltip, setShowEditTooltip] = useState(false);
  const [hoveredProductIndex, setHoveredProductIndex] = useState(null);
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [themeColor, setThemeColor] = useState("#1C3B3E");
  const accentColor = "#FAC50C";

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id || id === "undefined") {
        setError("Invalid shop ID. Please provide a valid ID in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`${server}/shop/get-shop-info/${id}`, {
          withCredentials: true,
        });
        const shop = response.data.shop;

        if (!shop) {
          throw new Error("Shop not found");
        }

        setShopData({
          shopUrl: `${window.location.origin}/shop/preview/${id}`,
          shopName: shop.name,
          logo: shop.avatar?.url ? `${backend_url}${shop.avatar.url}` : "/Uploads/placeholder-image.jpg",
          description: shop.description || "Welcome to our shop! We offer premium products crafted with passion and care.",
          address: shop.address || "",
          contact: {
            email: shop.email,
            phoneNumber: shop.phoneNumber,
            mapUrl: shop.contact?.mapUrl || "https://maps.google.com",
          },
        });

        dispatch(getAllProductsShop(id));
        dispatch(getAllEventsShop(id));
      } catch (err) {
        setError(`Failed to load shop data: ${err.response?.data?.message || err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id, dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      setUpdatedProducts([...products]);
    }
  }, [products]);

  useEffect(() => {
    if (events && events.length > 0) {
      setUpdatedEvents([...events]);
    }
  }, [events]);

  useEffect(() => {
    if (isEditing && !showGuide) {
      setShowGuide(true);
      setGuideStep(0);
      setShowLogoTooltip(true);
    }
    return () => {
      setShowGuide(false);
      setShowLogoTooltip(false);
    };
  }, [isEditing]);

  const handleImage = async (e, type = "shop", productId = null, eventId = null, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(`${server}/upload/image`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = response.data.url;

      if (type === "shop") {
        setShopData({ ...shopData, logo: imageUrl });
      } else if (type === "product" && index !== null) {
        const newProducts = [...updatedProducts];
        newProducts[index].images = [{ url: imageUrl }];
        setUpdatedProducts(newProducts);
      } else if (type === "event" && index !== null) {
        const newEvents = [...updatedEvents];
        newEvents[index].images = [{ url: imageUrl }];
        setUpdatedEvents(newEvents);
      }
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload image.");
    }
  };

  const debouncedHandleChange = useCallback(
    debounce((field, value, index = null) => {
      if (index !== null) {
        const newProducts = [...updatedProducts];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setUpdatedProducts(newProducts);
      } else if (field.includes("contact.")) {
        const contactField = field.split(".")[1];
        setShopData({
          ...shopData,
          contact: { ...shopData.contact, [contactField]: value },
        });
      } else {
        setShopData({ ...shopData, [field]: value });
      }
    }, 100),
    [updatedProducts, shopData]
  );

  const debouncedHandleEventChange = useCallback(
    debounce((field, value, index) => {
      const newEvents = [...updatedEvents];
      newEvents[index] = { ...newEvents[index], [field]: value };
      setUpdatedEvents(newEvents);
    }, 100),
    [updatedEvents]
  );
const handleUpdate = async () => {
  try {
    // Validate shop data
    if (!shopData.shopName || !shopData.contact.email) {
      toast.error("Shop name and email are required.");
      return;
    }

    // Update shop data
    const shopPayload = {
      name: shopData.shopName,
      description: shopData.description,
      address: shopData.address,
      phoneNumber: shopData.contact.phoneNumber,
    };

    const originalShop = seller;
    const shopChanged =
      shopPayload.name !== originalShop.name ||
      shopPayload.description !== (originalShop.description || "") ||
      shopPayload.address !== (originalShop.address || "") ||
      shopPayload.phoneNumber !== (originalShop.phoneNumber || "");

    if (shopChanged) {
      await api.put(`${server}/shop/update-seller-info`, shopPayload, {
        withCredentials: true,
      });
    }

    // Update products
    for (const product of updatedProducts) {
      const originalProduct = products.find((p) => p._id === product._id);
      if (
        !originalProduct ||
        product.name !== originalProduct.name ||
        product.discountPrice !== originalProduct.discountPrice ||
        JSON.stringify(product.images) !== JSON.stringify(originalProduct.images)
      ) {
        await dispatch(
          updateProduct(product._id, {
            name: product.name,
            discountPrice: parseFloat(product.discountPrice) || 0,
            images: product.images,
          })
        );
      }
    }

    // Update events
    for (const event of updatedEvents) {
      const originalEvent = events.find((e) => e._id === event._id);
      if (
        !originalEvent ||
        event.name !== originalEvent.name ||
        event.discountPrice !== originalEvent.discountPrice ||
        JSON.stringify(event.images) !== JSON.stringify(originalEvent.images)
      ) {
        await dispatch(
          updateEvent(event._id, {
            name: event.name,
            discountPrice: parseFloat(event.discountPrice) || 0,
            images: event.images,
          })
        );
      }
    }

    toast.success("Changes saved successfully!");
    setIsEditing(false);
    setShowGuide(false);
    dispatch(loadSeller());
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    const errorUrl = err.config?.url || "unknown endpoint";
    console.error("Save error:", { errorMsg, errorUrl, status: err.response?.status });
    toast.error(`Failed to save changes at ${errorUrl}: ${errorMsg}`);
  }
};

  const handleShare = () => {
    if (navigator.share && shopData) {
      navigator.share({
        title: shopData.shopName,
        text: `Check out ${shopData.shopName} for amazing products!`,
        url: shopData.shopUrl,
      }).catch(() => toast.error("Failed to share."));
    } else {
      navigator.clipboard.writeText(shopData.shopUrl)
        .then(() => toast.success("Shop URL copied to clipboard!"))
        .catch(() => toast.error("Failed to copy URL."));
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/Uploads/placeholder-image.jpg";
  };

  const dismissTooltip = (key) => {
    setDismissedTooltips((prev) => ({ ...prev, [key]: true }));
    if (key === "logo") {
      setShowLogoTooltip(false);
    }
  };

  const allReviews = products && products.map((product) => product.reviews).flat();

  const handleThemeColorChange = (e) => {
    setThemeColor(e.target.value);
  };

  const handleNextGuideStep = () => {
    if (guideStep < 6) setGuideStep(guideStep + 1);
  };

  const handlePrevGuideStep = () => {
    if (guideStep > 0) setGuideStep(guideStep - 1);
  };

  const closeGuide = () => {
    setShowGuide(false);
    setGuideStep(0);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowGuide(false);
    setShowLogoTooltip(false);
    setUpdatedProducts([...products]);
    setUpdatedEvents([...events]);
    setShopData({
      ...shopData,
      shopName: seller.name,
      logo: seller.avatar?.url ? `${backend_url}${seller.avatar.url}` : "/Uploads/placeholder-image.jpg",
      description: seller.description || "Welcome to our shop! We offer premium products crafted with passion and care.",
      address: seller.address || "",
      contact: {
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        mapUrl: seller.contact?.mapUrl || "https://maps.google.com",
      },
    });
    toast.info("Editing canceled. Changes discarded.");
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!shopData) return <div className="flex justify-center items-center min-h-screen text-gray-500">Shop not found.</div>;

  return (
    <div className="w-full min-h-screen font-sans relative overflow-hidden bg-white">
      {isOwner && (
        <>
          <div
            className="fixed top-16 right-4 z-50"
            onMouseEnter={() => setShowEditTooltip(true)}
            onMouseLeave={() => setShowEditTooltip(false)}
          >
            <div className="relative flex flex-col items-center">
              <img
                src={peac}
                alt="Peacock Perched"
                className="w-28 h-20 rounded-full object-cover mb-0 animate-jump-infinite"
                aria-hidden="true"
                style={{ width: "100%", height: "100%", maxWidth: "112px", maxHeight: "80px" }}
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out"
                style={{ background: `#ffc300` }}
                aria-label="Toggle Edit Mode"
              >
                <FaPen size={18} />
              </button>
              {showEditTooltip && (
                <div className="absolute top-full mt-2 right-1/2 transform translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-up">
                  <img
                    src={peac}
                    alt="Peacock Guide"
                    className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                    aria-hidden="true"
                  />
                  <p className="font-medium">Click to {isEditing ? "exit" : "enter"} edit mode</p>
                </div>
              )}
            </div>
          </div>
          {isEditing && (
            <div className="fixed top-20 right-32 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in">
                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Quicksand', sans-serif", color: "#1C3B3E" }}>
                  Save or cancel changes?
                </h3>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={cancelEdit}
                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                    style={{ focusRingColor: accentColor }}
                    aria-label="Cancel Edit"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                    style={{ background: "#ffc300" }}
                    aria-label="Save Changes"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {showGuide && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in">
            <button
              onClick={closeGuide}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              style={{ focusRingColor: "#ffc300" }}
              aria-label="Close Guide"
            >
              ✕
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-full mb-4">
                <img
                  src={peac}
                  alt="Peacock Guide"
                  className="w-16 h-16 rounded-full object-cover animate-flap"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Quicksand', sans-serif", color: "#1C3B3E" }}>Hello Let's Edit Your Shop!</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-[#FAC50C] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((guideStep + 1) / 7) * 100}%` }}
                ></div>
              </div>
              {guideStep === 0 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 1: Click Edit Icon!</p>
                  <p className="text-gray-600 text-base mb-4">Tap to start editing—let’s make your shop shine!</p>
                </div>
              )}
              {guideStep === 1 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 2: Logo Magic!</p>
                  <p className="text-gray-600 text-base mb-4">Click the logo to upload a image—show your style!</p>
                </div>
              )}
              {guideStep === 2 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 3: Product Fun!</p>
                  <p className="text-gray-600 text-base mb-4">Edit products by clicking images or details—add some flair!</p>
                </div>
              )}
              {guideStep === 3 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 4: Event Excitement!</p>
                  <p className="text-gray-600 text-base mb-4">Update events with new images and info—wow your visitors!</p>
                </div>
              )}
              {guideStep === 4 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 5: Share Your Story!</p>
                  <p className="text-gray-600 text-base mb-4">Edit the ‘About’ section—tell the world about your shop!</p>
                </div>
              )}
              {guideStep === 5 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 6: Contact Details!</p>
                  <p className="text-gray-600 text-base mb-4">Update your contact info—make it easy to reach you!</p>
                </div>
              )}
              {guideStep === 6 && (
                <div>
                  <p className="text-yellow-500 text-lg mb-4">Step 7: Save & Share!</p>
                  <p className="text-gray-600 text-base mb-4">Hit ‘Save’ and share your shop with the jungle!</p>
                </div>
              )}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={handlePrevGuideStep}
                  className={`flex items-center justify-center text-gray-500 px-3 py-2 rounded-full shadow-none hover:text-gray-700 transition-all duration-300 ease-in-out ${guideStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{ background: "transparent", border: "none" }}
                  disabled={guideStep === 0}
                  aria-label="Previous Step"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {guideStep < 6 ? (
                  <button
                    onClick={handleNextGuideStep}
                    className="text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                    style={{ background: "#ffc300" }}
                    aria-label="Next Step"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={closeGuide}
                    className="text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                    style={{ background: "#ffc300" }}
                    aria-label="Finish Guide"
                  >
                    Finish!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <nav className="bg-white/95 backdrop-blur-lg sticky top-0 z-30 shadow-md text-center py-4 md:py-6 animate-fade-in-down">
        <div className="flex flex-col items-center gap-3 mb-3 md:mb-5 relative">
          {isEditing && !dismissedTooltips["shopName"] && (
            <div className="absolute top-0 left-[calc(100%+1rem)] bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-right">
              <img
                src={peac}
                alt="Peacock"
                className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                aria-hidden="true"
              />
              <p className="font-medium">Change name here!</p>
              <button
                onClick={() => dismissTooltip("shopName")}
                className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{ focusRingColor: accentColor }}
                aria-label="Dismiss Tooltip"
              >
                ✕
              </button>
            </div>
          )}
          {isEditing ? (
            <div className="flex flex-col items-center gap-2 relative">
              <div
                className="relative group"
                onMouseEnter={() => setShowLogoTooltip(true)}
                onMouseLeave={() => !dismissedTooltips["logo"] && setShowLogoTooltip(false)}
              >
                <img
                  src={shopData.logo}
                  alt="Shop Logo"
                  className="w-16 h-16 rounded-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  onError={handleImageError}
                />
                <label
                  htmlFor="shopImage"
                  className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)`, focusRingColor: accentColor }}
                  aria-label="Change Shop Image"
                >
                  <FaCamera size={14} />
                  <input
                    type="file"
                    id="shopImage"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImage(e, "shop")}
                  />
                </label>
                {showLogoTooltip && !dismissedTooltips["logo"] && (
                  <div className="absolute top-0 left-[calc(100%+1rem)] bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-right">
                    <img
                      src={peac}
                      alt="Peacock"
                      className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                      aria-hidden="true"
                    />
                    <p className="font-medium">Change logo here!</p>
                    <button
                      onClick={() => dismissTooltip("logo")}
                      className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ focusRingColor: accentColor }}
                      aria-label="Dismiss Tooltip"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={shopData.shopName}
                onChange={(e) => debouncedHandleChange("shopName", e.target.value)}
                className="text-2xl md:text-3xl font-bold border-b p-1 w-full max-w-md text-center focus:ring-2 transition-all duration-300 ease-in-out"
                style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor, borderColor: accentColor, boxShadow: `0 0 0 4px ${accentColor}33` }}
                required
                aria-label="Shop Name"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link to={`/shop/preview/${id}`} className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full" style={{ focusRingColor: accentColor }}>
                <img
                  src={shopData.logo}
                  alt="Shop Logo"
                  className="w-16 h-16 rounded-full object-cover animate-spin-slow transition-transform duration-300 ease-in-out hover:scale-105"
                  style={{ border: `2px solid ${accentColor}` }}
                  onError={handleImageError}
                />
              </Link>
              <h1
                className="text-2xl md:text-3xl font-bold animate-pulse"
                style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor }}
              >
                {shopData.shopName}
              </h1>
            </div>
          )}
        </div>
        <ul className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
          {["Home", "Shop", "Events", "About", "Contact"].map((item) => (
            <li
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className={`cursor-pointer text-gray-600 hover:text-[${accentColor}] transition-all duration-300 ease-in-out font-medium text-sm md:text-base px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{
                color: activeSection === item.toLowerCase() ? accentColor : '',
                background: activeSection === item.toLowerCase() ? `${accentColor}1a` : '',
                border: activeSection === item.toLowerCase() ? `1px solid ${accentColor}` : '',
                focusRingColor: accentColor,
                fontFamily: "'Quicksand', sans-serif",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && scrollToSection(item.toLowerCase())}
              aria-label={`Navigate to ${item} section`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>
      <section
        id="home"
        className="max-w-7xl mx-auto pt-10 md:pt-16 pb-8 md:pb-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in bg-white"
      >
        <div className="relative group">
          {isEditing && !dismissedTooltips["heroProduct"] && (
            <div className="absolute -top-12 right-0 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-up">
              <img
                src={peac}
                alt="Peacock"
                className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                aria-hidden="true"
              />
              <p className="font-medium">Click image to update featured product!</p>
              <button
                onClick={() => dismissTooltip("heroProduct")}
                className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{ focusRingColor: accentColor }}
                aria-label="Dismiss Tooltip"
              >
                ✕
              </button>
            </div>
          )}
          {isEditing ? (
            <div className="relative">
              <label
                htmlFor="product-image-0"
                className="cursor-pointer block relative"
                aria-label="Change Featured Product Image"
              >
                <img
                  src={updatedProducts[0]?.images?.[0]?.url ? `${backend_url}${updatedProducts[0].images[0].url}` : "/Uploads/placeholder-image.jpg"}
                  alt={updatedProducts[0]?.name || "Featured Product"}
                  className="w-full rounded-xl object-cover h-[280px] md:h-[480px] transition-transform duration-300 ease-in-out hover:opacity-90 shadow-md"
                  onError={handleImageError}
                />
                <div className="absolute top-2 right-2 text-white text-xs px-4 py-1.5 rounded-full opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out shadow-md flex items-center gap-1"
                     style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)` }}>
                  <FaCamera size={12} />
                  Change Image
                </div>
                <input
                  type="file"
                  id="product-image-0"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImage(e, "product", null, null, 0)}
                />
              </label>
            </div>
          ) : (
            <img
              src={updatedProducts[0]?.images?.[0]?.url ? `${backend_url}${updatedProducts[0].images[0].url}` : "/Uploads/placeholder-image.jpg"}
              alt={updatedProducts[0]?.name || "Featured Product"}
              className="w-full rounded-xl object-cover h-[280px] md:h-[480px] transform transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md"
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-50 group-hover:opacity-70 transition-all duration-300 ease-in-out"></div>
          <div className="absolute top-4 left-4 text-white">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={updatedProducts[0]?.name || ""}
                  onChange={(e) => debouncedHandleChange("name", e.target.value, 0)}
                  className="text-xl sm:text-lg font-semibold bg-transparent border-b p-2 w-full max-w-xs focus:ring-2 transition-all duration-300 ease-in-out text-white"
                  style={{ borderColor: accentColor, boxShadow: `0 0 0 4px ${accentColor}33` }}
                  aria-label="Product Name"
                />
                <input
                  type="number"
                  value={updatedProducts[0]?.discountPrice || ""}
                  onChange={(e) => debouncedHandleChange("discountPrice", e.target.value, 0)}
                  className="text-sm md:text-base mt-2 bg-transparent border-b p-2 w-full max-w-xs focus:ring-2 transition-all duration-300 ease-in-out text-white"
                  placeholder="Price (ETB)"
                  style={{ borderColor: accentColor, boxShadow: `0 0 0 4px ${accentColor}33` }}
                  aria-label="Product Price"
                />
              </>
            ) : (
              <>
                <p className="text-sm md:text-base font-medium animate-slide-in-up text-white">
                  Featured Product
                </p>
                <h3 className="text-xl md:text-2xl font-semibold animate-slide-in-up delay-50 text-white" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {updatedProducts[0]?.name || "Default Product"}
                </h3>
                <p className="text-sm md:text-base animate-slide-in-up delay-100 text-white">
                  {updatedProducts[0]?.discountPrice || "N/A"} ETB
                </p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {updatedProducts.length > 1 ? (
            updatedProducts.slice(1, 5).map((product, index) => (
              <div key={product._id} className="relative group overflow-hidden">
                {isEditing && !dismissedTooltips[`product-${index + 1}`] && (
                  <div className="absolute -top-20 right-0 bg-white/95 backdrop-blur-lg shadow-sm rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px]">
                    <img
                      src={peac}
                      alt="Peacock"
                      className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                      aria-hidden="true"
                    />
                    <p className="font-medium">Tweak this product!</p>
                    <button
                      onClick={() => dismissTooltip(`product-${index + 1}`)}
                      className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ focusRingColor: accentColor }}
                      aria-label="Dismiss Tooltip"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {isEditing ? (
                  <div className="relative">
                    <label
                      htmlFor={`product-image-${index + 1}`}
                      className="cursor-pointer block relative"
                      aria-label="Change Product Image"
                    >
                      <img
                        src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/Uploads/photo-image.jpg"}
                        alt={product.name}
                        className="w-full rounded-xl object-cover h-[200px] md:h-[230px] transition-transform duration-300 ease-in-out hover:opacity-90 shadow-md"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 right-2 text-white text-xs px-3 py-1.5 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 ease-in-out shadow-sm flex items-center gap-1"
                           style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)` }}>
                        <FaCamera size={12} />
                        Change Image
                      </div>
                      <input
                        type="file"
                        id={`product-image-${index + 1}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImage(e, "product", null, null, index + 1)}
                      />
                    </label>
                    <div className="absolute top-6 left-4 text-white">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => debouncedHandleChange("name", e.target.value, index + 1)}
                        className="text-sm md:text-sm font-semibold bg-transparent border-b p-2 w-full max-w-[120px] focus:ring-2 transition-all duration-200 ease-in-out"
                        style={{ borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                        aria-label="Product Name"
                      />
                      <input
                        type="number"
                        value={product.discountPrice || ""}
                        onChange={(e) => debouncedHandleChange("discountPrice", e.target.value, index + 1)}
                        className="text-sm mt-2 bg-transparent border-b p-2 w-full max-w-[120px] focus:ring-2 transition-all duration-200 ease-in-out"
                        placeholder="Price (ETB)"
                        style={{ borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                        aria-label="Product Price"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/Uploads/photo-image.jpg"}
                      alt={product.name}
                      className="w-full rounded-xl object-cover h-[200px] md:h-[230px] transform transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-50 group-hover:opacity-70 transition-all duration-300 ease-in-out"></div>
                    <div className="absolute top-2 left-2 text-white">
                      <p className={`text-xs font-medium animate-slide-in-right delay-${index * 100}`} style={{ color: '#fff' }}>
                        Featured
                      </p>
                      <h3 className={`text-sm md:text-base font-semibold animate-slide-in-right delay-${(index + 1) * 100}`} style={{ fontFamily: "'Quicksand', sans-serif", color: '#fff' }}>
                        {product.name}
                      </h3>
                      <p className={`text-xs animate-slide-in-right delay-${(index + 2) * 100}`} style={{ color: '#fff' }}>
                        {product.discountPrice || "N/A"} ETB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-600 text-center text-base">No additional products to display.</p>
          )}
        </div>
      </section>
      <section id="shop" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white rounded-xl shadow-md">
        <h2
          className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 animate-slide-in-up"
          style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor }}
        >
          Shop Our Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {updatedProducts && updatedProducts.length > 0 ? (
            updatedProducts.map((product, index) => (
              <div
                key={product._id}
                className="relative group"
                onMouseEnter={() => isEditing && setHoveredProductIndex(index)}
                onMouseLeave={() => isEditing && setHoveredProductIndex(null)}
              >
                {isEditing && hoveredProductIndex === index && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10 flex items-center animate-slide-in-up">
                    <img
                      src={peac}
                      alt="Peacock Guide"
                      className="w-8 h-8 rounded-full object-cover mr-2 animate-jump-infinite"
                      aria-hidden="true"
                    />
                    <div className="bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px]">
                      <p className="font-medium">Click to edit this product!</p>
                    </div>
                  </div>
                )}
                {isEditing ? (
                  <div className="relative bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out w-full">
                    <label
                      htmlFor={`product-card-image-${index}`}
                      className="cursor-pointer block relative"
                      aria-label="Change Product Image"
                    >
                      <img
                        src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/Uploads/photo-image.jpg"}
                        alt={product.name}
                        className="w-full h-[160px] md:h-[200px] object-cover rounded-lg transition-transform duration-300 ease-in-out hover:opacity-90"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 right-2 text-white text-xs px-3 py-1.5 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 ease-in-out shadow-sm flex items-center gap-1"
                           style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)` }}>
                        <FaCamera size={12} />
                        Change Image
                      </div>
                      <input
                        type="file"
                        id={`product-card-image-${index}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImage(e, "product", null, null, index)}
                      />
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => debouncedHandleChange("name", e.target.value, index)}
                      className="mt-3 font-semibold text-base sm:text-sm md:text-base border-b p-2 w-full focus:ring-2 transition-all duration-200 ease-in-out"
                      style={{ color: themeColor, borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                      aria-label="Product Name"
                    />
                    <input
                      type="number"
                      value={product.discountPrice || ""}
                      onChange={(e) => debouncedHandleChange("discountPrice", e.target.value, index)}
                      className="mt-2 font-medium text-sm md:text-base border-b p-2 w-full focus:ring-2 transition-all duration-200 ease-in-out"
                      placeholder="Price (ETB)"
                      style={{ color: themeColor, borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                      aria-label="Product Price"
                    />
                  </div>
                ) : (
                  <ProductCard data={product} hideShopLink={true} />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full text-base">No products available yet.</p>
          )}
        </div>
      </section>
      <section
        id="events"
        className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white rounded-xl shadow-md"
      >
        <h2
          className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 animate-slide-in-up"
          style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor }}
        >
          Running Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {updatedEvents && updatedEvents.length > 0 ? (
            updatedEvents.map((event, index) => (
              <div key={event._id} className="relative group overflow-hidden rounded-xl">
                {isEditing && !dismissedTooltips[`event-${index}`] && (
                  <div className="absolute -top-12 right-0 bg-white/95 backdrop-blur-lg shadow-sm rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center w-[200px] animate-slide-in-up">
                    <img
                      src={peac}
                      alt="Peacock"
                      className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                      aria-hidden="true"
                    />
                    <p className="font-medium">Edit event details here!</p>
                    <button
                      onClick={() => dismissTooltip(`event-${index}`)}
                      className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ focusRingColor: accentColor }}
                      aria-label="Dismiss Tooltip"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex flex-col justify-between">
                  {isEditing ? (
                    <div className="relative">
                      <label
                        htmlFor={`event-image-${index}`}
                        className="cursor-pointer block relative"
                        aria-label="Change Event Image"
                      >
                        <img
                          src={event.images?.[0]?.url ? `${backend_url}${event.images[0].url}` : "/Uploads/photo-image.jpg"}
                          alt={event.name || "Event"}
                          className="w-full h-44 object-cover rounded-lg transition-transform duration-300 ease-in-out hover:opacity-90"
                          onError={handleImageError}
                        />
                        <div className="absolute top-2 right-2 text-white text-xs px-3 py-1.5 rounded-full bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 ease-in-out shadow-sm flex items-center gap-1"
                             style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)` }}>
                          <FaCamera size={12} />
                          Change Image
                        </div>
                        <input
                          type="file"
                          id={`event-image-${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImage(e, "event", null, null, index)}
                        />
                      </label>
                      <div className="absolute bottom-4 left-4 text-white">
                        <input
                          type="text"
                          value={event.name || ""}
                          onChange={(e) => debouncedHandleEventChange("name", e.target.value, index)}
                          className="text-base font-semibold bg-transparent border-b p-2 w-full max-w-[200px] focus:ring-2 transition-all duration-200 ease-in-out"
                          placeholder="Event Name"
                          style={{ borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                          aria-label="Event Name"
                        />
                        <input
                          type="number"
                          value={event.discountPrice || ""}
                          onChange={(e) => debouncedHandleEventChange("discountPrice", e.target.value, index)}
                          className="text-sm mt-2 bg-transparent border-b p-2 w-full max-w-[200px] focus:ring-2 transition-all duration-200 ease-in-out"
                          placeholder="Price (ETB)"
                          style={{ borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                          aria-label="Event Price"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={event.images?.[0]?.url ? `${backend_url}${event.images[0].url}` : "/Uploads/photo-image.jpg"}
                        alt={event.name}
                        className="w-full h-44 object-cover rounded-lg transform transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-sm"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-50 group-hover:opacity-70 transition-all duration-300 ease-in-out"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-base md:text-lg font-semibold animate-slide-in-up" style={{ fontFamily: "'Quicksand', sans-serif", color: '#fff' }}>
                          {event.name}
                        </h3>
                        <p className="text-sm animate-slide-in-up delay-100" style={{ color: '#fff' }}>
                          {event.discountPrice || "N/A"} ETB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full text-base">No running events at the moment.</p>
          )}
        </div>
      </section>
      <section id="about" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white rounded-xl shadow-lg">
        <div className="relative text-center max-w-4xl mx-auto">
          {isEditing && !dismissedTooltips["about"] && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-sm rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center justify-center w-[200px] animate-slide-in-up">
              <img
                src={peac}
                alt="Peacock"
                className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                aria-hidden="true"
              />
              <p className="font-medium">Tell your shop’s story!</p>
              <button
                onClick={() => dismissTooltip("about")}
                className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{ focusRingColor: accentColor }}
                aria-label="Dismiss Tooltip"
              >
                ✕
              </button>
            </div>
          )}
          <h2
            className="text-2xl md:text-4xl font-semibold mb-6 md:mb-10 animate-slide-in-up"
            style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor }}
          >
            About {shopData?.shopName}
          </h2>
          <div>
            {isEditing ? (
              <textarea
                value={shopData?.description || ""}
                onChange={(e) => debouncedHandleChange("description", e.target.value)}
                className="text-base md:text-lg text-gray-600 border rounded-lg p-4 w-full max-w-3xl mx-auto h-40 resize-none focus:ring-2 transition-all duration-200 ease-in-out"
                placeholder="Enter your shop's story here"
                style={{ borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                aria-label="Shop Description"
              />
            ) : (
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto animate-slide-in-up delay-100">
                {shopData?.description}
              </p>
            )}
          </div>
        </div>
      </section>
      <section id="contact" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-white rounded-xl shadow-md">
        <div className="relative text-center max-w-2xl mx-auto">
          {isEditing && !dismissedTooltips["contact"] && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-sm rounded-lg px-4 py-2 text-sm text-gray-700 flex items-center justify-center w-[200px] animate-slide-in-up">
              <img
                src={peac}
                alt="Peacock"
                className="w-6 h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                aria-hidden="true"
              />
              <p className="font-medium">Update your contact details!</p>
              <button
                onClick={() => dismissTooltip("contact")}
                className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                style={{ focusRingColor: accentColor }}
                aria-label="Dismiss Tooltip"
              >
                ✕
              </button>
            </div>
          )}
          <h3
            className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 animate-slide-in-up"
            style={{ fontFamily: "'Quicksand', sans-serif", color: themeColor }}
          >
            Get in Touch
          </h3>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 md:mb-10 animate-slide-in-up delay-100">
            Reach out to us for inquiries or support!
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 animate-slide-in-up delay-200">
            <div className="group flex flex-col items-center transform transition-all duration-300 ease-in-out hover:-translate-y-1">
              <div className="bg-white p-4 rounded-full shadow-md border-2" style={{ borderColor: accentColor }}>
                <svg className="w-6 h-6 group-hover:scale-110 transition-all duration-300 ease-in-out" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: themeColor }}>
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={shopData?.contact?.email || ""}
                  onChange={(e) => debouncedHandleChange("contact.email", e.target.value)}
                  className="mt-2 text-base sm:text-sm md:text-base text-center group-hover:font-medium border-b p-2 w-full max-w-[200px] focus:ring-2 transition-all duration-200 ease-in-out"
                  placeholder="Enter email"
                  style={{ color: themeColor, borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                  required
                  aria-label="Email Address"
                />
              ) : (
                <a
                  href={`mailto:${shopData?.contact?.email}`}
                  className="mt-2 text-base sm:text-sm md:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ color: themeColor, focusRingColor: accentColor }}
                  aria-label="Email Us"
                >
                  Email Us
                </a>
              )}
            </div>
            <div className="group flex flex-col items-center transform transition-all duration-300 ease-in-out hover:-translate-y-1">
              <div className="bg-white p-4 rounded-full shadow-md border-2" style={{ borderColor: accentColor }}>
                <svg className="w-6 h-6 group-hover:scale-110 transition-all duration-300 ease-in-out" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: themeColor }}>
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.37-.27.25-.91-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.11 3 13.28 10.73 21 20.01 21c.71 0 .99-.63 .99-1.18v-5.67c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={shopData?.contact?.phoneNumber || ""}
                  onChange={(e) => debouncedHandleChange("contact.phoneNumber", e.target.value)}
                  className="mt-2 text-base sm:text-sm md:text-base text-center group-hover:font-medium border-b p-2 w-full max-w-[200px] focus:ring-2 transition-all duration-200 ease-in-out"
                  placeholder="Enter phone number"
                  style={{ color: themeColor, borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                  required
                  aria-label="Phone Number"
                />
              ) : (
                <a
                  href={`tel:${shopData?.contact?.phoneNumber}`}
                  className="mt-2 text-base sm:text-sm md:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ color: themeColor, focusRingColor: accentColor }}
                  aria-label="Call Us"
                >
                  Call Us
                </a>
              )}
            </div>
            <div className="group flex flex-col items-center transform transition-all duration-300 ease-in-out hover:-translate-y-1">
              <div className="bg-white p-4 rounded-full shadow-md border-2" style={{ borderColor: accentColor }}>
                <svg className="w-6 h-6 group-hover:scale-110 transition-all duration-300 ease-in-out" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: themeColor }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.25 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={shopData?.address || ""}
                  onChange={(e) => debouncedHandleChange("address", e.target.value)}
                  className="mt-2 text-base sm:text-sm md:text-base text-center group-hover:font-medium border-b p-2 w-full max-w-[200px] focus:ring-2 transition-all duration-200 ease-in-out"
                  placeholder="Enter address"
                  style={{ color: themeColor, borderColor: accentColor, boxShadow: `0 0 4px ${accentColor}1a` }}
                  required
                  aria-label="Address"
                />
              ) : (
                <a
                  href={shopData?.contact?.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-base sm:text-sm md:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ color: themeColor, focusRingColor: accentColor }}
                  aria-label="Visit Us"
                >
                  Visit Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      <button
        className="fixed bottom-10 right-4 md:bottom-10 md:right-4 w-12 h-12 text-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center z-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ background: "#ffc300", focusRingColor: "#ffc300" }}
        onClick={handleShare}
        aria-label="Share Shop"
      >
        <FaShareAlt className="w-5 h-5" />
      </button>
      <Footer />
      <style jsx="true" global>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        @keyframes fade-in-out { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes jump-infinite { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          25% { transform: translateY(-8px) rotate(3deg); } 
          50% { transform: translateY(0) rotate(-3deg); } 
          75% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes flap { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-4px) rotate(10deg); }
        }
        .animate-fade-in-out { animation: fade-in-out 0.8s ease-out; }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-in-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-in-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-in-out; }
        .animate-slide-in-up { animation: slide-in-up 0.6s ease-in-out; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-jump-infinite { animation: jump-infinite 0.6s ease-in-out infinite; }
        .animate-flap { animation: flap 1s ease-in-out infinite; }
        .delay-50 { animation-delay: 50ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        input, textarea { outline: none; transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out; }
        input:focus, textarea:focus { border-color: #1C3B3E; box-shadow: 0 0 4px #ffc3001a; }
        button:focus { outline: none; }
        a:hover { color: #1C3B3E; }
      `}</style>
    </div>
  );
};

export default FirstBasicWebEdit;