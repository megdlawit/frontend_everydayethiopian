import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import { server, backend_url } from "../../../../server";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../../Toast"; 
import { FaEdit, FaSave, FaTruck, FaTrash, FaGem, FaLeaf, FaStore, FaCamera, FaHandshake, FaPlus, FaPen, FaTimes, FaChevronDown, FaShareAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaTelegram, FaGlobe } from "react-icons/fa";
import Footer from "../../../Layout/Footer";
import peac from "../../../../Assests/images/peac.png";
import peacockL from "../../../../Assests/images/peacockl.png";
import ProPlanAbout from "./ProPlanAbout";
import ProPlanVideo from "./ProPlanVideo";
import ProPlanEvents from "./ProPlanEvents";
import ProPlanAllProducts from "./ProPlanAllProducts";
import ProPlanContact from "./ProPlanContact";
import ProductCard from "../../../Route/ProductCard/ProductCard";
import EventCard from "../../../Events/EventCard";

const FEATURE_ICONS = [
  { name: "Truck", component: FaTruck, label: "Fast Delivery" },
  { name: "Gem", component: FaGem, label: "Premium Quality" },
  { name: "Handshake", component: FaHandshake, label: "Trusted Service" },
  { name: "Leaf", component: FaLeaf, label: "Eco Friendly" },
  { name: "Store", component: FaStore, label: "Local Store" },
];

const SOCIAL_ICONS = [
  { name: "Facebook", component: FaFacebook, label: "Facebook" },
  { name: "Instagram", component: FaInstagram, label: "Instagram" },
  { name: "Twitter", component: FaTwitter, label: "Twitter" },
  { name: "WhatsApp", component: FaWhatsapp, label: "WhatsApp" },
  { name: "Telegram", component: FaTelegram, label: "Telegram" },
  { name: "Website", component: FaGlobe, label: "Website" },
];

const EditableText = ({ value, onChange, className, inputClassName, multiline = false, placeholder, isEditing, style }) => {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      if (className.includes('text-lg font-bold') || className.includes('text-4xl md:text-5xl') || className.includes('text-5xl md:text-7xl')) {
        inputRef.current.focus();
      }
    }
  }, [isEditing, className]);

  if (isEditing) {
    return (
      <span className={className}>
        {multiline ? (
          <textarea
            ref={inputRef}
            className={inputClassName}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={style}
          />
        ) : (
          <input
            ref={inputRef}
            className={inputClassName}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={style}
          />
        )}
      </span>
    );
  }
  return <span className={className}>{value || placeholder}</span>;
};

const EditableImage = ({ src, onChange, className, imgClassName, isEditing }) => {
  const fileInput = React.useRef();
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };
  return (
    <span className={`${className} relative inline-block`}>
      <img
        src={src || "/Uploads/placeholder-image.jpg"}
        alt=""
        className={`${imgClassName} bg-white shadow`}
        onError={(e) => (e.target.src = "/Uploads/placeholder-image.jpg")}
      />
      {isEditing && (
        <>
          <span
            className="absolute bottom-0 right-0 bg-[#FAC50C] p-2 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => fileInput.current.click()}
          >
            <FaCamera size={18} className="text-white" />
          </span>
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" ref={fileInput} onChange={handleChange} />
        </>
      )}
    </span>
  );
};

