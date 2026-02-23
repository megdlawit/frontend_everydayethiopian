import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import styles from "../../styles/styles";
import { FaHome, FaBuilding, FaStar, FaTruck, FaMapMarkerAlt } from "react-icons/fa";
import { Country, City } from "country-state-city";

export const clearCart = () => ({
  type: "clearCart",
});

const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { ...options, timeout: 10000 });
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Haversine formula to calculate distance between two lat/lon points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getBaseShippingByType = (type) => {
  switch(type) {
    case 'bike': return 30;
    case 'motorbike': return 50;
    case 'car': return 70;
    default: return 50;
  }
};

const getRequiredTransportationType = (cart) => {
  let requiredType = 'bike';
  cart.forEach(item => {
    if (item.transportationType === 'car') {
      requiredType = 'car';
    } else if (item.transportationType === 'motorbike' && requiredType !== 'car') {
      requiredType = 'motorbike';
    }
  });
  return requiredType;
};

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const defaultAddress = user?.addresses?.find((addr) => addr.isDefault) || {};
  const [country, setCountry] = useState("Ethiopia");
  const [city, setCity] = useState("Addis Ababa");
  const [address1, setAddress1] = useState(defaultAddress.address1 || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [saveAddress, setSaveAddress] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [distance, setDistance] = useState(null);
  const [route, setRoute] = useState([]);
  const [warehouseCoords] = useState({ lat: 9.0130556, lon: 38.7516667 }); // Fixed Bole, Addis Ababa
  const [customerCoords, setCustomerCoords] = useState(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [isManualAdjust, setIsManualAdjust] = useState(false);
  const [error, setError] = useState(null);
  const [requiredTransportationType, setRequiredTransportationType] = useState('bike');
  const [shopBreakdown, setShopBreakdown] = useState({}); // New: Per-shop totals
  const DEBOUNCE_TIME = 1000;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const PER_KM_SHIPPING = 5;

  const subTotalPrice = cart.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);

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
    if (cart.length > 0) {
      const type = getRequiredTransportationType(cart);
      setRequiredTransportationType(type);

      // Compute shop breakdown
      const breakdown = {};
      cart.forEach(item => {
        const shopId = typeof item.shopId === "object" ? item.shopId._id : item.shopId;
        if (!breakdown[shopId]) breakdown[shopId] = { subtotal: 0, items: [] };
        breakdown[shopId].subtotal += item.qty * item.discountPrice;
        breakdown[shopId].items.push(item);
      });
      setShopBreakdown(breakdown);
    }
  }, [cart]);

  const discountPercentage = couponCodeData ? discountPrice : 0;
  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentage).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let timeout;
    const calculateShipping = async () => {
      if (!address1 || !city || !country) {
        setShipping(parseFloat((subTotalPrice * 0.1).toFixed(2)));
        setDistance(null);
        setRoute([]);
        setCustomerCoords(null);
        if (cart.length === 0) showToast("error", "Cart Error", "Cart is empty. Please add items.");
        else showToast("error", "Address Error", "Please complete all address fields.");
        return;
      }

      setIsLoadingMap(true);
      setError(null);
      try {
        const fullQuery = `${address1}, ${city}, ${country}`;
        const geoRes = await fetchWithRetry(
          `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=1&addressdetails=1`,
          { withCredentials: true }
        );
        console.log("Customer Geocode Response:", geoRes.data);

        if (geoRes.data.length > 0) {
          const lat = parseFloat(geoRes.data[0].lat);
          const lon = parseFloat(geoRes.data[0].lon);
          if (isNaN(lat) || isNaN(lon)) {
            setShipping(parseFloat((subTotalPrice * 0.1).toFixed(2)));
            setDistance(null);
            setRoute([]);
            setCustomerCoords(null);
            showToast("info", "Coordinates Warning", "Invalid coordinates from address. Try providing more details.");
            return;
          }
          const customer = { lat, lon };
          setCustomerCoords(customer);

          // Calculate approximate straight-line distance using Haversine
          const distanceKm = parseFloat(calculateDistance(warehouseCoords.lat, warehouseCoords.lon, customer.lat, customer.lon).toFixed(2));
          const baseShipping = getBaseShippingByType(requiredTransportationType);
          const newShipping = parseFloat((baseShipping + (distanceKm * PER_KM_SHIPPING)).toFixed(2));
          setDistance(distanceKm);
          setShipping(newShipping);

          // Draw straight line as approximate route
          setRoute([
            [warehouseCoords.lat, warehouseCoords.lon],
            [customer.lat, customer.lon]
          ]);

          showToast("success", "Shipping Success", "Shipping cost calculated successfully!");
        } else {
          setShipping(parseFloat((subTotalPrice * 0.1).toFixed(2)));
          setDistance(null);
          setRoute([]);
          setCustomerCoords(null);
          showToast("info", "Geocode Warning", "Could not geocode address. Try providing landmarks or more details.");
        }
      } catch (error) {
        console.error("Error calculating shipping:", error.response?.data || error.message);
        setError(error.message || "Failed to calculate shipping");
        setShipping(parseFloat((subTotalPrice * 0.1).toFixed(2)));
        setDistance(null);
        setRoute([]);
        setCustomerCoords(null);
        showToast("error", "Shipping Error", "Failed to calculate shipping. Please check server status or try later.");
      } finally {
        setIsLoadingMap(false);
      }
    };

    timeout = setTimeout(calculateShipping, DEBOUNCE_TIME);
    return () => clearTimeout(timeout);
  }, [address1, city, country, subTotalPrice, cart, warehouseCoords, requiredTransportationType]);

  const paymentSubmit = async () => {
    const now = Date.now();
    if (now - lastClickTime < DEBOUNCE_TIME) {
      showToast("info", "Submit Info", "Please wait before submitting again.");
      return;
    }

    if (isSubmitting) {
      showToast("info", "Processing Info", "Order is being processed, please wait.");
      return;
    }

    setIsSubmitting(true);
    setLastClickTime(now);

    try {
      const fullQuery = `${address1}, ${city}, ${country}`;
      const geoRes = await fetchWithRetry(
        `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=1&addressdetails=1`,
        { withCredentials: true }
      );
      if (geoRes.data.length === 0) {
        showToast("error", "Address Error", "Invalid address. Try providing landmarks or more details.");
        setIsSubmitting(false);
        return;
      }
      const lat = parseFloat(geoRes.data[0].lat);
      const lon = parseFloat(geoRes.data[0].lon);
      if (isNaN(lat) || isNaN(lon)) {
        showToast("error", "Coordinates Error", "Invalid coordinates for address.");
        setIsSubmitting(false);
        return;
      }

      if (cart.length === 0) {
        showToast("error", "Cart Error", "Cart is empty.");
        setIsSubmitting(false);
        return;
      }
      if (address1 === "" || country === "" || city === "" || phoneNumber === "") {
        showToast("error", "Validation Error", "Please complete all required shipping address fields and provide a phone number!");
        setIsSubmitting(false);
        return;
      }
      if (shipping <= 0) {
        showToast("error", "Shipping Error", "Shipping cost could not be calculated. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!user.addresses || user.addresses.length === 0) {
        if (saveAddress) {
          await axios.put(
            `${server}/user/update-user-addresses`,
            { country, city, address1, addressType: "Home" },
            { withCredentials: true }
          );
          showToast("success", "Address Saved", "Address saved as default successfully!");
        }
      }

      const shippingAddress = { address1, country, city, phoneNumber };
      const orderData = {
        cart: cart.map((item) => ({
          _id: item._id,
          name: item.name,
          qty: item.qty,
          discountPrice: parseFloat(item.discountPrice.toFixed(2)),
          shopId: typeof item.shopId === "object" ? item.shopId._id : item.shopId,
          isEvent: !!item.Finish_Date,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        })),
        totalPrice: parseFloat(totalPrice),
        subTotalPrice: parseFloat(subTotalPrice.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        discountPrice: parseFloat(discountPercentage.toFixed(2)),
        shippingAddress,
        user: user._id,
        couponCode: couponCodeData ? couponCodeData.name : null,
        couponData: couponCodeData || null,
        transportationType: requiredTransportationType,
        timestamp: Date.now(),
      };

      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      setIsSubmitting(false);
      navigate("/payment");
    } catch (error) {
      console.error("Order preparation error:", error.response?.data || error);
      showToast("error", "Order Error", error.response?.data?.message || "Failed to prepare order.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode.trim();

    if (!name) {
      showToast("error", "Coupon Error", "Please enter a coupon code.");
      return;
    }

    try {
      const res = await axios.post(`${server}/coupon/get-coupon-value/${name}`, {
        cart: cart.map((item) => ({
          _id: item._id,
          shopId: typeof item.shopId === "object" ? item.shopId._id : item.shopId,
          qty: item.qty,
          discountPrice: parseFloat(item.discountPrice.toFixed(2)),
        })),
      }, { withCredentials: true });

      if (!res.data.success || !res.data.couponCode) {
        showToast("error", "Coupon Error", res.data.message || "Coupon code doesn't exist!");
        setCouponCode("");
        setCouponCodeData(null);
        setDiscountPrice(null);
        return;
      }

      const couponCodeValue = res.data.couponCode;
      const shopId = couponCodeValue.shopId;
      const selectedProduct = couponCodeValue.selectedProduct;

      const eligibleItems = cart.filter((item) => item._id === selectedProduct);
      const eligiblePrice = eligibleItems.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);

      if (eligiblePrice === 0) {
        showToast("error", "Coupon Error", "Coupon code is not valid for the products in your cart");
        setCouponCode("");
        setCouponCodeData(null);
        setDiscountPrice(null);
        return;
      }

      const discountPriceValue = parseFloat(((eligiblePrice * couponCodeValue.value) / 100).toFixed(2));
      setDiscountPrice(discountPriceValue);
      setCouponCodeData(couponCodeValue);
      setCouponCode("");
      showToast("success", "Coupon Applied", "Coupon code applied successfully!");
    } catch (error) {
      showToast("error", "Coupon Error", error.response?.data?.message || "Failed to apply coupon code.");
      setCouponCode("");
      setCouponCodeData(null);
      setDiscountPrice(null);
    }
  };

  const handleManualAdjust = () => {
    setIsManualAdjust(true);
    showToast("info", "Map Info", "Click on the map to set your location.");
  };

  const handleLocationSet = (coords) => {
    setCustomerCoords(coords);
    setIsManualAdjust(false);
    showToast("success", "Location Set", "Location set. Recalculating route...");
  };

  const hasValidRoute = route && Array.isArray(route) && route.length > 0 && route.every(coord => Array.isArray(coord) && coord.length === 2 && !isNaN(coord[0]) && !isNaN(coord[1]));

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <ShippingInfo
            user={user}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
            address1={address1}
            setAddress1={setAddress1}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            saveAddress={saveAddress}
            setSaveAddress={setSaveAddress}
            showToast={showToast}
          />
          {/* Shop Breakdown */}
          {/* {Object.keys(shopBreakdown).length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h5 className="text-[18px] font-[500] mb-4 text-[#464646]">Order Breakdown by Shop</h5>
              {Object.entries(shopBreakdown).map(([shopId, data]) => (
                <div key={shopId} className="mb-2">
                  <p>Shop {shopId}: {parseFloat(data.subtotal.toFixed(2))} Birr ({data.items.length} items)</p>
                </div>
              ))}
            </div>
          )} */}
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountPercentage={discountPercentage}
          />
        </div>
      </div>
      <button
        type="button"
        className={`${styles.button} w-[150px] mt-10 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={paymentSubmit}
        disabled={isSubmitting}
      >
        <h5 className="text-white">{isSubmitting ? "Processing..." : "Go to Payment"}</h5>
      </button>

      {/* Toastify container */}
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
  );
};


const ShippingInfo = ({ user, country, setCountry, city, setCity, address1, setAddress1, phoneNumber, setPhoneNumber, saveAddress, setSaveAddress, showToast }) => {
  const [selectedAddressType, setSelectedAddressType] = useState(user?.addresses?.find((addr) => addr.isDefault)?.addressType || "Home");
  const [addressError, setAddressError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleAddressSelect = (type, address1Value, countryValue, cityValue) => {
    setSelectedAddressType(type);
    setAddress1(address1Value);
    setCountry(countryValue);
    setCity(cityValue);
    setAddressError("");
    setAddressSuggestions([]);
  };

  const validateAddress = (value) => {
    if (value.length < 5) {
      setAddressError("Please enter a detailed address (e.g., street name, house number).");
      return false;
    }
    setAddressError("");
    return true;
  };

  const validateAddressGeocode = async () => {
    try {
      const fullQuery = `${address1}, ${city}, ${country}`;
      const geoRes = await fetchWithRetry(
        `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=1&addressdetails=1`,
        { withCredentials: true }
      );
      if (geoRes.data.length > 0) {
        showToast("success", "Address Validated", "Address validated successfully!");
        return true;
      } else {
        setAddressError("Invalid address. Try providing landmarks or more details.");
        return false;
      }
    } catch (error) {
      setAddressError("Failed to validate address. Please check your input or network.");
      return false;
    }
  };

  const fetchSuggestionsDebounced = debounce(async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const fullQuery = `${query}, ${city}, ${country}`;
      const res = await fetchWithRetry(
        `${server}/order/geocode?q=${encodeURIComponent(fullQuery)}&limit=10&addressdetails=1`,
        { withCredentials: true }
      );
      setAddressSuggestions(res.data);
    } catch (error) {
      console.error("Suggestion fetch error:", error);
      setAddressSuggestions([]);
      showToast("info", "Suggestions Warning", "Could not fetch address suggestions.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, 500);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress1(value);
    validateAddress(value);
    fetchSuggestionsDebounced(value);
  };

  const selectSuggestion = (item) => {
    let detailedAddress = '';
    if (item.address?.house_number) detailedAddress += item.address.house_number + ' ';
    if (item.address?.road) detailedAddress += item.address.road + ', ';
    if (item.address?.neighbourhood) detailedAddress += item.address.neighbourhood + ', ';
    if (item.address?.suburb) detailedAddress += item.address.suburb + ', ';
    if (item.address?.city_district) detailedAddress += item.address.city_district + ', ';
    detailedAddress = detailedAddress.trim().replace(/,$/, '') || item.display_name.split(', ').slice(0, 3).join(', ');
    setAddress1(detailedAddress);
    setAddressSuggestions([]);
    validateAddressGeocode();
  };

  const getCurrentLocation = async () => {
    if (isLoadingLocation) return;
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetchWithRetry(
              `${server}/order/reverse-geocode?lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { withCredentials: true }
            );
            const data = res.data;
            if (data.address) {
              const newCountry = "Ethiopia";
              const newCity = "Addis Ababa";
              let newAddress = '';
              if (data.address.house_number) newAddress += data.address.house_number + ' ';
              if (data.address.road) newAddress += data.address.road + ', ';
              if (data.address.neighbourhood) newAddress += data.address.neighbourhood + ', ';
              if (data.address.suburb) newAddress += data.address.suburb + ', ';
              if (data.address.city_district) newAddress += data.address.city_district + ', ';
              newAddress = newAddress.trim().replace(/,$/, '') || data.display_name.split(', ').slice(0, 3).join(', ');
              setCountry(newCountry);
              setCity(newCity);
              setAddress1(newAddress);
              setAddressError("");
              showToast("success", "Location Fetched", "Location fetched and address filled successfully!");
              await validateAddressGeocode();
            } else {
              setAddressError("No address found for this location.");
              showToast("error", "Location Error", "No address found for this location.");
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error.response?.data || error);
            setAddressError("Failed to fetch address from location.");
            showToast("error", "Reverse Geocode Error", "Failed to fetch address from location.");
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          showToast("error", "Geolocation Error", "Failed to get current location. Please enable location services and try again.");
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      showToast("error", "Browser Error", "Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  };

  const getCountryIsoCode = (countryName) => {
    const foundCountry = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    return foundCountry ? foundCountry.isoCode : "ET";
  };

  return (
    <div className="w-full bg-white p-5 rounded-lg">
      <h5 className="text-[18px] font-[500] mb-4 text-[#464646]">Profile Information</h5>
      <div className="p-4 border rounded-lg flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-[#464646] mb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ""}
              required
              className="w-full p-2 border rounded-full"
              readOnly
            />
          </div>
          <div className="w-1/2">
            <label className="block text-[#464646] mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              required
              className="w-full p-2 border rounded-full"
              readOnly
            />
          </div>
        </div>
        <div>
          <label className="block text-[#464646] mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-1/2 p-2 border rounded-full"
            placeholder="Enter phone number"
          />
        </div>
      </div>
      <h5 className="text-[18px] font-[500] mb-2 text-[#464646] mt-4">Your Saved Address</h5>
      <div className="p-6 border rounded-lg flex flex-col gap-4">
        <div className="flex space-x-10">
          {user?.addresses?.length > 0 ? (
            user.addresses.map((item) => (
              <button
                key={item.addressType}
                className={`px-8 py-2 rounded-md flex items-center ${
                  selectedAddressType === item.addressType ? "bg-gray-800 text-white" : "bg-[#E4F1F2] text-[#263238]"
                }`}
                onClick={() => handleAddressSelect(item.addressType, item.address1, item.country, item.city)}
              >
                <span className="mr-2 text-xl">
                  {item.addressType === "Home" ? <FaHome /> : item.addressType === "Office" ? <FaBuilding /> : <FaStar />}
                </span>
                {item.addressType}
                {item.isDefault && <span className="ml-2 text-yellow-400">Default</span>}
              </button>
            ))
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className={`mt-4 p-2 rounded-lg w-[200px] flex items-center justify-center ${isLoadingLocation ? 'bg-[#1F2937] text-[white] cursor-not-allowed ' : 'bg-[#1F2937] text-[white] hover:bg-gray-800 hover:text-white'}`}
              >
                {isLoadingLocation ? 'Loading...' : 'Use Current Location'} <FaTruck className="ml-2" />
              </button>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-[#464646] mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    readOnly
                    className="w-full p-2 border rounded-full bg-gray-100"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-[#464646] mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    readOnly
                    className="w-full p-2 border rounded-full bg-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-full">
                  <label className="block text-[#464646] mb-2">Address</label>
                  <input
                    type="text"
                    value={address1}
                    onChange={handleAddressChange}
                    className={`w-full p-2 border rounded-full ${addressError ? "border-red-500" : ""}`}
                    placeholder="E.g., Bole Road, House No. 123, landmark"
                  />
                  {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
                  {isLoadingSuggestions && <p className="text-gray-500 text-sm mt-1">Searching...</p>}
                  {addressSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto">
                      {addressSuggestions.map((item, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectSuggestion(item)}
                        >
                          {item.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Validate Address button removed */}
              {(!user.addresses || user.addresses.length === 0) && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-[#464646]">Save this address as default</label>
                </div>
              )}
            </div>
          )}
        </div>
        {user?.addresses?.length > 0 && (
          <div className="relative">
            <label className="block text-[#464646] mb-2">Delivered to</label>
            <input
              type="text"
              value={address1 || user.addresses.find((addr) => addr.isDefault)?.address1 || ""}
              onChange={handleAddressChange}
              className={`w-full p-2 border rounded-full ${addressError ? "border-red-500" : ""}`}
              placeholder="E.g., Bole Road, House No. 123, landmark"
            />
            {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
            {isLoadingSuggestions && <p className="text-gray-500 text-sm mt-1">Searching...</p>}
            {addressSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto">
                {addressSuggestions.map((item, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectSuggestion(item)}
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* <p className="text-sm text-gray-500 mt-2">
          Tip: Start typing your street name for suggestions. Include landmarks for better accuracy.
        </p> */}
      </div>
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentage,
}) => {
  return (
    <div className="w-full bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white p-8 rounded-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Subtotal</h3>
        <h5 className="text-[18px] font-light text-white">{subTotalPrice ? `${subTotalPrice.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Shipping</h3>
        <h5 className="text-[18px] font-light text-white">{shipping ? `${shipping.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Discount</h3>
        <h5 className="text-[18px] font-light text-white">{discountPercentage ? `${discountPercentage.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-6">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Total</h3>
        <h5 className="text-[18px] font-light text-white">{totalPrice ? `${totalPrice} Birr` : "0 Birr"}</h5>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-2 border rounded-full text-black"
            placeholder="Enter Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className="w-[50%] p-2 border border-[#FAC50C] text-[#FAC50C] rounded-full bg-transparent hover:bg-[#FAC50C] hover:text-white transition"
            >
              Apply Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckoutSteps = ({ active }) => {
  return (
    <div className="flex flex-col items-center mt-10">
      <div className="w-[90%] 800px:w-[50%] flex justify-between items-center relative">
        <div className="flex items-center">
          <div
            className={`${
              active === 1 ? "bg-black text-white" : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            1
          </div>
          <span className="ml-2 text-lg font-medium">Shipping</span>
        </div>

        <div className="flex items-center">
          <div
            className={`${
              active === 2 ? "bg-black text-white" : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            2
          </div>
          <span className="ml-2 text-lg font-medium">Payment</span>
        </div>

        <div className="flex items-center">
          <div
            className={`${
              active === 3 ? "bg-black text-white" : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            3
          </div>
          <span className="ml-2 text-lg font-medium">Success</span>
        </div>
      </div>

      <div className="w-[800px] mt-2">
        <div className="h-[2px] bg-gray-300 relative">
          <div
            className={`h-full bg-black transition-all duration-300 absolute top-0 left-0`}
            style={{
              width: `${(active / 3) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;