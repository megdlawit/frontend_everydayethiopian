import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { server, backend_url } from "../../../../server";
import Footer from "../../../Layout/Footer";
import { FaPen, FaSave, FaTimes, FaTruck, FaGem, FaHandshake, FaLeaf, FaStore, FaCamera } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaTelegram, FaGlobe } from "react-icons/fa";
import { loadSeller } from "../../../../redux/actions/user";
import { getAllProductsShop } from "../../../../redux/actions/product";
import { getAllEventsShop } from "../../../../redux/actions/event";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../../Toast";
import ProductCard from "../../../Route/ProductCard/ProductCard";
import GrowthPlanEvents from "./GrowthPlanEvents";
import peac from "../../../../Assests/images/peac.png";
import peacockL from "../../../../Assests/images/peacockl.png";
import '../../../Route/PeacockShopL/PeacockShopL.css';
import GrowthPlanVideo from "./GrowthPlanVideo";

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

const GrowthPlanEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);

  const [isEditing, setIsEditing] = useState(false);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [updatedEvents, setUpdatedEvents] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [dismissedTooltips, setDismissedTooltips] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [showEditTooltip, setShowEditTooltip] = useState(false);
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
  const [showLogoTooltip, setShowLogoTooltip] = useState(false);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [growthPlanVideoFile, setGrowthPlanVideoFile] = useState(null);

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
    const fetchShopData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${server}/shop/get-shop-info/${id}`, { withCredentials: true });
        const shop = response.data.shop;
        setShopData({
          ...shop,
          logo: shop.avatar?.url ? (shop.avatar.url.startsWith('http') ? shop.avatar.url : `${backend_url}${shop.avatar.url}`) : "/Uploads/placeholder-image.jpg",
          features: Array.isArray(shop.features) ? shop.features : [],
          socialMedias: Array.isArray(shop.socialMedias) ? shop.socialMedias : [],
          heroImage: shop.heroImage?.url ? { url: shop.heroImage.url.startsWith('http') ? shop.heroImage.url : `${backend_url}${shop.heroImage.url}` } : { url: "/Uploads/placeholder-image.jpg" },
          aboutImage: shop.aboutImage?.url ? { url: shop.aboutImage.url.startsWith('http') ? shop.aboutImage.url : `${backend_url}${shop.aboutImage.url}` } : null,
          growthPlanVideo: shop.growthPlanVideo?.url ? { url: shop.growthPlanVideo.url.startsWith('http') ? shop.growthPlanVideo.url : `${backend_url}${shop.growthPlanVideo.url}` } : null,
        });
        dispatch(getAllProductsShop(id));
        dispatch(getAllEventsShop(id));
      } catch (err) {
        setError(`Failed to load shop data: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id, dispatch]);

  useEffect(() => {
    if (isEditing) {
      setOriginalProducts(products || []);
      setOriginalEvents(events || []);
    }
  }, [isEditing, products, events]);

  useEffect(() => {
    setUpdatedProducts(
      products
        ? products.slice(0, 4).map((p) => ({
            ...p,
            video: p.video
              ? p.video.startsWith("http") || p.video.startsWith("blob:")
                ? p.video
                : `${backend_url}${p.video.startsWith("/") ? p.video : `/${p.video}`}`
              : null,
            newVideoPreview: null,
            newVideoFile: null,
          }))
        : []
    );
  }, [products]);

  useEffect(() => {
    setUpdatedEvents(events ? events.map((e) => ({ ...e })) : []);
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
      setShowNameTooltip(false);
    };
  }, [isEditing]);

  const handleShopChange = (field, value) => {
    setShopData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleProductChange = (idOrIdx, field, value) => {
    setUpdatedProducts(prev => {
      const index = typeof idOrIdx === "string"
        ? prev.findIndex(p => p._id === idOrIdx)
        : idOrIdx;
      if (index !== -1 && prev[index]) {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      }
      return prev;
    });
  };

  const handleEventChange = (index, field, value) => {
    setUpdatedEvents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (isEditing) {
      setUpdatedProducts((prev) => prev.filter((p) => p._id !== productId));
      showToast("success", "Product Removed", "Product removed (will be deleted on save).");
    } else {
      try {
        await axios.delete(`${server}/product/delete-shop-product/${productId}`, { withCredentials: true });
        showToast("success", "Product Deleted", "Product deleted successfully!");
        dispatch(getAllProductsShop(id));
      } catch (error) {
        showToast("error", "Delete Failed", `Failed to delete product: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (isEditing) {
      setUpdatedEvents((prev) => prev.filter((e) => e._id !== eventId));
      showToast("success", "Event Removed", "Event removed (will be deleted on save).");
    } else {
      try {
        await axios.delete(`${server}/event/delete-shop-event/${eventId}`, { withCredentials: true });
        showToast("success", "Event Deleted", "Event deleted successfully!");
        dispatch(getAllEventsShop(id));
      } catch (error) {
        showToast("error", "Delete Failed", `Failed to delete event: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Invalid File", "Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File Too Large", "File size must be less than 5MB.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setShopData((prev) => ({
        ...prev,
        logo: previewUrl,
      }));

      const formData = new FormData();
      formData.append("avatar", file);
      const response = await axios.put(`${server}/shop/update-shop-avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = response.data.seller.avatar.url;
      const newLogoUrl = avatarUrl.startsWith('http') ? avatarUrl : `${backend_url}${avatarUrl}`;
      console.log("New logo URL:", newLogoUrl);
      setShopData((prev) => ({
        ...prev,
        logo: newLogoUrl,
      }));

      dispatch(loadSeller());
      showToast("success", "Logo Updated", "Shop logo updated successfully!");
    } catch (error) {
      console.error("Failed to update logo:", error.response?.data?.message || error.message);
      showToast("error", "Update Failed", `Failed to update shop logo: ${error.response?.data?.message || error.message}`);
      setShopData((prev) => ({
        ...prev,
        logo: shopData.logo,
      }));
    }
  };

  const handleImage = async (e, type, idOrIdx) => {
    const file = e.target.files?.[0];
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
        setUpdatedProducts((prev) => {
          const copy = [...prev];
          const index = copy.findIndex((p) => p._id === idOrIdx);
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
        setUpdatedEvents((prev) => {
          const copy = [...prev];
          copy[idOrIdx] = {
            ...copy[idOrIdx],
            images: [{ url: previewUrl }],
            newImageFile: file,
          };
          return copy;
        });
      }
      showToast("success", `${type.charAt(0).toUpperCase() + type.slice(1)} Image`, `${type.charAt(0).toUpperCase() + type.slice(1)} image selected for upload.`);
    } catch (error) {
      showToast("error", "Process Failed", `Failed to process ${type} image: ${error.message}`);
    }
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast("error", "Invalid File", "Please upload a video file.");
      return;
    }
    setGrowthPlanVideoFile(file);
    setShopData((prev) => ({
      ...prev,
      growthPlanVideo: { url: URL.createObjectURL(file) },
    }));
  };

  const handleVideoChange = (e, productId) => {
    const file = e.target.files?.[0];
    if (!file) {
      showToast("info", "No File", "No file selected.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      showToast("error", "Invalid File", "Please upload a video file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast("error", "File Too Large", "Video size must be less than 50MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUpdatedProducts((prev) => {
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
  };

  const dismissTooltip = (key) => {
    setDismissedTooltips((prev) => ({ ...prev, [key]: true }));
    if (key === "logo") setShowLogoTooltip(false);
    if (key === "name") setShowNameTooltip(false);
  };

  const handleFeatureChange = (index, field, value) => {
    setShopData((prev) => {
      const newFeatures = [...prev.features];
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
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    setShopData((prev) => {
      const newSocialMedias = [...prev.socialMedias];
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
      socialMedias: prev.socialMedias.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const errors = {};
    if (!shopData.name) errors.name = true;
    if (!shopData.address) errors.address = true;
    if (!shopData.phoneNumber) errors.phoneNumber = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast("error", "Validation Error", "Name, address, and phone number are required.");
      setGuideStep(0);
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("heroTagline", shopData.heroTagline || "");
      formData.append("heroDescription", shopData.heroDescription || "");
      if (heroImageFile) formData.append("heroImage", heroImageFile);
      if (aboutImageFile) formData.append("aboutImage", aboutImageFile);
      formData.append("features", JSON.stringify(shopData.features || []));

      const heroAboutRes = await axios.put(
        `${server}/shop/update-hero-about`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { heroImage, aboutImage } = heroAboutRes.data.shop;
      setShopData((prev) => ({
        ...prev,
        heroImage: heroImage?.url
          ? { url: `${backend_url}${heroImage.url}` }
          : prev.heroImage,
        aboutImage: aboutImage?.url
          ? { url: `${backend_url}${aboutImage.url}` }
          : prev.aboutImage,
      }));
      setHeroImageFile(null);
      setAboutImageFile(null);

      const payload = {
        name: shopData.name,
        description: shopData.description || "",
        address: shopData.address,
        phoneNumber: shopData.phoneNumber,
        heroTagline: shopData.heroTagline || "",
        heroDescription: shopData.heroDescription || "",
        features: shopData.features || [],
        contactDescription: shopData.contactDescription || "",
        socialMedias: shopData.socialMedias || [],
      };

      await axios.put(`${server}/shop/update-seller-info`, payload, {
        withCredentials: true,
      });

      const updatedProductsList = [];
      for (const product of updatedProducts) {
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
          const response = await axios.put(
            `${server}/product/edit-product/${product._id}`,
            productFormData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );
          updatedProductsList.push({
            ...response.data.product,
            video: response.data.product.video
              ? response.data.product.video.startsWith("http") ||
                response.data.product.video.startsWith("blob:")
                ? response.data.product.video
                : `${backend_url}${response.data.product.video}`
              : null,
          });
        } catch (error) {
          if (error.response?.data?.message?.includes("already exists")) {
            showToast("error", "Duplicate Name", `Product "${product.name}" already exists for this shop. Please choose a different name.`);
          } else {
            showToast("error", "Update Failed", `Failed to update product "${product.name}": ${error.response?.data?.message || error.message}`);
          }
          throw error;
        }
      }

      const deletedProductIds = originalProducts
        .filter(original => !updatedProducts.some(updated => updated._id === original._id))
        .map(p => p._id);
      for (const productId of deletedProductIds) {
        await axios.delete(`${server}/product/delete-shop-product/${productId}`, { withCredentials: true });
      }

      for (const event of updatedEvents) {
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
        await axios.put(`${server}/event/edit-event/${event._id}`, eventFormData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      }

      const deletedEventIds = originalEvents
        .filter(original => !updatedEvents.some(updated => updated._id === original._id))
        .map(e => e._id);
      for (const eventId of deletedEventIds) {
        await axios.delete(`${server}/event/delete-shop-event/${eventId}`, { withCredentials: true });
      }

      if (growthPlanVideoFile) {
        const videoFormData = new FormData();
        videoFormData.append("growthPlanVideo", growthPlanVideoFile);
        await axios.put(`${server}/shop/update-growthplan-video`, videoFormData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setGrowthPlanVideoFile(null);
      }

      setUpdatedProducts(
        updatedProductsList.slice(0, 4).map((p) => ({
          ...p,
          newVideoFile: undefined,
          newVideoPreview: undefined,
        }))
      );

      showToast("success", "Changes Saved", "Changes saved successfully!");
      setIsEditing(false);
      setShowGuide(false);
      setShowLogoTooltip(false);
      setShowNameTooltip(false);
      dispatch(loadSeller());
      dispatch(getAllProductsShop(id));
      dispatch(getAllEventsShop(id));
    } catch (err) {
      showToast("error", "Save Failed", `Failed to save changes: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedProducts(originalProducts.map((p) => ({
      ...p,
      video: p.video
        ? p.video.startsWith("http") || p.video.startsWith("blob:")
          ? p.video
          : `${backend_url}${p.video.startsWith("/") ? p.video : `/${p.video}`}`
        : null,
      newVideoPreview: null,
      newVideoFile: null,
    })));
    setUpdatedEvents(originalEvents.map((e) => ({ ...e })));
    setShopData({
      ...seller,
      logo: seller.avatar?.url ? (seller.avatar.url.startsWith('http') ? seller.avatar.url : `${backend_url}${seller.avatar.url}`) : "/Uploads/placeholder-image.jpg",
      features: Array.isArray(seller.features) ? seller.features : [],
      socialMedias: Array.isArray(seller.socialMedias) ? seller.socialMedias : [],
      heroImage: seller.heroImage?.url ? { url: `${backend_url}${seller.heroImage.url}` } : { url: "/Uploads/placeholder-image.jpg" },
      aboutImage: seller.aboutImage?.url ? { url: `${backend_url}${seller.aboutImage.url}` } : null,
    });
    setHeroImageFile(null);
    setAboutImageFile(null);
    setGrowthPlanVideoFile(null);
    setFieldErrors({});
    setShowLogoTooltip(false);
    setShowNameTooltip(false);
    setShowGuide(false);
    setGuideStep(0);
    showToast("info", "Edit Canceled", "Editing canceled. All changes, including deletions, have been reverted.");
  };

  const handleImageError = (e) => {
    e.target.src = "/Uploads/placeholder-image.jpg";
  };

  const scrollToSection = (sectionId, retries = 5, delay = 100) => {
    const attemptScroll = (attempt) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt > 0) {
        setTimeout(() => attemptScroll(attempt - 1), delay);
      }
    };
    attemptScroll(retries);
  };

  const handleNav = (section) => {
    if (!shopData?._id) return;
    if (section === 'shop') {
      window.location.href = `/shop/${shopData._id}/all-products`;
      return;
    }
    const sectionIdMap = {
      home: null,
      video: 'video-section',
      events: 'events-section',
      about: 'about-section',
      contact: 'contact-section',
    };
    const sectionId = sectionIdMap[section];
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId) {
      scrollToSection(sectionId);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!shopData) return <div className="flex justify-center items-center min-h-screen text-gray-500">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-[#fff] relative">
      {showGuide && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs sm:max-w-md w-full p-4 sm:p-6 relative animate-bounce-in">
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
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover animate-flap"
                  aria-hidden="true"
                />
              </div>
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
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 1: Click Edit Icon!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Tap to start editing—let's make your shop shine!</p>
                </div>
              )}
              {guideStep === 1 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 2: Logo & Hero Section!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Click the logo or hero image to upload a new image—show your style!</p>
                </div>
              )}
              {guideStep === 2 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 3: Product & Video Fun!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Edit or delete products and videos by clicking images or details—add some flair!</p>
                </div>
              )}
              {guideStep === 3 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 4: Event Excitement!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Update or delete events with new images and info—wow your visitors!</p>
                </div>
              )}
              {guideStep === 4 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 5: Share Your Story!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Edit the 'About' section and features—tell the world about your shop!</p>
                </div>
              )}
              {guideStep === 5 && (
                <div>
                  <p className="text-yellow-500 text-sm sm:text-lg mb-2 sm:mb-4">Step 6: Contact & Social Media!</p>
                  <p className="text-gray-600 text-xs sm:text-base mb-4">Update your contact info and social media links—make it easy to reach you!</p>
                </div>
              )}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={handlePrevGuideStep}
                  className={`flex items-center justify-center text-gray-500 px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-none hover:text-gray-700 transition-all duration-300 ease-in-out ${guideStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{ background: "transparent", border: "none" }}
                  disabled={guideStep === 0}
                  aria-label="Previous Step"
                >
                  <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
      {/* HERO SECTION */}
      <div
        className="relative w-full h-[70vh] sm:h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${shopData.heroImage?.url || "/Uploads/placeholder-image.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-30">
          <div className="absolute left-4 sm:left-8 top-4 sm:top-6 z-40 flex items-center gap-2 sm:gap-4">
            <div
              className="relative group"
              onMouseEnter={() => !dismissedTooltips["logo"] && setShowLogoTooltip(true)}
              onMouseLeave={() => !dismissedTooltips["logo"] && setShowLogoTooltip(false)}
            >
              <img
                src={`${shopData.logo}?t=${Date.now()}`}
                alt="Shop Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 sm:border-4 border-gray-400 shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                onError={(e) => {
                  console.error(`Logo failed to load: ${e.target.src}`);
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
              {isEditing && (
                <>
                  <label
                    htmlFor="shop-logo-upload"
                    className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-[#FAC50C] text-white p-1.5 sm:p-2 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                    aria-label="Change Shop Logo"
                  >
                    <FaPen size={12} className="sm:w-3.5 sm:h-3.5" />
                    <input
                      type="file"
                      id="shop-logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {showLogoTooltip && !dismissedTooltips["logo"] && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 flex items-center w-[160px] sm:w-[200px] animate-slide-in-up z-50">
                      <img
                        src={peac}
                        alt="Peacock Guide"
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                        aria-hidden="true"
                      />
                      <p className="font-medium">Click to change logo!</p>
                      <button
                        onClick={() => dismissTooltip("logo")}
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                        aria-label="Dismiss Tooltip"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div
              className={`relative group ${isEditing ? "bg-white/95 backdrop-blur-lg p-2 sm:p-4 rounded-lg shadow-lg hidden sm:block" : ""}`}
              onMouseEnter={() => !dismissedTooltips["name"] && setShowNameTooltip(true)}
              onMouseLeave={() => !dismissedTooltips["name"] && setShowNameTooltip(false)}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={shopData.name || ""}
                  onChange={(e) => handleShopChange("name", e.target.value)}
                  className={`text-base sm:text-xl md:text-2xl font-bold text-[#1c3b3c] bg-transparent border-none border-b-2 sm:border-b-4 border-gray-400 focus:outline-none rounded px-2 py-1 shadow-none transition-all duration-300 ease-in-out group-hover:border-gray-500`}
                  placeholder="Shop Name"
                  style={{
                    fontFamily: "'Quesha', sans-serif",
                    width: `${(shopData.name?.length || 8) + 2}ch`,
                    minWidth: '8ch',
                    maxWidth: '20ch',
                    background: 'transparent'
                  }}
                  aria-label="Shop Name"
                />
              ) : (
                <h1
                  className="text-base sm:text-xl md:text-2xl text-white"
                  style={{ fontFamily: "'Quesha', sans-serif" }}
                >
                  {shopData.name}
                </h1>
              )}
              {isEditing && showNameTooltip && !dismissedTooltips["name"] && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg shadow-lg rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 flex items-center w-[160px] sm:w-[200px] animate-slide-in-up z-50">
                  <img
                    src={peac}
                    alt="Peacock Guide"
                    className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover mr-2 animate-jump-infinite"
                    aria-hidden="true"
                  />
                  <p className="font-medium">Edit shop name!</p>
                  <button
                    onClick={() => dismissTooltip("name")}
                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                    aria-label="Dismiss Tooltip"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4" style={{ fontFamily: "'Quesha', sans-serif" }}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={shopData.heroTagline || ""}
                onChange={(e) => handleShopChange("heroTagline", e.target.value)}
                className="text-2xl sm:text-3xl md:text-6xl text-white px-3 sm:px-4 py-2 sm:py-3 mt-4 bg-transparent border border-gray-400 focus:outline-none w-full max-w-3xl mx-auto text-center rounded border-b-4 leading-relaxed"
                placeholder="Enter your shop's hero tagline"
                style={{
                  fontFamily: "'Quesha', sans-serif",
                  background: 'transparent',
                  minHeight: '3rem',
                }}
                aria-label="Hero Tagline"
              />
              <textarea
                value={shopData.heroDescription || ""}
                onChange={(e) => handleShopChange("heroDescription", e.target.value)}
                className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-lg text-white font-light max-w-xl bg-transparent border border-gray-400 focus:outline-none w-full rounded border-b-4"
                placeholder="Enter your shop's hero description"
                style={{
                  fontFamily: "'Avenier LT LTD', sans-serif",
                  background: 'transparent',
                  minHeight: '5rem',
                }}
                aria-label="Hero Description"
              />
              <div className="mt-3 sm:mt-4 flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  id="hero-image-upload"
                  className="hidden"
                  onChange={(e) => handleImage(e, "hero")}
                />
                <label
                  htmlFor="hero-image-upload"
                  className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded cursor-pointer text-xs sm:text-sm shadow-md flex items-center gap-1 sm:gap-2"
                  style={{ fontFamily: "'Avenir LT Std', 'Lato', sans-serif" }}
                >
                  <FaCamera size={14} className="sm:w-4 sm:h-4" />
                  Choose Hero Image
                </label>
              </div>
              <button
                className="mt-4 sm:mt-6 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-[#FFC300] border-2 border-[#FFC300] text-sm sm:text-base"
                style={{ fontFamily: "'Avenier LT Std', sans-serif" }}
              >
                Shop Now
              </button>
            </>
          ) : (
            <>
              <h1
                className="text-2xl sm:text-3xl md:text-7xl leading-tight text-white px-4 mt-[4rem] sm:mt-[6rem] max-w-4xl mx-auto"
                style={{ fontFamily: "'Quesha', sans-serif" }}
              >
                {shopData.heroTagline || "Crafting Your Dream Space, Inside And Out"}
              </h1>
              <p
                className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-lg text-white font-light max-w-xl px-4"
                style={{ fontFamily: "'Avenier LT LTD', sans-serif" }}
              >
                {shopData.heroDescription ||
                  "Transforming interiors with personalized design, turning your vision into a reality both indoors and outdoors."}
              </p>
              <button
                className="mt-4 sm:mt-6 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-[#FFC300] border-2 border-[#FFC300] text-sm sm:text-base"
                style={{ fontFamily: "'Avenier LT Std', sans-serif" }}
              >
                Shop Now
              </button>
            </>
          )}
        </div>
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
            onClick={() => setIsEditing((prev) => !prev)}
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
        {isEditing && (
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
      </div>
      {/* Video Products Edit Section */}
      <section id="video-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white rounded-2xl mt-4">
        <h2
          className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10"
          style={{ fontFamily: "'Quesha', sans-serif" }}
        >
          Video Shopping
        </h2>
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
            {updatedProducts.filter((p) => p.video || p.newVideoPreview).length > 0 ? (
              updatedProducts
                .filter((product) => product.video || product.newVideoPreview)
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
                            ? product.video.startsWith("blob:") || product.video.startsWith("http")
                              ? product.video
                              : `${backend_url}${product.video.startsWith("/") ? product.video : `/${product.video}`}`
                            : "/Uploads/placeholder-video.mp4"
                        }
                        controls
                        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          console.error(`Video failed to load for product ${product._id}: ${e.target.src}`);
                          e.target.poster = "/Uploads/placeholder-image.jpg";
                        }}
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="file"
                          accept="video/*"
                          id={`product-video-upload-${product._id}`}
                          className="hidden"
                          onChange={(e) => handleVideoChange(e, product._id)}
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
                      value={product.name || ""}
                      onChange={(e) => handleProductChange(product._id, "name", e.target.value)}
                      className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                      style={{ background: "transparent" }}
                      placeholder="Video Name"
                    />
                    <input
                      type="number"
                      value={product.discountPrice || ""}
                      onChange={(e) => handleProductChange(product._id, "discountPrice", e.target.value)}
                      className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                      placeholder="Video Price (ETB)"
                      style={{ background: "transparent" }}
                    />
                  </div>
                ))
            ) : (
              <p className="text-gray-600 text-center col-span-full text-sm sm:text-base">
                No video products available yet.
              </p>
            )}
          </div>
        ) : (
          <GrowthPlanVideo
            shopId={id}
            products={updatedProducts
              .filter((p) => p.video || p.newVideoPreview)
              .slice(0, 4)
              .map((p) => ({
                ...p,
                video: p.newVideoPreview || p.video,
              }))}
          />
        )}
      </section>
      {/* Shop Our Collection (Image Products) Section */}
      <section id="products-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white rounded-2xl mt-4">
        <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
          Shop Our Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
          {updatedProducts && updatedProducts.filter((p) => !p.video).length > 0 ? (
            isEditing
              ? updatedProducts
                  .filter((product) => !product.video)
                  .map((product) => (
                    <div key={product._id} className="bg-white p-3 sm:p-4 rounded-xl shadow-lg w-full max-w-xs sm:max-w-none relative">
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="absolute top-2 right-2 z-10 bg-white text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all shadow-none"
                          title="Delete Product"
                        >
                          <FaTimes size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <label className="cursor-pointer block relative">
                        <img
                          src={
                            product.images?.[0]?.url
                              ? product.images[0].url.startsWith("blob:")
                                ? product.images[0].url
                                : `${backend_url}${product.images[0].url}`
                              : "/Uploads/photo-image.jpg"
                          }
                          alt={product.name}
                          className="w-full h-40 sm:h-48 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="file"
                            accept="image/*"
                            id={`product-image-upload-${product._id}`}
                            className="hidden"
                            onChange={(e) => handleImage(e, "product", product._id)}
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
                        value={product.name || ""}
                        onChange={(e) => handleProductChange(product._id, "name", e.target.value)}
                        className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        style={{ background: "transparent" }}
                        placeholder="Product Name"
                      />
                      <input
                        type="number"
                        value={product.discountPrice || ""}
                        onChange={(e) => handleProductChange(product._id, "discountPrice", e.target.value)}
                        className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                        placeholder="Price (ETB)"
                        style={{ background: "transparent" }}
                      />
                    </div>
                  ))
              : updatedProducts
                  .filter((product) => !product.video)
                  .map((product) => <ProductCard key={product._id} data={product} hideShopLink={true} />)
          ) : (
            <p className="text-gray-600 text-center col-span-full text-sm sm:text-base">No products available yet.</p>
          )}
        </div>
      </section>
      {/* Events Section */}
      <section id="events-section" className="w-full px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white mt-2 relative">
        <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center mb-6 sm:mb-8 md:mb-10" style={{ fontFamily: "'Quesha', sans-serif" }}>
          Running Event
        </h2>
        {isEditing && (
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 z-50 animate-bounce-in pointer-events-none text-xs sm:text-sm">
            <img src={peac} alt="Peacock Guide" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
            <span className="text-[#1C3B3E] font-medium">Edit your event here!</span>
          </div>
        )}
        <div className="max-w-7xl mx-auto">
          {updatedEvents && updatedEvents.length > 0 ? (
            <div className="w-full">
              {isEditing ? (
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg w-full max-w-4xl mx-auto relative">
                  <button
                    onClick={() => handleDeleteEvent(updatedEvents[0]._id)}
                    className="absolute top-2 right-2 z-10 bg-white text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all shadow-none"
                    title="Delete Event"
                  >
                    <FaTimes size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <label className="cursor-pointer block relative">
                    <img
                      src={
                        updatedEvents[0].images?.[0]?.url
                          ? updatedEvents[0].images[0].url.startsWith("blob:")
                            ? updatedEvents[0].images[0].url
                            : `${backend_url}${updatedEvents[0].images[0].url}`
                          : "/Uploads/photo-image.jpg"
                      }
                      alt={updatedEvents[0].name}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="file"
                        accept="image/*"
                        id="event-image-upload-0"
                        className="hidden"
                        onChange={(e) => handleImage(e, "event", 0)}
                      />
                      <label
                        htmlFor="event-image-upload-0"
                        className="bg-[#FAC50C] text-white px-2 py-1 rounded cursor-pointer text-xs shadow flex items-center gap-1"
                      >
                        <FaCamera size={12} className="sm:w-3.5 sm:h-3.5" />
                        Choose Image
                      </label>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={updatedEvents[0].name || ""}
                    onChange={(e) => handleEventChange(0, "name", e.target.value)}
                    className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                    style={{ background: "transparent" }}
                    placeholder="Event Name"
                  />
                  <input
                    type="number"
                    value={updatedEvents[0].discountPrice || ""}
                    onChange={(e) => handleEventChange(0, "discountPrice", e.target.value)}
                    className="mt-2 font-medium text-xs sm:text-sm border-b-2 border-gray-400 p-2 w-full bg-transparent shadow-none text-gray-700 focus:border-gray-500"
                    placeholder="Price (ETB)"
                    style={{ background: "transparent" }}
                  />
                </div>
              ) : (
                <GrowthPlanEvents
                  data={updatedEvents[0]}
                  className="w-full max-w-4xl mx-auto"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center text-sm sm:text-base">No running event at the moment.</p>
          )}
        </div>
      </section>
      {/* About Section */}
      <section id="about-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white mt-0">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-6xl text-[#1c3b3c] text-center md:text-left mb-6 sm:mb-4" style={{ fontFamily: "'Quesha', sans-serif" }}>
              About {shopData.name}
            </h2>
            {isEditing ? (
              <textarea
                value={shopData.description || ""}
                onChange={(e) => handleShopChange("description", e.target.value)}
                className="text-center md:text-left text-gray-600 text-xs sm:text-sm md:text-base mb-6 sm:mb-10 border-2 border-gray-300 bg-white rounded-lg p-3 sm:p-4 focus:outline-none focus:border-gray-500 w-full shadow-sm resize-y"
                placeholder="Enter your shop's story here..."
                rows="6"
                style={{
                  minHeight: '120px',
                  width: '100%',
                  maxWidth: '600px',
                }}
                aria-label="Shop Description"
              />
            ) : (
              <p
                className="text-center md:text-left text-gray-600 text-xs sm:text-sm md:text-base mb-6 sm:mb-10"
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {shopData.description || "No description available."}
              </p>
            )}
            <div className={`grid ${isEditing ? 'grid-cols-1' : 'grid-cols-2'} gap-4 sm:gap-6 mb-8 sm:mb-12`}>
              {(shopData.features || []).map((feature, idx) => (
                isEditing ? (
                  <div key={idx} className="bg-[#1c3b3c] rounded-lg p-3 sm:p-4 text-center shadow-sm flex items-center justify-between gap-2">
                    <div className="flex gap-1 items-center relative">
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
                      {FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component &&
                        React.createElement(
                          FEATURE_ICONS.find((ic) => ic.name === feature.icon).component,
                          { size: 18, className: "text-[#FAC50C] sm:w-5 sm:h-5" }
                        )}
                    </div>
                    <input
                      type="text"
                      value={feature.title || ""}
                      onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                      className="text-xs sm:text-base font-semibold text-[#fff] inline bg-transparent border-0 border-b-2 border-gray-400 focus:outline-none w-2/3 ml-2 shadow-none"
                      placeholder="Feature Title"
                    />
                    <button
                      onClick={() => removeFeature(idx)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Remove Feature"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div key={idx} className="bg-[#1c3b3c] rounded-lg p-3 sm:p-4 text-center shadow-sm flex items-center justify-center gap-2">
                    {FEATURE_ICONS.find((ic) => ic.name === feature.icon)?.component &&
                      React.createElement(
                        FEATURE_ICONS.find((ic) => ic.name === feature.icon).component,
                        { size: 20, className: "text-[#FAC50C] mr-2 sm:w-6 sm:h-6" }
                      )}
                    <span className="text-xs sm:text-base font-semibold text-[#fff]">{feature.title}</span>
                  </div>
                )
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
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            {shopData?.aboutImage?.url ? (
              <img
                src={shopData.aboutImage.url}
                alt="About"
                className="w-full max-w-xs sm:max-w-md rounded-lg object-cover mx-auto"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full max-w-xs sm:max-w-md mx-auto h-32 sm:h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-sm">No About Image</p>
              </div>
            )}
            {isEditing && (
              <div className="mt-3 sm:mt-4 flex justify-center">
                <input
                  type="file"
                  accept="image/*"
                  id="about-image-upload"
                  className="hidden"
                  onChange={(e) => handleImage(e, "about")}
                />
                <label
                  htmlFor="about-image-upload"
                  className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded cursor-pointer text-xs sm:text-sm shadow flex items-center gap-1 sm:gap-2"
                  style={{ fontFamily: "'Avenir LT Std', 'Lato', sans-serif" }}
                >
                  <FaCamera size={14} className="sm:w-4 sm:h-4" />
                  Choose About Image
                </label>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact-section" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-6 md:py-10 bg-white mt-0">
        {isEditing ? (
          <div className="peacock-containerl">
            <div className="peacock-contentl">
              <div className="text-boxl">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <h2 className="titlel text-2xl sm:text-3xl md:text-5xl text-[#1c3b3c]" style={{ fontFamily: "'Quesha', sans-serif" }}>
                      {shopData.contactTitle || "Contact Us"}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
                  {(shopData.socialMedias || []).map((media, idx) => (
                    <div key={idx} className="bg-[#1c3b3c] rounded-lg p-3 sm:p-4 shadow-sm flex items-center justify-between gap-2">
                      <div className="flex gap-1 items-center">
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
                        {SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component &&
                          React.createElement(
                            SOCIAL_ICONS.find((ic) => ic.name === media.icon).component,
                            { size: 18, className: "text-[#FAC50C] sm:w-5 sm:h-5" }
                          )}
                      </div>
                      <input
                        type="text"
                        value={media.url || ""}
                        onChange={(e) => handleSocialMediaChange(idx, "url", e.target.value)}
                        className="text-xs sm:text-base font-semibold text-[#fff] inline bg-transparent border-0 border-b-2 border-gray-400 focus:outline-none w-2/3 ml-2 shadow-none"
                        placeholder="Social Media URL"
                      />
                      <button
                        onClick={() => removeSocialMedia(idx)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remove Social Media"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button
                    className="bg-[#FAC50C] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded mt-2 text-sm sm:text-base"
                    onClick={addSocialMedia}
                  >
                    Add Social Media
                  </button>
                </div>
              </div>
              <div className="peacock-image-containerl">
                <img src={peacockL} alt="Decorative Vase" className="peacock-imagel" />
              </div>
            </div>
          </div>
        ) : (
          <div className="peacock-containerl">
            <div className="peacock-contentl">
              <div className="text-boxl">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <h2 className="titlel text-2xl sm:text-3xl md:text-5xl text-[#1c3b3c]" style={{ fontFamily: "'Quesha', sans-serif" }}>
                      {shopData.contactTitle || "Contact Us"}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                  {(shopData.socialMedias || []).map((media, idx) => {
                    const IconComp = SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component || FaGlobe;
                    return (
                      <a
                        key={idx}
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#1c3b3c] rounded-lg p-3 sm:p-4 shadow-sm"
                      >
                        <IconComp size={20} className="text-[#FAC50C] sm:w-6 sm:h-6" />
                        <span className="text-xs sm:text-base font-semibold text-[#fff]">{media.platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="peacock-image-containerl">
                <img src={peacockL} alt="Decorative Vase" className="peacock-imagel" />
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
      {!isEditing && shopData && (
        <header className="absolute top-4 sm:top-6 left-0 right-0 z-20 px-4 sm:px-8 flex items-center justify-between pointer-events-none select-none">
          <div className="flex items-center gap-2 sm:gap-6">
            {shopData.logo && (
              <img
                src={`${shopData.logo}?t=${Date.now()}`}
                alt="Shop Logo"
                className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-300 bg-white shadow"
                style={{ minWidth: 40, minHeight: 40 }}
                onError={(e) => {
                  console.error(`Logo failed to load: ${e.target.src}`);
                  e.target.src = "/Uploads/placeholder-image.jpg";
                }}
              />
            )}
          </div>
          <div className="bg-[#1c3b3c] rounded-full px-3 py-2 sm:px-6 sm:py-3 pointer-events-auto select-auto hidden sm:block">
            <nav className="flex gap-x-3 sm:gap-x-5 items-center text-white/90 text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => handleNav("home")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 bg-white text-black focus:outline-none text-xs sm:text-sm"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleNav("video")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 hover:text-white focus:outline-none text-xs sm:text-sm"
              >
                Video Shopping
              </button>
              <button
                type="button"
                onClick={() => handleNav("events")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 hover:text-white focus:outline-none text-xs sm:text-sm"
              >
                Events
              </button>
              <button
                type="button"
                onClick={() => handleNav("shop")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 hover:text-white focus:outline-none text-xs sm:text-sm"
              >
                Shop
              </button>
              <button
                type="button"
                onClick={() => handleNav("about")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 hover:text-white focus:outline-none text-xs sm:text-sm"
              >
                About Us
              </button>
              <button
                type="button"
                onClick={() => handleNav("contact")}
                className="rounded-full px-2 py-1 sm:px-4 sm:py-1 hover:text-white focus:outline-none text-xs sm:text-sm"
              >
                Contact Us
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="bg-white text-[#cc9a00] text-xs sm:text-sm font-medium rounded-[20px] border border-[#cc9a00] px-2 py-1 sm:px-4 sm:py-1 ml-0">
              Joined{" "}
              {shopData.createdAt
                ? new Date(shopData.createdAt).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })
                : "June 2025"}
            </span>
          </div>
        </header>
      )}
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
        @keyframes flap {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(10deg); }
        }
        .animate-jump-infinite { animation: jump-infinite 0.6s ease-in-out infinite; }
        .animate-slide-in-up { animation: slide-in-up 0.3s ease-in-out; }
        .animate-bounce-in { animation: bounce-in 0.4s ease-in-out; }
        .animate-flap { animation: flap 1s ease-in-out infinite; }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
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

export default GrowthPlanEdit;