const ProPlanHero = ({ shop, isEditing, handleShopChange, handleImage, fieldErrors }) => {
  let bgImage = "/Uploads/placeholder-image.jpg";
  if (shop?.heroImage?.url && shop.heroImage.url !== "") {
    bgImage = shop.heroImage.url.startsWith("http") || shop.heroImage.url.startsWith("blob:")
      ? shop.heroImage.url
      : `${backend_url}${shop.heroImage.url}`;
  }

  const title = shop?.heroTagline || "Livii Golds\nJewellery";
  const navigate = useNavigate();
  const { id } = useParams();

  const [inView, setInView] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        setInView(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [headerBg, setHeaderBg] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setHeaderBg(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToVideoShop = () => {
    const section = document.getElementById("video-shop-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={heroRef}
      className={`relative w-full h-[70vh] sm:h-[80vh] md:h-[100vh] bg-cover bg-center transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/30 z-10" />
      <header
        className={`w-full left-0 z-40 transition-all duration-500 ${
          headerBg ? "shadow-md fixed" : "absolute"
        }`}
        style={{
          top: 0,
          backdropFilter: headerBg ? "blur(8px)" : "none",
          backgroundColor: headerBg
            ? "rgba(249,246,242,0.85)"
            : "rgba(0,0,0,0.0)",
          transition: "background-color 0.5s, backdrop-filter 0.5s",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 sm:px-6">
          <button
            className="text-white text-sm sm:text-base font-light bg-transparent hover:text-[#cc9a00] transition-all z-50"
            style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <div className="flex-1 flex justify-center items-center min-w-0 gap-2 sm:gap-4 relative">
            {isEditing ? (
              <>
                <EditableImage
                  src={shop?.logo || "/Uploads/placeholder-image.jpg"}
                  onChange={(file) => handleImage(file, "logo")}
                  className="cursor-pointer block relative z-50"
                  imgClassName="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200"
                  isEditing={isEditing}
                />
                <EditableText
                  value={shop?.name || ""}
                  onChange={(value) => handleShopChange("name", value)}
                  className="text-white text-base sm:text-lg font-bold z-50"
                  inputClassName={`text-white text-base sm:text-lg font-bold bg-transparent border ${fieldErrors.name ? "border-red-500" : "border-gray-400"} focus:outline-none rounded py-1 border-b-4 text-center`}
                  placeholder="Shop Name"
                  style={{ background: 'transparent' }}
                  isEditing={isEditing}
                />
              </>
            ) : (
              <>
                <img
                  src={shop?.logo || "/Uploads/placeholder-image.jpg"}
                  alt="Shop Logo"
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200 z-50"
                  onError={(e) => (e.target.src = "/Uploads/placeholder-image.jpg")}
                />
                <span className="text-white text-base sm:text-lg font-bold z-50 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none" style={{ fontFamily: "'AvenirLTStd', sans-serif" }}>
                  {shop?.name || "Shop Name"}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="text-white border border-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-light bg-transparent hover:border-[#cc9a00] hover:text-[#cc9a00] transition-all z-50 text-xs sm:text-sm"
              style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
              onClick={() => navigate(`/proplan/${id}/all-products`)}
            >
              All Shop
            </button>
          </div>
        </div>
      </header>
      <div className="absolute inset-0 flex flex-col items-center mb-2 mt-16 sm:mt-20 justify-center text-center z-20 px-4">
        {isEditing ? (
          <>
            <EditableText
              value={shop?.heroTagline || ""}
              onChange={(value) => handleShopChange("heroTagline", value)}
              className="w-full flex justify-center mt-4"
              inputClassName="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white px-4 sm:px-6 py-3 sm:py-4 mt-4 bg-transparent border border-gray-400 focus:outline-none w-full max-w-4xl mx-auto text-center rounded border-b-4 leading-relaxed font-bold"
              placeholder="Enter your shop's hero tagline"
              style={{ background: 'transparent', minHeight: '3rem', width: '100%', maxWidth: '48rem' }}
              isEditing={isEditing}
            />
            <EditableText
              value={shop?.heroDescription || ""}
              onChange={(value) => handleShopChange("heroDescription", value)}
              className="w-full flex justify-center mt-4"
              inputClassName="mt-3 sm:mt-4 text-sm sm:text-lg md:text-2xl text-white font-light bg-transparent border border-gray-400 focus:outline-none w-full max-w-4xl mx-auto rounded border-b-4 px-4 sm:px-6 py-3 sm:py-4"
              placeholder="Enter your shop's hero description"
              multiline
              style={{ background: 'transparent', width: '100%', maxWidth: '48rem', minHeight: '2.5rem' }}
              isEditing={isEditing}
            />
            <div className="mt-4 flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                id="hero-image-upload"
                className="hidden"
                onChange={(e) => handleImage(e.target.files[0], "hero")}
              />
              <label
                htmlFor="hero-image-upload"
                className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded cursor-pointer text-xs sm:text-sm shadow flex items-center gap-1 sm:gap-2"
                style={{ fontFamily: "'Avenir LT Std', 'Lato', sans-serif" }}
              >
                <FaCamera size={14} className="sm:w-4 sm:h-4" />
                Update Hero Background
              </label>
            </div>
          </>
        ) : (
          <>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white font-serif drop-shadow-lg whitespace-pre-line w-full sm:w-3/4 md:w-1/2"
              style={{
                fontFamily: "'Quesha', serif",
                letterSpacing: "0.04em",
                maxWidth: "50rem",
              }}
            >
              {title}
            </h1>
            <p
              className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-lg text-white font-light max-w-xs sm:max-w-xl mb-12 sm:mb-20 px-4"
              style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
            >
              {shop?.heroDescription || "Transforming interiors with personalized design, turning your vision into a reality both indoors and outdoors."}
            </p>
          </>
        )}
        <button
          className="flex mt-12 sm:mt-20 items-center justify-center h-[3rem] sm:h-[4rem] p-2 border-2 border-white text-white rounded-full text-xl hover:border-[#cc9a00] hover:text-[#cc9a00] transition-all duration-300 transform hover:scale-105"
          style={{ fontFamily: "'AvenirLTStd', sans-serif" }}
          onClick={scrollToVideoShop}
          aria-label="Scroll to Video Shop"
        >
          <FaChevronDown />
        </button>
      </div>
    </div>
  );
};

function getLogoUrl(logo, backend_url) {
  if (!logo || logo === '' || logo === '/Uploads/placeholder-image.jpg') return '/Uploads/placeholder-image.jpg';
  if (logo.startsWith('http') || logo.startsWith('blob:')) return logo;
  return `${backend_url}${logo}`;
}

function normalizeProduct(product, backend_url) {
  return {
    ...product,
    images: (product.images || []).map(img => ({
      url: img.url && (img.url.startsWith('http') || img.url.startsWith('blob:')) ? img.url : `${backend_url}${img.url}`
    })),
    video: product.video ? (product.video.startsWith('http') || product.video.startsWith('blob:') ? product.video : `${backend_url}${product.video}`) : null,
    newVideoFile: null,
    newVideoPreview: null,
    newImageFile: null,
  };
}

function normalizeEvent(event, backend_url) {
  return {
    ...event,
    images: (event.images || []).map(img => ({
      url: img.url && (img.url.startsWith('http') || img.url.startsWith('blob:')) ? img.url : `${backend_url}${img.url}`
    })),
    newImageFile: null,
  };
}

const ProPlanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [deletedProductIds, setDeletedProductIds] = useState(new Set());
  const [deletedEventIds, setDeletedEventIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [dismissedTooltips, setDismissedTooltips] = useState({});
  const [showEditTooltip, setShowEditTooltip] = useState(false);
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showHeroGuide, setShowHeroGuide] = useState(false);
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const [showProductsGuide, setShowProductsGuide] = useState(false);
  const [showEventsGuide, setShowEventsGuide] = useState(false);
  const [showAboutGuide, setShowAboutGuide] = useState(false);
  const [showContactGuide, setShowContactGuide] = useState(false);
  const [headerBg, setHeaderBg] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [showSaveCancel, setShowSaveCancel] = useState(false);

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false,
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setHeaderBg(window.scrollY > 40);
    };

    if (isEditing) {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.overflow = showGuide ? 'hidden' : 'auto';
    } else {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      document.documentElement.style.scrollBehavior = 'smooth';
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      document.documentElement.style.scrollBehavior = 'smooth';
      document.body.style.overflow = 'auto';
    };
  }, [isEditing, showGuide]);

  const fetchShopData = async () => {
    try {
      const shopRes = await api.get(`${server}/shop/get-shop-info/${id}`, { withCredentials: true });
      if (!shopRes?.data?.shop) {
        throw new Error("Shop response data is missing");
      }
      const shopRaw = shopRes.data.shop;
      setShopData({
        ...shopRaw,
        logo: getLogoUrl(shopRaw.avatar?.url, backend_url),
        heroImage: shopRaw.heroImage?.url ? { url: getLogoUrl(shopRaw.heroImage.url, backend_url) } : { url: "/Uploads/placeholder-image.jpg" },
        aboutImage: shopRaw.aboutImage?.url ? { url: getLogoUrl(shopRaw.aboutImage.url, backend_url) } : { url: "/Uploads/placeholder-image.jpg" },
        features: Array.isArray(shopRaw.features) ? shopRaw.features : [],
        socialMedias: Array.isArray(shopRaw.socialMedias) ? shopRaw.socialMedias : [],
      });

      const productsRes = await api.get(`${server}/product/get-all-products-shop/${id}`, { withCredentials: true });
      if (!productsRes?.data?.products) {
        throw new Error("Products response data is missing");
      }
      setProducts(productsRes.data.products.map(p => normalizeProduct(p, backend_url)));

      const eventsRes = await api.get(`${server}/event/get-all-events/${id}`, { withCredentials: true });
      if (!eventsRes?.data?.events) {
        throw new Error("Events response data is missing");
      }
      setEvents(eventsRes.data.events.map(e => normalizeEvent(e, backend_url)));
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        showToast("error", "Authentication Required", "Authentication required. Please log in.");
        navigate("/login");
        return;
      }
      showToast("error", "Load Failed", `Failed to load data: ${err.message}`);
      setShopData(null);
      setProducts([]);
      setEvents([]);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setDeletedProductIds(new Set());
      setDeletedEventIds(new Set());
      try {
        await fetchShopData();
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const handleShopChange = (field, value) => {
    setShopData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleProductChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleEventChange = (id, field, value) => {
    setEvents((prev) =>
      prev.map((e) =>
        e._id === id ? { ...e, [field]: value } : e
      )
    );
  };

  const handleImage = async (file, type, id) => {
    if (!file) {
      showToast("info", "No File", "No file selected.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("error", "Invalid File", "Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File Too Large", "Image size must be less than 5MB.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      if (type === "hero") {
        setHeroImageFile(file);
        setShopData((prev) => ({
          ...prev,
          heroImage: { url: previewUrl },
        }));
      } else if (type === "about") {
        setAboutImageFile(file);
        setShopData((prev) => ({
          ...prev,
          aboutImage: { url: previewUrl },
        }));
      } else if (type === "product") {
        setProducts((prev) => {
          const copy = [...prev];
          const index = copy.findIndex((p) => p._id === id);
          if (index !== -1) {
            copy[index] = {
              ...copy[index],
              images: [{ url: previewUrl }],
              newImageFile: file,
            };
          }
          return copy;
        });
      } else if (type === "event") {
        setEvents((prev) => {
          const copy = [...prev];
          const index = copy.findIndex((e) => e._id === id);
          if (index !== -1) {
            copy[index] = {
              ...copy[index],
              images: [{ url: previewUrl }],
              newImageFile: file,
            };
          }
          return copy;
        });
      } else if (type === "logo") {
        setShopData((prev) => ({
          ...prev,
          logo: previewUrl,
          newLogoFile: file,
        }));
      }
      showToast("success", `${type.charAt(0).toUpperCase() + type.slice(1)} Image`, `${type.charAt(0).toUpperCase() + type.slice(1)} image selected for upload.`);
    } catch (error) {
      showToast("error", "Process Failed", `Failed to process ${type} image: ${error.message}`);
    }
  };

  const handleFeatureChange = (index, field, value) => {
    setShopData((prev) => {
      const newFeatures = [...(prev.features || [])];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      return { ...prev, features: newFeatures };
    });
  };

  const addFeature = () => {
    setShopData((prev) => {
      if ((prev.features || []).length >= 4) return prev;
      return {
        ...prev,
        features: [
          ...(prev.features || []),
          { title: '', icon: FEATURE_ICONS[0].name },
        ],
      };
    });
    setShowFeatureGuide(true);
  };

  const removeFeature = (index) => {
    setShopData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    setShopData((prev) => {
      const newSocialMedias = [...(prev.socialMedias || [])];
      newSocialMedias[index] = { ...newSocialMedias[index], [field]: value };
      if (field === "icon") {
        newSocialMedias[index].platform = value;
      }
      return { ...prev, socialMedias: newSocialMedias };
    });
  };

  const addSocialMedia = () => {
    setShopData((prev) => ({
      ...prev,
      socialMedias: [
        ...(prev.socialMedias || []),
        { platform: SOCIAL_ICONS[0].name, icon: SOCIAL_ICONS[0].name, url: "" },
      ],
    }));
  };

  const removeSocialMedia = (index) => {
    setShopData((prev) => ({
      ...prev,
      socialMedias: (prev.socialMedias || []).filter((_, i) => i !== index),
    }));
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    setDeletedProductIds((prev) => new Set([...prev, productId]));
    showToast("info", "Product Removed", "Product removed. It will be deleted if you save changes.");
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e._id !== eventId));
    setDeletedEventIds((prev) => new Set([...prev, eventId]));
    showToast("info", "Event Removed", "Event removed. It will be deleted if you save changes.");
  };

  const handleVideo = (file, productId) => {
    if (!file) {
      showToast("info", "No File", "No file selected.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      showToast("error", "Invalid File", "Please upload a video file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "File Too Large", "Video size must be less than 10MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setProducts((prev) => {
      const copy = [...prev];
      const index = copy.findIndex((p) => p._id === productId);
      if (index !== -1) {
        copy[index] = {
          ...copy[index],
          newVideoFile: file,
          newVideoPreview: previewUrl,
        };
      }
      return copy;
    });
    showToast("success", "Video Selected", "Video selected for upload.");
  };

  const handleSave = async () => {
    const errors = {};
    if (!shopData?.name) errors.name = true;
    if (!shopData?.address) errors.address = true;
    if (!shopData?.phoneNumber) errors.phoneNumber = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast("error", "Validation Error", "Name, address, and phone number are required.");
      setGuideStep(0);
      setShowGuide(true);
      return;
    }

    setSaving(true);
    try {
      // Update shop avatar
      if (shopData.newLogoFile) {
        try {
          const formData = new FormData();
          formData.append("avatar", shopData.newLogoFile);
          const response = await api.put(`${server}/shop/update-shop-avatar`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          });
          setShopData((prev) => ({
            ...prev,
            logo: `${backend_url}${response.data.seller.avatar.url}`,
            newLogoFile: null,
          }));
          showToast("success", "Logo Updated", "Shop logo updated successfully!");
        } catch (error) {
          console.error("Logo update error:", error);
          showToast("error", "Logo Update Failed", `Failed to update logo: ${error.response?.data?.message || error.message}`);
        }
      }

      // Update hero and about images
      try {
        const heroAboutFormData = new FormData();
        heroAboutFormData.append("heroTagline", shopData.heroTagline || "");
        heroAboutFormData.append("heroDescription", shopData.heroDescription || "");
        if (heroImageFile) heroAboutFormData.append("heroImage", heroImageFile);
        if (aboutImageFile) heroAboutFormData.append("aboutImage", aboutImageFile);
        heroAboutFormData.append("features", JSON.stringify(shopData.features || []));

        const heroAboutRes = await api.put(`${server}/shop/update-hero-about`, heroAboutFormData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const { heroImage, aboutImage } = heroAboutRes.data.shop;
        setShopData((prev) => ({
          ...prev,
          heroImage: heroImage?.url ? { url: `${backend_url}${heroImage.url}` } : prev.heroImage,
          aboutImage: aboutImage?.url ? { url: `${backend_url}${aboutImage.url}` } : prev.aboutImage,
        }));
        setHeroImageFile(null);
        setAboutImageFile(null);
        showToast("success", "Images Updated", "Hero and about images updated successfully!");
      } catch (error) {
        console.error("Hero/about update error:", error);
        showToast("error", "Images Update Failed", `Failed to update hero/about: ${error.response?.data?.message || error.message}`);
      }

      // Update shop info
      try {
        const payload = {
          name: shopData.name,
          description: shopData.description || "",
          address: shopData.address,
          phoneNumber: shopData.phoneNumber,
          heroTagline: shopData.heroTagline || "",
          heroDescription: shopData.heroDescription || "",
          features: shopData.features || [],
          socialMedias: shopData.socialMedias || [],
          contactDescription: shopData.contactDescription || "",
        };

        await api.put(`${server}/shop/update-seller-info`, payload, { withCredentials: true });
        showToast("success", "Info Updated", "Shop info updated successfully!");
      } catch (error) {
        console.error("Shop info update error:", error);
        showToast("error", "Info Update Failed", `Failed to update shop info: ${error.response?.data?.message || error.message}`);
      }

      // Update products
      if (products.length > 0) {
        const updatedProductsList = await Promise.all(
          products.map(async (product) => {
            if (!product.name) {
              showToast("error", "Missing Name", `Product name is required for "${product.name || 'Unnamed Product'}"`);
              return null;
            }
            const productFormData = new FormData();
            productFormData.append("name", product.name || "");
            productFormData.append("discountPrice", product.discountPrice || "");
            productFormData.append("description", product.description || "");
            if (product.category && product.category !== "") {
              productFormData.append("category", product.category);
            }
            productFormData.append("stock", product.stock || 0);
            if (product.newImageFile) {
              productFormData.append("images", product.newImageFile);
            }
            if (product.newVideoFile) {
              productFormData.append("video", product.newVideoFile);
            }

            try {
              const response = await api.put(`${server}/product/edit-product/${product._id}`, productFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
              });
              console.log(`Product "${product.name}" updated:`, response.data.product);
              showToast("success", `Product Updated`, `Product "${product.name}" updated successfully!`);
              return normalizeProduct(response.data.product, backend_url);
            } catch (error) {
              console.error(`Product update error for "${product.name}":`, error);
              showToast("error", "Product Update Failed", `Failed to update product "${product.name}": ${error.response?.data?.message || error.message}`);
              return null;
            }
          })
        );

        const validProducts = updatedProductsList.filter((p) => p !== null);
        if (validProducts.length > 0) {
          setProducts(validProducts);
          showToast("success", "Products Updated", `${validProducts.length} product(s) updated successfully!`);
        } else {
          showToast("error", "No Updates", "No products were updated successfully.");
        }
      } else {
        console.log("No products to update.");
      }

      // Delete products
      if (deletedProductIds.size > 0) {
        await Promise.all(
          Array.from(deletedProductIds).map(async (productId) => {
            try {
              await axios.delete(`${server}/product/delete-shop-product/${productId}`, { withCredentials: true });
            } catch (error) {
              console.error(`Failed to delete product ${productId}:`, error);
            }
          })
        );
        showToast("success", "Products Deleted", `${deletedProductIds.size} product(s) deleted successfully!`);
      }

      // Update events
      if (events.length > 0) {
        const updatedEventsList = await Promise.all(
          events.map(async (event) => {
            const eventFormData = new FormData();
            eventFormData.append("name", event.name || "");
            eventFormData.append("discountPrice", event.discountPrice || "");
            eventFormData.append("description", event.description || "");
            if (event.category && event.category !== "") {
              eventFormData.append("category", event.category);
            }
            eventFormData.append("stock", event.stock || 0);
            if (event.newImageFile) {
              eventFormData.append("images", event.newImageFile);
            }

            try {
              const response = await api.put(`${server}/event/edit-event/${event._id}`, eventFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
              });
              showToast("success", `Event Updated`, `Event "${event.name}" updated successfully!`);
              return normalizeEvent(response.data.event, backend_url);
            } catch (error) {
              console.error(`Event update error for "${event.name}":`, error);
              showToast("error", "Event Update Failed", `Failed to update event "${event.name}": ${error.response?.data?.message || error.message}`);
              return null;
            }
          })
        );

        const validEvents = updatedEventsList.filter((e) => e !== null);
        if (validEvents.length > 0) {
          setEvents(validEvents);
        }
      }

      // Delete events
      if (deletedEventIds.size > 0) {
        await Promise.all(
          Array.from(deletedEventIds).map(async (eventId) => {
            try {
              await axios.delete(`${server}/event/delete-shop-event/${eventId}`, { withCredentials: true });
            } catch (error) {
              console.error(`Failed to delete event ${eventId}:`, error);
            }
          })
        );
        showToast("success", "Events Deleted", `${deletedEventIds.size} event(s) deleted successfully!`);
      }

      setDeletedProductIds(new Set());
      setDeletedEventIds(new Set());

      showToast("success", "Changes Saved", "All changes saved successfully!");
      setIsEditing(false);
      setShowGuide(false);
      setShowSaveCancel(false);
      setShowLogoTooltip(false);
      setShowNameTooltip(false);
      setShowHeroGuide(false);
      setShowVideoGuide(false);
      setShowProductsGuide(false);
      setShowEventsGuide(false);
      setShowAboutGuide(false);
      setShowContactGuide(false);
    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.status === 401) {
        showToast("error", "Authentication Required", "Authentication required. Please log in.");
        navigate("/login");
        return;
      }
      showToast("error", "Save Failed", `Failed to save changes: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    setHeroImageFile(null);
    setAboutImageFile(null);
    setShowGuide(false);
    setShowSaveCancel(false);
    setShowLogoTooltip(false);
    setShowNameTooltip(false);
    setShowHeroGuide(false);
    setShowVideoGuide(false);
    setShowProductsGuide(false);
    setShowEventsGuide(false);
    setShowAboutGuide(false);
    setShowContactGuide(false);
    setShowEditOverlay(false);
    setDeletedProductIds(new Set());
    setDeletedEventIds(new Set());
    const fetchAll = async () => {
      try {
        await fetchShopData();
      } catch (err) {
        console.error("Cancel fetch error:", err);
        if (err.response?.status === 401) {
          showToast("error", "Authentication Required", "Authentication required. Please log in.");
          navigate("/login");
          return;
        }
        showToast("error", "Reset Failed", `Failed to reset shop data: ${err.message}`);
        setShopData(null);
        setProducts([]);
        setEvents([]);
      }
    };
    fetchAll();
    showToast("info", "Edit Canceled", "Editing canceled. Changes discarded.");
  };

  const handleNextGuideStep = () => {
    if (guideStep < 5) setGuideStep(guideStep + 1);
  };

  const handlePrevGuideStep = () => {
    if (guideStep > 0) setGuideStep(guideStep - 1);
  };

  const closeGuide = () => {
    setShowGuide(false);
    setGuideStep(0);
    setShowLogoTooltip(false);
    setShowNameTooltip(false);
    setShowHeroGuide(false);
    setShowVideoGuide(false);
    setShowProductsGuide(false);
    setShowEventsGuide(false);
    setShowAboutGuide(false);
    setShowContactGuide(false);
    setShowSaveCancel(true);
  };

  const dismissTooltip = (key) => {
    setDismissedTooltips((prev) => ({ ...prev, [key]: true }));
    if (key === "logo") setShowLogoTooltip(false);
    if (key === "name") setShowNameTooltip(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: shopData?.name ? `${shopData.name} - Shop` : "Shop",
          text: shopData?.heroTagline || "Check out this shop!",
          url,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showToast("success", "URL Copied", "Shop URL copied to clipboard!");
        })
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => {
      const newEditingState = !prev;
      if (newEditingState) {
        setShowEditOverlay(true);
        setShowGuide(true);
        setGuideStep(0);
        setShowSaveCancel(false);
        setTimeout(() => setShowEditOverlay(false), 3000);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 0);
      } else {
        setShowGuide(false);
        setShowSaveCancel(false);
        setGuideStep(0);
      }
      return newEditingState;
    });
  };

  if (loading || !shopData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fff] relative">
      {showGuide && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs sm:max-w-md w-full p-4 sm:p-6 relative animate-bounce-in">
            <button
              onClick={closeGuide}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              aria-label="Close Guide"
            >
              ✕
            </button>
            <div className="flex flex-col items-center text-center">
              <img src={peac} alt="Peacock Guide" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover animate-jump-infinite mb-2" aria-hidden="true" />
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: "'Quicksand', sans-serif", color: "#1C3B3E" }}>
                Hello Let's Edit Your Shop!
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-4">
                <div
                  className="bg-[#FAC50C] h-2 sm:h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((guideStep + 1) / 6) * 100}%` }}
                ></div>
              </div>
              {guideStep === 0 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 1: Edit your shop's name and hero section!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Click the logo or hero section to start editing—let's make your shop shine!</p>
                </div>
              )}
              {guideStep === 1 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 2: Edit your products and images!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Update or delete products by clicking images or details—add some flair!</p>
                </div>
              )}
              {guideStep === 2 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 3: Edit your events!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Update or delete events with new images and info—wow your visitors!</p>
                </div>
              )}
              {guideStep === 3 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 4: Edit your About section and features!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Tell the world about your shop by updating the 'About' section and features!</p>
                </div>
              )}
              {guideStep === 4 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 5: Edit your Contact section and social media!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Update your contact info and social media links—make it easy to reach you!</p>
                </div>
              )}
              {guideStep === 5 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 6: Save or cancel your changes!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Review your changes and save them or cancel to revert!</p>
                </div>
              )}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={handlePrevGuideStep}
                  className={`flex items-center justify-center text-gray-500 px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-none hover:text-gray-700 transition-all duration-300 ease-in-out ${guideStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={guideStep === 0}
                  aria-label="Previous Step"
                >
                  <svg width="16" height="16" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {guideStep < 5 ? (
                  <button
                    onClick={handleNextGuideStep}
                    className="text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base"
                    style={{ background: "#ffc300" }}
                    aria-label="Next Step"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={closeGuide}
                    className="text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base"
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
      <div
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col items-center"
        onMouseEnter={() => setShowEditTooltip(true)}
        onMouseLeave={() => setShowEditTooltip(false)}
      >
        <img
          src={peac}
          alt="Peacock"
          className="w-14 h-10 sm:w-20 sm:h-14 rounded-full object-cover mb-2 animate-jump-infinite"
          aria-hidden="true"
          style={{ width: "100%", height: "100%", maxWidth: "80px", maxHeight: "56px" }}
        />
        <button
          onClick={handleEditToggle}
          className="text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out"
          style={{ background: `#ffc300` }}
          aria-label="Toggle Edit Mode"
        >
          <FaPen size={16} className="sm:w-4 sm:h-4" />
        </button>
        {showEditTooltip && (
          <div className="absolute top-full mt-2 right-1/2 transform translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 flex items-center w-[160px] sm:w-[200px] animate-slide-in-up z-50">
            <img
              src={peac}
              alt="Peacock Guide"
              className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover mr-2 animate-jump-infinite"
              aria-hidden="true"
            />
            <p className="font-medium">Click to {isEditing ? "exit" : "enter"} edit mode</p>
          </div>
        )}
      </div>
      {isEditing && showSaveCancel && (
        <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-6 animate-bounce-in">
            <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: "'Quicksand', sans-serif", color: "#1C3B3E" }}>
              Save or cancel changes?
            </h3>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                onClick={handleCancel}
                className="text-gray-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
                aria-label="Cancel Edit"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ background: "#ffc300" }}
                aria-label="Save Changes"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditing ? (
        <>
          <div className="relative" onMouseEnter={() => setShowHeroGuide(true)} onMouseLeave={() => setShowHeroGuide(false)}>
            <ProPlanHero
              shop={shopData}
              isEditing={isEditing}
              handleShopChange={handleShopChange}
              handleImage={handleImage}
              fieldErrors={fieldErrors}
            />
            {showHeroGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-[60] animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your hero section here!</span>
              </div>
            )}
          </div>
          <section id="video-shop-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white rounded-2xl mt-4 relative" onMouseEnter={() => setShowVideoGuide(true)} onMouseLeave={() => setShowVideoGuide(false)}>
            <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
              Video Shopping
            </h2>
            {showVideoGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your video products here!</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {products.filter(product => product.video || product.newVideoPreview).length > 0 ? (
                products
                  .filter(product => product.video || product.newVideoPreview)
                  .map((product) => (
                    <div key={product._id} className="bg-white p-3 sm:p-4 rounded-xl shadow-lg w-full max-w-xs sm:max-w-none relative">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="absolute top-2 right-2 z-10 bg-white text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all shadow-none"
                        title="Delete Video Product"
                      >
                        <FaTimes size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <div className="relative">
                        <video
                          src={
                            product.newVideoPreview
                              ? product.newVideoPreview
                              : product.video
                                ? (product.video.startsWith('blob:') || product.video.startsWith('http')
                                    ? product.video
                                    : `${backend_url}${product.video}`)
                                : "/Uploads/placeholder-video.mp4"
                          }
                          controls
                          className="w-full h-40 sm:h-48 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            console.error("Video error:", e);
                            e.target.src = "/Uploads/placeholder-video.mp4";
                          }}
                        />
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="file"
                            accept="video/*"
                            id={`product-video-upload-${product._id}`}
                            className="hidden"
                            onChange={(e) => handleVideo(e.target.files[0], product._id)}
                          />
                          <label
                            htmlFor={`product-video-upload-${product._id}`}
                            className="bg-[#FAC50C] text-white px-2 py-1 rounded cursor-pointer text-xs shadow flex items-center gap-1"
                          >
                            <FaCamera size={12} className="sm:w-3.5 sm:h-3.5" />
                            Choose Video
                          </label>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={product.name || ''}
                        onChange={(e) => handleProductChange(product._id, "name", e.target.value)}
                        className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        style={{ background: 'transparent' }}
                        placeholder="Video Name"
                      />
                      <input
                        type="number"
                        value={product.discountPrice || ''}
                        onChange={(e) => handleProductChange(product._id, "discountPrice", e.target.value)}
                        className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        placeholder="Video Price (ETB)"
                        style={{ background: 'transparent' }}
                      />
                    </div>
                  ))
              ) : (
                <p className="text-gray-600 text-center col-span-full text-sm sm:text-base">No video products available yet.</p>
              )}
            </div>
          </section>

          <section id="products-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white rounded-2xl mt-4 relative" onMouseEnter={() => setShowProductsGuide(true)} onMouseLeave={() => setShowProductsGuide(false)}>
            <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
              Shop Our Collection
            </h2>
            {showProductsGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your products here!</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {products.length > 0 ? (
                products
                  .filter(product => !product.video && !product.newVideoPreview)
                  .slice(0, 4)
                  .map((product) => (
                    <div key={product._id} className="bg-white p-3 sm:p-4 rounded-xl shadow-lg w-full max-w-xs sm:max-w-none relative">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="absolute top-2 right-2 z-10 bg-white text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all shadow-none"
                        title="Delete Product"
                      >
                        <FaTimes size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <label className="cursor-pointer block relative">
                        <img
                          src={
                            product.images?.[0]?.url
                              ? (product.images[0].url.startsWith('blob:') || product.images[0].url.startsWith('http')
                                  ? product.images[0].url
                                  : `${backend_url}${product.images[0].url}`)
                              : "/Uploads/placeholder-image.jpg"
                          }
                          alt={product.name || "Product"}
                          className="w-full h-40 sm:h-48 object-cover rounded-lg"
                          onError={(e) => {
                            console.error("Image error:", e);
                            e.target.src = "/Uploads/placeholder-image.jpg";
                          }}
                        />
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="file"
                            accept="image/*"
                            id={`product-image-upload-${product._id}`}
                            className="hidden"
                            onChange={(e) => handleImage(e.target.files[0], "product", product._id)}
                          />
                          <label
                            htmlFor={`product-image-upload-${product._id}`}
                            className="bg-[#FAC50C] text-white px-2 py-1 rounded cursor-pointer text-xs shadow flex items-center gap-1"
                          >
                            <FaCamera size={12} className="sm:w-3.5 sm:h-3.5" />
                            Choose Image
                          </label>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={product.name || ''}
                        onChange={(e) => handleProductChange(product._id, "name", e.target.value)}
                        className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        style={{ background: 'transparent' }}
                        placeholder="Product Name"
                      />
                      <input
                        type="number"
                        value={product.discountPrice || ''}
                        onChange={(e) => handleProductChange(product._id, "discountPrice", e.target.value)}
                        className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        placeholder="Price (ETB)"
                        style={{ background: 'transparent' }}
                      />
                    </div>
                  ))
              ) : (
                <p className="text-gray-600 text-center col-span-full text-sm sm:text-base">No products available yet.</p>
              )}
            </div>
          </section>
          <section id="events-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white mt-2 relative" onMouseEnter={() => setShowEventsGuide(true)} onMouseLeave={() => setShowEventsGuide(false)}>
            <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
              Running Events
            </h2>
            {showEventsGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your events here!</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
              {events.length > 0 ? (
                events.slice(0, 3).map((event, idx) => (
                  <div key={event._id} className="bg-white p-3 sm:p-4 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm relative">
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="absolute top-2 right-2 z-10 bg-white text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all shadow-none"
                      title="Delete Event"
                    >
                      <FaTimes size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <label className="cursor-pointer block relative">
                      <img
                        src={
                          event.images?.[0]?.url
                            ? (event.images[0].url.startsWith('blob:') || event.images[0].url.startsWith('http')
                              ? event.images[0].url
                              : `${backend_url}${event.images[0].url}`)
                            : "/Uploads/photo-image.jpg"
                        }
                        alt={event.name}
                        className="w-full h-36 sm:h-44 object-cover rounded-lg"
                        onError={(e) => (e.target.src = "/Uploads/photo-image.jpg")}
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="file"
                          accept="image/*"
                          id={`event-image-upload-${event._id}`}
                          className="hidden"
                          onChange={(e) => handleImage(e.target.files[0], "event", event._id)}
                        />
                        <label
                          htmlFor={`event-image-upload-${event._id}`}
                          className="bg-[#FAC50C] text-white px-2 py-1 rounded cursor-pointer text-xs shadow flex items-center gap-1"
                        >
                          <FaCamera size={12} className="sm:w-3.5 sm:h-3.5" />
                          Choose Image
                        </label>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={event.name || ''}
                      onChange={(e) => handleEventChange(event._id, "name", e.target.value)}
                      className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                      style={{ background: 'transparent' }}
                      placeholder="Event Name"
                    />
                    <input
                      type="number"
                      value={event.discountPrice || ''}
                      onChange={(e) => handleEventChange(event._id, "discountPrice", e.target.value)}
                      className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                      placeholder="Price (ETB)"
                      style={{ background: 'transparent' }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-full text-sm sm:text-base">No running events at the moment.</p>
              )}
            </div>
          </section>
          <section id="about-section" className="w-full flex flex-col md:flex-row min-h-[500px] relative" style={{ background: '#f5f3ef' }} onMouseEnter={() => setShowAboutGuide(true)} onMouseLeave={() => setShowAboutGuide(false)}>
            {showAboutGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your about section here!</span>
              </div>
            )}
            <div className="w-full flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-auto relative flex flex-col">
                <EditableImage
                  src={shopData.aboutImage?.url || "/Uploads/placeholder-image.jpg"}
                  onChange={(file) => handleImage(file, "about")}
                  imgClassName="w-full h-full object-cover object-center"
                  className="cursor-pointer block relative flex-1"
                  isEditing={isEditing}
                  style={{ minHeight: '300px', maxHeight: '600px' }}
                />
                {isEditing && (
                  <div className="mt-2 flex justify-center px-4">
                    <input
                      type="file"
                      accept="image/*"
                      id="about-image-upload"
                      className="hidden"
                      onChange={(e) => handleImage(e.target.files[0], "about")}
                    />
                    <label
                      htmlFor="about-image-upload"
                      className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded cursor-pointer text-xs sm:text-sm shadow flex items-center gap-1 sm:gap-2"
                      style={{ fontFamily: "'Avenir LT Std', 'Lato', sans-serif" }}
                    >
                      <FaCamera size={14} className="sm:w-4 sm:h-4" />
                      Update About Image
                    </label>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-[#1C3B3E] text-white p-6 sm:p-8" style={{ minHeight: '400px' }}>
                <div className="w-full flex flex-col items-center text-center gap-4 sm:gap-6 px-4 max-w-2xl">
                  <EditableText
                    value={shopData.name || ""}
                    onChange={(value) => handleShopChange("name", value)}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                    inputClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white text-center bg-transparent border-none border-b-2 border-gray-400 focus:outline-none focus:border-gray-500 w-full"
                    placeholder="About Shop"
                    style={{ fontFamily: "'Quesha', serif", background: 'transparent' }}
                    isEditing={isEditing}
                  />
                  <EditableText
                    value={shopData.description || ""}
                    onChange={(value) => handleShopChange("description", value)}
                    className="text-xs sm:text-sm md:text-lg font-thin text-white/60 mb-4 w-full"
                    inputClassName="text-xs sm:text-sm md:text-lg font-thin text-white/60 mb-4 bg-white/10 border-2 border-white/20 rounded-lg p-3 sm:p-4 focus:outline-none focus:border-[#FAC50C] focus:bg-white/20 w-full resize-y"
                    placeholder="Enter your shop's story here..."
                    multiline
                    style={{
                      fontFamily: "'AvenirLTStd', sans-serif",
                      letterSpacing: '0.01em',
                      minHeight: '100px',
                      width: '100%',
                      maxWidth: '100%',
                      lineHeight: '1.6'
                    }}
                    isEditing={isEditing}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-6 w-full max-w-md">
                    {(shopData.features || []).map((feature, idx) => (
                      <div key={idx} className="border border-white/20 p-3 sm:p-4 rounded-lg text-xs sm:text-base bg-white/10 backdrop-blur-sm flex items-center justify-between gap-2">
                        <div className="flex gap-1 items-center relative">
                          {isEditing && (
                            <select
                              value={feature.icon || FEATURE_ICONS[0].name}
                              onChange={e => handleFeatureChange(idx, "icon", e.target.value)}
                              className="p-1 rounded border-2 border-[#FAC50C] bg-white text-[#1c3b3c] mr-2 w-24 sm:w-32 text-xs sm:text-sm"
                            >
                              {FEATURE_ICONS.map((icon, iconIdx) => (
                                <option key={iconIdx} value={icon.name}>
                                  {icon.label}
                                </option>
                              ))}
                            </select>
                          )}
                          {FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component &&
                            React.createElement(
                              FEATURE_ICONS.find((ic) => ic.name === feature.icon).component,
                              { size: 18, className: "text-[#FAC50C] sm:w-5 sm:h-5" }
                            )}
                        </div>
                        <EditableText
                          value={feature.title || ""}
                          onChange={(value) => handleFeatureChange(idx, "title", value)}
                          className="text-xs sm:text-base font-semibold text-[#fff]"
                          inputClassName="text-xs sm:text-base font-semibold text-[#fff] inline bg-transparent border-0 border-b-2 border-gray-400 focus:outline-none w-2/3 ml-2 shadow-none"
                          placeholder="Feature Title"
                          style={{ fontFamily: "'AvenirLTStd', sans-serif", background: 'transparent' }}
                          isEditing={isEditing}
                        />
                        {isEditing && (
                          <button
                            onClick={() => removeFeature(idx)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            title="Remove Feature"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="relative flex items-center justify-center">
                        <button
                          className={`col-span-full bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded mt-2 text-sm sm:text-base ${shopData.features.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={addFeature}
                          disabled={shopData.features.length >= 4}
                          onMouseEnter={() => setShowFeatureGuide(true)}
                          onMouseLeave={() => setShowFeatureGuide(false)}
                        >
                          Add Feature
                        </button>
                        {showFeatureGuide && shopData.features.length >= 4 && (
                          <div className="absolute left-full md:ml-2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in text-xs sm:text-sm">
                            <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                            <span className="text-[#1c3b3e] font-medium">You can only add up to 4 features!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="contact-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white mt-0 relative" onMouseEnter={() => setShowContactGuide(true)} onMouseLeave={() => setShowContactGuide(false)}>
            {showContactGuide && isEditing && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
                <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                <span className="text-[#1C3B3E] font-medium">Edit your contact info here!</span>
              </div>
            )}
            <div className="peacock-containerl">
              <div className="peacock-contentl">
                <div className="text-boxl">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <h2 className="titlel text-2xl sm:text-3xl md:text-5xl text-[#1c3b3c]" style={{ fontFamily: "'Quesha', sans-serif" }}>
                        Contact Us
                      </h2>
                    </div>
                  </div>
                  <EditableText
                    value={shopData.address || ""}
                    onChange={(value) => handleShopChange("address", value)}
                    className="text-base sm:text-lg text-black mt-4"
                    inputClassName={`text-base sm:text-lg w-full text-black border-none bg-transparent border-b-2 ${fieldErrors.address ? "border-red-500" : "border-gray-400"} focus:outline-none focus:border-gray-500 shadow-none`}
                    placeholder="Enter shop address"
                    style={{ background: 'transparent' }}
                    isEditing={isEditing}
                  />
                  <EditableText
                    value={shopData.phoneNumber || ""}
                    onChange={(value) => handleShopChange("phoneNumber", value)}
                    className="text-base sm:text-lg text-black mt-4"
                    inputClassName={`text-base sm:text-lg w-full text-black border-none bg-transparent border-b-2 ${fieldErrors.phoneNumber ? "border-red-500" : "border-gray-400"} focus:outline-none focus:border-gray-500 shadow-none`}
                    placeholder="Enter phone number"
                    style={{ background: 'transparent' }}
                    isEditing={isEditing}
                  />
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
                    {(shopData.socialMedias || []).map((media, idx) => (
                      <div key={idx} className="bg-[#1c3b3c] rounded-lg p-3 sm:p-4 shadow-sm flex items-center justify-between gap-2">
                        <div className="flex gap-1 items-center">
                          {isEditing && (
                            <select
                              value={media.icon || SOCIAL_ICONS[0].name}
                              onChange={(e) => handleSocialMediaChange(idx, "icon", e.target.value)}
                              className="p-1 rounded border-2 border-[#FAC50C] bg-white text-[#1c3b3c] mr-2 text-xs sm:text-sm"
                            >
                              {SOCIAL_ICONS.map((icon, iconIdx) => (
                                <option key={iconIdx} value={icon.name}>
                                  {icon.label}
                                </option>
                              ))}
                            </select>
                          )}
                          {SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component &&
                            React.createElement(
                              SOCIAL_ICONS.find((ic) => ic.name === media.icon).component,
                              { size: 18, className: "text-[#FAC50C] sm:w-5 sm:h-5" }
                            )}
                        </div>
                        <EditableText
                          value={media.url || ""}
                          onChange={(value) => handleSocialMediaChange(idx, "url", value)}
                          className="text-xs sm:text-base font-semibold text-[#fff]"
                          inputClassName="text-xs sm:text-base font-semibold text-[#fff] inline bg-transparent border-0 border-b-2 border-gray-400 focus:outline-none w-2/3 ml-2 shadow-none"
                          placeholder="Social Media URL"
                          style={{ fontFamily: "'AvenirLTStd', sans-serif", background: 'transparent' }}
                          isEditing={isEditing}
                        />
                        {isEditing && (
                          <button
                            onClick={() => removeSocialMedia(idx)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            title="Remove Social Media"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded mt-2 text-sm sm:text-base"
                        onClick={addSocialMedia}
                      >
                        Add Social Media
                      </button>
                    )}
                  </div>
                </div>
                <div className="peacock-image-containerl">
                  <img src={peacockL} alt="Decorative Vase" className="peacock-imagel" />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <ProPlanHero shop={shopData} />
          <div id="video-shop-section">
            <ProPlanVideo products={products.filter(p => p.video || p.newVideoPreview)} shopId={id} />
          </div>
          <div id="shop-section">
            <ProPlanAllProducts products={products.map(p => ({
              ...p,
              images: p.images?.map(img => ({
                url: img.url.startsWith('http') || img.url.startsWith('blob') ? img.url : `${backend_url}${img.url}`
              })) || []
            }))} shopId={id} />
          </div>
          <div id="events-section">
            <ProPlanEvents events={events.map(e => ({
              ...e,
              images: e.images?.map(img => ({
                url: img.url.startsWith('http') || img.url.startsWith('blob') ? img.url : `${backend_url}${img.url}`
              })) || []
            }))} />
          </div>
          <div id="about-section">
            <ProPlanAbout shop={shopData} />
          </div>
          <div id="contact-section">
            <ProPlanContact shop={shopData} />
          </div>
        </>
      )}
      <Footer />
      <button
        onClick={handleShare}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#cc9a00] text-white rounded-full hover:bg-[#b38600] transition-all duration-300 flex items-center justify-center shadow-2xl z-50 animate-bounce"
        aria-label="Share Shop"
      >
        <FaShareAlt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>
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
          top: "60px",
        }}
      />
      <style jsx global>{`
        @keyframes jump-infinite {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(3deg); }
          50% { transform: translateY(0) rotate(-3deg); }
          75% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-jump-infinite { animation: jump-infinite 0.6s ease-in-out infinite; }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-up { animation: slide-in-up 0.3s ease-in-out; }
        @keyframes bounce-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-bounce-in { animation: bounce-in 0.4s ease-in-out; }
        .peacock-containerl {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem 0.5rem;
        }
        .peacock-contentl {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1200px;
        }
        .text-boxl {
          flex: 1;
          padding-right: 0;
          width: 100%;
        }
        .titlel {
          font-family: 'Quesha', sans-serif;
          color: #1c3b3c;
          margin-bottom: 0.5rem;
        }
        .peacock-image-containerl {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-top: 1.5rem;
        }
        .peacock-imagel {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        @media (min-width: 768px) {
          .peacock-containerl {
            padding: 2rem;
          }
          .peacock-contentl {
            flex-direction: row;
          }
          .text-boxl {
            padding-right: 2rem;
          }
          .peacock-image-containerl {
            width: auto;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProPlanEdit;