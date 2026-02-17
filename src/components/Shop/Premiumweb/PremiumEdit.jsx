import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { server, backend_url } from "../../../server";
import Footer from "../../../components/Layout/Footer";
import { FaPen } from "react-icons/fa";
import { AiOutlineCamera } from "react-icons/ai";
import { loadSeller } from "../../../redux/actions/user";
import { getAllProductsShop, updateProduct } from "../../../redux/actions/product";
import { getAllEventsShop, updateEvent } from "../../../redux/actions/event";
import { toast } from "react-toastify";
import ProductCard from "../../../components/Route/ProductCard/ProductCard";
import EventCard from "../../../components/Events/EventCard";
import Ratings from "../../../components/Products/Ratings";
import { Link } from "react-router-dom";
import Toast from "../../Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PremiumEdit = () => {
  const { id } = useParams();
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState([]); // Local state for product updates
  const [updatedEvents, setUpdatedEvents] = useState([]); // Local state for event updates

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

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id || id === "undefined") {
        setError("Invalid shop ID. Please provide a valid ID in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching shop data for ID:", id);
        const response = await axios.get(`${server}/shop/get-shop-info/${id}`, {
          withCredentials: true,
        });
        const shop = response.data.shop;

        if (!shop) {
          throw new Error("Shop not found");
        }

        setShopData({
          shopUrl: `${window.location.origin}/shop/premiumpreview/${id}`,
          shopName: shop.name,
          logo: shop.avatar?.url ? `${backend_url}${shop.avatar.url}` : "/uploads/placeholder-image.jpg",
          aboutText: shop.description || "Welcome to our shop! We offer premium products crafted with passion and care.",
          address: shop.address || "",
          contact: {
            email: shop.email,
            phone: shop.phoneNumber,
            mapUrl: shop.contact?.mapUrl || "https://maps.google.com",
            twitter: shop.contact?.twitter || "https://twitter.com",
            facebook: shop.contact?.facebook || "https://facebook.com",
            instagram: shop.contact?.instagram || "https://instagram.com",
          },
        });

        dispatch(getAllProductsShop(id));
        dispatch(getAllEventsShop(id));
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message);
        setError(`Failed to load shop data: ${err.response?.data?.message || err.message}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [id, dispatch]);

  useEffect(() => {
    // Sync local updatedProducts with fetched products
    if (products && products.length > 0) {
      setUpdatedProducts([...products]);
    }
  }, [products]);

  useEffect(() => {
    // Sync local updatedEvents with fetched events
    if (events && events.length > 0) {
      setUpdatedEvents([...events]);
    }
  }, [events]);

  const handleImage = async (e, type = "shop", productId = null) => {
    const file = e.target.files[0];
    const formData = new FormData();

    if (type === "shop") {
      formData.append("avatar", file);
      try {
        const res = await axios.put(`${server}/shop/update-shop-avatar`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        dispatch(loadSeller());
        setShopData({
          ...shopData,
          logo: `${backend_url}${res.data.seller.avatar.url}`,
        });
        showToast("success", "Avatar Success", "Avatar updated successfully!");
      } catch (error) {
        showToast("error", "Avatar Error", error.response?.data?.message || "Failed to update avatar");
      }
    } else if (type === "product" && productId) {
      formData.append("images", file);
      formData.append("shopId", id);

      const updatedProductData = updatedProducts.find((p) => p._id === productId);
      if (updatedProductData) {
        formData.append("name", updatedProductData.name);
        formData.append("description", updatedProductData.description || "");
        formData.append("category", updatedProductData.category || "");
        formData.append("originalPrice", updatedProductData.originalPrice || "");
        formData.append("discountPrice", updatedProductData.discountPrice || "");
        formData.append("stock", updatedProductData.stock || "");
        // Preserve existing images if any
        if (updatedProductData.images && updatedProductData.images.length > 0) {
          updatedProductData.images.forEach((img) => {
            if (typeof img === "string") {
              formData.append("existingImages", img);
            } else if (img.url) {
              formData.append("existingImages", img.url);
            }
          });
        }
      }

      try {
        await dispatch(updateProduct(productId, formData));
        dispatch(getAllProductsShop(id)); // Refresh products
        showToast("success", "Product Success", "Product image updated successfully!");
      } catch (error) {
        showToast("error", "Product Error", error.response?.data?.message || "Failed to update product image");
      }
    }
  };

  const handleEventImage = async (e, eventId, index) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("newImages", file);

    const updatedEventData = updatedEvents[index];
    if (updatedEventData) {
      formData.append("name", updatedEventData.name);
      formData.append("description", updatedEventData.description || "");
      formData.append("category", updatedEventData.category || "");
      formData.append("originalPrice", updatedEventData.originalPrice || "");
      formData.append("discountPrice", updatedEventData.discountPrice || "");
      formData.append("stock", updatedEventData.stock || "");
    }

    try {
      await dispatch(updateEvent(eventId, formData));
      dispatch(getAllEventsShop(id)); // Refresh events
      showToast("success", "Event Success", "Event image updated successfully!");
    } catch (error) {
      showToast("error", "Event Error", error.response?.data?.message || "Failed to update event image");
    }
  };

  const handleChange = (field, value, index = null) => {
    if (index !== null) {
      const newProducts = [...updatedProducts];
      newProducts[index] = { ...newProducts[index], [field]: value };
      setUpdatedProducts(newProducts); // Update local state
    } else if (field.includes("contact.")) {
      const contactField = field.split(".")[1];
      setShopData({
        ...shopData,
        contact: { ...shopData.contact, [contactField]: value },
      });
    } else {
      setShopData({ ...shopData, [field]: value });
    }
  };

  const handleEventChange = (field, value, index) => {
    const newEvents = [...updatedEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setUpdatedEvents(newEvents); // Update local state
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Update Shop Info
      const shopFormData = new FormData();
      if (!shopData.shopName || !shopData.address || !shopData.contact.phone) {
        showToast("error", "Validation Error", "Please fill in all required fields: Shop Name, Address, and Phone Number");
        setLoading(false);
        return;
      }

      shopFormData.append("name", shopData.shopName);
      shopFormData.append("description", shopData.aboutText);
      shopFormData.append("address", shopData.address);
      shopFormData.append("phoneNumber", shopData.contact.phone);

      await axios.put(`${server}/shop/update-seller-info`, shopFormData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      dispatch(loadSeller());

      // Update Products
      for (const product of updatedProducts) {
        const originalProduct = products.find((p) => p._id === product._id);
        if (JSON.stringify(product) !== JSON.stringify(originalProduct)) {
          const productFormData = new FormData();
          productFormData.append("name", product.name);
          productFormData.append("description", product.description || "");
          productFormData.append("category", product.category || "");
          productFormData.append("originalPrice", product.originalPrice || "");
          productFormData.append("discountPrice", product.discountPrice || "");
          productFormData.append("stock", product.stock || "");
          productFormData.append("shopId", id);

          if (product.images && product.images.length > 0) {
            product.images.forEach((img) => {
              if (typeof img === "string") {
                productFormData.append("existingImages", img);
              } else if (img.url) {
                productFormData.append("existingImages", img.url);
              }
            });
          }

          await dispatch(updateProduct(product._id, productFormData));
        }
      }

      dispatch(getAllProductsShop(id)); // Refresh products

      // Update Events
      for (const event of updatedEvents) {
        const originalEvent = events.find((e) => e._id === event._id);
        if (JSON.stringify(event) !== JSON.stringify(originalEvent)) {
          const eventFormData = new FormData();
          eventFormData.append("name", event.name);
          eventFormData.append("description", event.description || "");
          eventFormData.append("category", event.category || "");
          eventFormData.append("originalPrice", event.originalPrice || "");
          eventFormData.append("discountPrice", event.discountPrice || "");
          eventFormData.append("stock", event.stock || "");

          if (event.images && event.images.length > 0) {
            event.images.forEach((img) => {
              if (typeof img === "string") {
                eventFormData.append("existingImages", img);
              } else if (img.url) {
                eventFormData.append("existingImages", img.url);
              }
            });
          }

          await dispatch(updateEvent(event._id, eventFormData));
        }
      }

      dispatch(getAllEventsShop(id)); // Refresh events
      setIsEditing(false);
      showToast("success", "Update Success", "Shop and products updated successfully!");
    } catch (err) {
      setError(`Failed to update: ${err.response?.data?.message || err.message}`);
      console.error("Error updating:", err.response?.data || err);
      showToast("error", "Update Error", err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${shopData?.shopName} - Premium Shop`,
        text: `Explore exquisite products at ${shopData?.shopName}!`,
        url: shopData?.shopUrl,
      }).catch((error) => console.log("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(shopData?.shopUrl).then(() => {
        showToast("success", "Share Success", "Shop URL copied to clipboard!");
      }).catch((err) => console.error("Failed to copy:", err));
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
    e.target.src = "/uploads/placeholder-image.jpg";
  };

  const allReviews = products && products.map((product) => product.reviews).flat();

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
  if (!shopData) return <div className="flex justify-center items-center min-h-screen text-gray-600">Shop not found.</div>;

  return (
    <div className="w-full bg-gradient-to-b from-yellow-100 via-white to-yellow-50 min-h-screen font-sans relative overflow-hidden">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="fixed top-4 right-4 z-50 bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-all duration-300"
      >
        <FaPen size={20} />
      </button>

      {isEditing && (
        <button
          onClick={handleUpdate}
          className="fixed top-16 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      )}

      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-20 shadow-lg text-center py-6 md:py-8 animate-fadeInDown">
        <div className="flex flex-col items-center gap-4 mb-4 md:mb-6">
          {isEditing ? (
            <>
              <div className="relative">
                <img src={shopData.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover" />
                <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[0px] right-[0px]">
                  <input type="file" id="shopImage" className="hidden" onChange={(e) => handleImage(e, "shop")} />
                  <label htmlFor="shopImage"><AiOutlineCamera /></label>
                </div>
              </div>
              <input
                type="text"
                value={shopData.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
                className="text-3xl md:text-4xl font-extrabold text-yellow-600 tracking-wide border-b border-gray-300 p-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
                required
              />
            </>
          ) : (
            <>
              <Link to={`/shop/premiumpreview/${id}`}>
                <img
                  src={shopData.logo}
                  alt="Shop Logo"
                  className="w-[50px] h-[50px] rounded-full object-cover border-2 border-yellow-600 animate-spin-slow"
                  onError={handleImageError}
                />
              </Link>
              <h1
                className="text-3xl md:text-4xl font-extrabold text-yellow-600 tracking-wide animate-pulse"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {shopData.shopName}
              </h1>
            </>
          )}
        </div>
        <ul className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
          {["Home", "Shop", "Events", "Reviews", "About", "Contact"].map((item) => (
            <li
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className={`cursor-pointer text-gray-600 hover:text-yellow-600 transition-all duration-300 font-medium text-base md:text-lg transform hover:scale-110 hover:shadow-md px-3 py-1 rounded-full ${
                activeSection === item.toLowerCase() ? "text-yellow-600 bg-yellow-100 border-2 border-yellow-600" : ""
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="home"
        className="max-w-7xl mx-auto pt-12 md:pt-16 pb-10 md:pb-12 px-4 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn"
      >
        <div className="relative group">
          {isEditing ? (
            <label className="cursor-pointer block">
              <img
                src={updatedProducts[0]?.images?.[0]?.url ? `${backend_url}${updatedProducts[0].images[0].url}` : "/uploads/placeholder-image.jpg"}
                alt={updatedProducts[0]?.name || "Featured Product"}
                className="w-full rounded-2xl object-cover h-[300px] md:h-[500px]"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e, "product", updatedProducts[0]?._id)}
                className="hidden"
              />
            </label>
          ) : (
            <img
              src={updatedProducts[0]?.images?.[0]?.url ? `${backend_url}${updatedProducts[0].images[0].url}` : "/uploads/placeholder-image.jpg"}
              alt={updatedProducts[0]?.name || "Featured Product"}
              className="w-full rounded-2xl object-cover h-[300px] md:h-[500px] transform transition-transform duration-700 group-hover:scale-105 shadow-2xl"
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 md:top-6 left-4 md:left-6 text-white">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={updatedProducts[0]?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value, 0)}
                  className="text-2xl md:text-3xl font-bold bg-transparent border-b border-white p-1 w-full mb-2"
                />
                <input
                  type="number"
                  value={updatedProducts[0]?.discountPrice || ""}
                  onChange={(e) => handleChange("discountPrice", e.target.value, 0)}
                  className="text-lg md:text-xl bg-transparent border-b border-white p-1 w-full"
                  placeholder="Price"
                />
              </>
            ) : (
              <>
                <p className="text-lg md:text-xl font-medium animate-slideInLeft">Featured Product</p>
                <h3 className="text-2xl md:text-3xl font-bold animate-slideInLeft delay-200">
                  {updatedProducts[0]?.name || "Elegant Item"}
                </h3>
                <p className="text-lg md:text-xl animate-slideInLeft delay-300">
                  ${updatedProducts[0]?.discountPrice || "N/A"}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {updatedProducts.length > 1 ? (
            updatedProducts.slice(1, 5).map((product, index) => (
              <div key={product._id} className="relative group overflow-hidden">
                {isEditing ? (
                  <label className="cursor-pointer block">
                    <img
                      src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/uploads/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full rounded-2xl object-cover h-[140px] md:h-[240px]"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImage(e, "product", product._id)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <img
                    src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/uploads/placeholder-image.jpg"}
                    alt={product.name}
                    className="w-full rounded-2xl object-cover h-[140px] md:h-[240px] transform transition-transform duration-700 group-hover:scale-110 shadow-xl"
                    onError={handleImageError}
                  />
                )}
                <div className="absolute inset-0 bg-yellow-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-2 md:top-4 left-2 md:left-4 text-white">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleChange("name", e.target.value, index + 1)}
                        className="text-sm md:text-lg font-semibold bg-transparent border-b border-white p-1 w-full mb-2"
                      />
                      <input
                        type="number"
                        value={product.discountPrice || ""}
                        onChange={(e) => handleChange("discountPrice", e.target.value, index + 1)}
                        className="text-xs md:text-sm bg-transparent border-b border-white p-1 w-full"
                        placeholder="Price"
                      />
                    </>
                  ) : (
                    <>
                      <p className={`text-xs md:text-sm font-medium animate-slideInRight delay-${index * 100}`}>Featured</p>
                      <h3 className={`text-sm md:text-lg font-semibold animate-slideInRight delay-${(index + 1) * 100}`}>
                        {product.name}
                      </h3>
                      <p className={`text-xs md:text-sm animate-slideInRight delay-${(index + 2) * 100}`}>
                        ${product.discountPrice || "N/A"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-500 text-center">No additional products to display.</p>
          )}
        </div>
      </section>

      <section id="shop" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Shop Our Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {updatedProducts && updatedProducts.length > 0 ? (
            updatedProducts.map((product, index) => (
              isEditing ? (
                <div
                  key={product._id}
                  className="border border-yellow-100 p-4 md:p-5 rounded-2xl bg-white shadow-lg transition-all duration-500"
                >
                  <label className="cursor-pointer block">
                    <img
                      src={product.images?.[0]?.url ? `${backend_url}${product.images[0].url}` : "/uploads/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full object-cover h-[180px] md:h-[220px] rounded-lg"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImage(e, "product", product._id)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleChange("name", e.target.value, index)}
                    className="mt-3 md:mt-4 font-semibold text-gray-800 text-lg md:text-xl border-b border-gray-300 p-1 w-full"
                  />
                  <input
                    type="number"
                    value={product.discountPrice || ""}
                    onChange={(e) => handleChange("discountPrice", e.target.value, index)}
                    className="mt-2 font-semibold text-gray-800 text-md md:text-lg border-b border-gray-300 p-1 w-full"
                    placeholder="Price"
                  />
                </div>
              ) : (
                <ProductCard key={product._id} data={product} isShop={true} />
              )
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No products available yet.</p>
          )}
        </div>
      </section>

      <section
        id="events"
        className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-r from-yellow-200 to-white rounded-2xl shadow-2xl animate-fadeIn"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Running Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {updatedEvents && updatedEvents.length > 0 ? (
            updatedEvents.map((event, index) => (
              <div key={event._id} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500">
                {isEditing ? (
                  <label className="cursor-pointer block">
                    <img
                      src={event.images?.[0]?.url ? `${backend_url}${event.images[0].url}` : "/uploads/placeholder-image.jpg"}
                      alt={event.name}
                      className="w-full h-48 object-cover"
                      onError={handleImageError}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEventImage(e, event._id, index)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <img
                    src={event.images?.[0]?.url ? `${backend_url}${event.images[0].url}` : "/uploads/placeholder-image.jpg"}
                    alt={event.name}
                    className="w-full h-48 object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={handleImageError}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={event.name}
                        onChange={(e) => handleEventChange("name", e.target.value, index)}
                        className="text-lg md:text-xl font-semibold bg-transparent border-b border-white p-1 w-full"
                      />
                      <input
                        type="number"
                        value={event.discountPrice || ""}
                        onChange={(e) => handleEventChange("discountPrice", e.target.value, index)}
                        className="text-sm md:text-md bg-transparent border-b border-white p-1 w-full"
                        placeholder="Price"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg md:text-xl font-semibold animate-slideInUp">{event.name}</h3>
                      <p className="text-sm md:text-md animate-slideInUp">${event.discountPrice || "N/A"}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No running events at the moment.</p>
          )}
        </div>
      </section>

      <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((review, index) => (
              <div
                key={index}
                className="p-6 bg-yellow-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={review.user.avatar?.url ? `${backend_url}${review.user.avatar.url}` : "/uploads/placeholder-image.jpg"}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-yellow-400"
                    onError={handleImageError}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{review.user.name}</h3>
                    <Ratings rating={review.rating} />
                  </div>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No reviews yet.</p>
          )}
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-white rounded-2xl shadow-xl animate-fadeIn">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-8 md:mb-12 animate-slideInUp">
          About {shopData.shopName}
        </h2>
        <div className="text-center">
          {isEditing ? (
            <textarea
              value={shopData.aboutText}
              onChange={(e) => handleChange("aboutText", e.target.value)}
              className="text-gray-600 mt-4 md:mt-6 text-lg md:text-xl leading-relaxed border border-gray-300 p-2 w-full max-w-4xl mx-auto h-40 resize-none"
            />
          ) : (
            <p className="text-gray-600 mt-4 md:mt-6 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto animate-fadeInUp delay-200">
              {shopData.aboutText}
            </p>
          )}
        </div>
      </section>

      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20 bg-gradient-to-br from-[#FAC50C]/10 to-white rounded-2xl shadow-2xl animate-fadeIn"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 md:mb-8 animate-slideInUp"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in Touch
          </h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 md:mb-12 animate-fadeInUp delay-200">
            Reach out to us for inquiries or support!
          </p>
          <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-8 md:gap-12 animate-fadeInUp delay-300">
            <div className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={shopData.contact.email}
                  onChange={(e) => handleChange("contact.email", e.target.value)}
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium border-b border-gray-300 p-1 w-full text-center"
                />
              ) : (
                <a
                  href={`mailto:${shopData.contact.email}`}
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300"
                >
                  Email Us
                </a>
              )}
            </div>
            <div className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.23.37-.57.25-.91-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63 .99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={shopData.contact.phone}
                  onChange={(e) => handleChange("contact.phone", e.target.value)}
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium border-b border-gray-300 p-1 w-full text-center"
                  required
                />
              ) : (
                <a
                  href={`tel:${shopData.contact.phone}`}
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300"
                >
                  Call Us
                </a>
              )}
            </div>
            <div className="group flex flex-col items-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-white p-4 rounded-full shadow-lg border-2 border-[#FAC50C] group-hover:shadow-xl transition-all duration-300">
                <svg
                  className="w-8 h-8 text-[#FAC50C] group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={shopData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium border-b border-gray-300 p-1 w-full text-center"
                  required
                />
              ) : (
                <a
                  href={shopData.contact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-gray-700 group-hover:text-[#FAC50C] font-medium transition-colors duration-300"
                >
                  Visit Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={handleShare}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center shadow-2xl z-30 animate-bounce"
      >
        <svg className="w-5 md:w-6 h-5 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
        .animate-bounce { animation: bounce 2s infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        input, textarea { outline: none; transition: all 0.3s ease; }
        input:focus, textarea:focus { border-color: #FAC50C; box-shadow: 0 0 5px rgba(250, 197, 12, 0.5); }
      `}</style>
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
          top: "80px", 
        }}
      />
    </div>
  );
};

export default PremiumEdit;