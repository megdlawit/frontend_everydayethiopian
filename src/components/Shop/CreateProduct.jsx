import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { getAllCategories } from "../../redux/actions/category";
import { addTocart } from "../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { toast } from "react-toastify";
import api from "../../utils/api";
import peacImg from "../../Assests/images/peac.png";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import { server, backend_url } from "../../server";
import Toast from "../../components/Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProduct = ({ isOpen, onClose }) => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.category);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [click, setClick] = useState(false);
  const [useAIDescription, setUseAIDescription] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isPreorder, setIsPreorder] = useState(false);
  const [estimatedOrderDays, setEstimatedOrderDays] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast("error", "Product Error", error);
    }
    if (success && seller) {
      // showToast("success", "Success", "Product created successfully!");
      navigate("/dashboard");
      resetForm();
    }
  }, [dispatch, error, success, seller, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);
  };
  
const previewAIDescription = async () => {
  setIsLoadingAI(true);
  try {
    if (!name || !category) {
      showToast("error", "Validation Error", "Please provide product name and category for AI description.");
      return;
    }

    const response = await axios.post(
      `${server}/product/preview-ai-description`,
      {
        name,
        category,
        sizes: sizes.length > 0 ? sizes : [],
        colors: colors.length > 0 ? colors : [],
        useAIDescription: true,
      },
      { withCredentials: true }
    );

    setDescription(response.data.description);
    showToast("success", "AI Success", "AI description preview generated!");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("Preview AI Description Error:", errorMessage);
    showToast("error", "AI Error", `Failed to preview AI description: ${errorMessage}`);
  } finally {
    setIsLoadingAI(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !discountPrice || images.length === 0) {
      showToast("error", "Validation Error", "Please fill all required fields and upload images.");
      return;
    }

    if (!useAIDescription && !description) {
      showToast("error", "Validation Error", "Please provide a description or enable AI description.");
      return;
    }

    setIsLoadingAI(true);
    const newForm = new FormData();
    images.forEach((image) => {
      newForm.append("images", image);
    });
    newForm.append("name", name);
    newForm.append("description", description);
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice || 0);
    newForm.append("discountPrice", discountPrice);
    newForm.append("sizes", JSON.stringify(sizes));
    newForm.append("colors", JSON.stringify(colors));
    newForm.append("status", status);
    newForm.append("shopId", seller._id);
    newForm.append("useAIDescription", useAIDescription);
    newForm.append("isPreorder", isPreorder);
    newForm.append("estimatedOrderDays", estimatedOrderDays || "");

    try {
      await dispatch(createProduct(newForm));
    } catch (error) {
      showToast("error", "Creation Error", "Failed to create product: " + error.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const resetForm = () => {
    setImages([]);
    setName("");
    setDescription("");
    setCategory("");
    setTags("");
    setOriginalPrice("");
    setDiscountPrice("");
    setStock("");
    setSizes([]);
    setColors([]);
    setStatus("");
    setCustomSize("");
    setCustomColor("");
    setStep(1);
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setCount(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setClick(false);
    setUseAIDescription(false);
    setIsLoadingAI(false);
    setIsPreorder(false);
    setEstimatedOrderDays("");
    onClose();
  };

  const addCustomSize = () => {
    if (customSize && !sizes.includes(customSize)) {
      setSizes([...sizes, customSize]);
      setCustomSize("");
      setShowCustomSizeInput(false);
    }
  };

  const addCustomColor = () => {
    if (customColor && !colors.includes(customColor)) {
      setColors([...colors, customColor]);
      setCustomColor("");
      setShowCustomColorInput(false);
    }
  };

  const toggleSelection = (item, array, setArray) => {
    setArray((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const incrementCount = () => {
    if (count < stock) {
      setCount(count + 1);
    } else {
      showToast("error", "Stock Limit", `Maximum stock limit reached: ${stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addToCartHandler = () => {
    const productData = {
      _id: `temp_${name}_${Date.now()}`,
      name,
      description,
      discountPrice,
      stock,
      sizes,
      colors,
      images: images.map((img) => ({ url: URL.createObjectURL(img) })),
    };
    const isItemExists = cart && cart.find((i) => i._id === productData._id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else {
      if (stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = { ...productData, qty: count, selectedSize, selectedColor };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Success", "Item added to cart successfully!");
      }
    }
    if (stock > 0 && stock <= 5) {
      showToast("warn", "Low Stock", `Only ${stock} items left in stock!`);
    }
  };

  const removeFromWishlistHandler = () => {
    setClick(false);
    dispatch(removeFromWishlist({ _id: `temp_${name}_${Date.now()}` }));
  };

  const addToWishlistHandler = () => {
    setClick(true);
    dispatch(addToWishlist({
      _id: `temp_${name}_${Date.now()}`,
      name,
      description,
      discountPrice,
      stock,
      sizes,
      colors,
      images: images.map((img) => ({ url: URL.createObjectURL(img) })),
    }));
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!seller?._id) {
        showToast("error", "Seller Error", "Seller information is unavailable.");
        return;
      }
      const groupTitle = `temp_${name}_${Date.now()}_${user._id}`;
      const userId = user._id;
      const sellerId = seller._id;
      try {
        const res = await axios.post(
          `${server}/conversation/create-new-conversation`,
          { groupTitle, userId, sellerId },
          { withCredentials: true }
        );
        navigate(`/inbox?${res.data.conversation._id}`);
      } catch (error) {
        showToast("error", "Conversation Error", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Auth Error", "Please login to create a conversation");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen font-avenir p-2 md:p-0">
      <div className={`bg-white ${isMobile ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl`}>
        <button
          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
          onClick={onClose}
        >
          <AiOutlineClose />
        </button>
        <div className="text-center my-4">
          <img src={peacImg} alt="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
          <div className={`${isMobile ? 'w-3/4' : 'w-1/2'} mx-auto bg-gray-100 rounded-full h-2.5`}>
            <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 7) * 100}%` }}></div>
          </div>
          <p className="text-gray-500 text-sm">Step {step} of 7</p>
        </div>
        
        {/* Step 1: Product Name */}
        {step === 1 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-center font-['Quesha'] text-gray-800 mb-6`}>What's the name of your product?</h6>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-4 md:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
              placeholder="Enter product name..."
            />
            <div className={`mt-4 flex justify-end ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={name ? nextStep : () => showToast("error", "Validation Error", "Please enter a product name")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 2 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>Choose a category for your product</h6>
            <div className={`mt-4 grid ${isMobile ? 'grid-cols-2 gap-3 w-5/6' : 'grid-cols-4 gap-4 w-3/4'}`}>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`px-3 md:px-4 py-2 rounded-full border transition-all ${
                      category === cat._id
                        ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                        : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                    } ${isMobile ? 'text-sm' : ''}`}
                    onClick={() => setCategory(cat._id)}
                  >
                    {cat.title}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 col-span-4">No categories available</p>
              )}
            </div>
            <div className={`mt-4 flex justify-between ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={category ? nextStep : () => showToast("error", "Validation Error", "Please select a category")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sizes and Colors */}
        {step === 3 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'min-h-[calc(85vh-150px)] mt-4' : 'min-h-[calc(85vh-200px)] mt-8'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-2`}>Select sizes and colors</h6>
            <div className={`${isMobile ? 'w-5/6' : 'w-3/4 max-w-5xl'} flex flex-col items-center`}>
              
              {/* Sizes Section */}
              <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col ${isMobile ? '' : 'ml-[8rem]'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'w-full'}`}>
                  <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Sizes:</label>
                  <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                    {["Small", "Medium", "Large", "ExtraLarge"].map((size) => (
                      <button
                        key={size}
                        className={`px-3 md:px-6 py-2 md:py-3 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
                          sizes.includes(size)
                            ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                            : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleSelection(size, sizes, setSizes)}
                      >
                        {size}
                      </button>
                    ))}
                    {sizes
                      .filter((size) => !["Small", "Medium", "Large", "ExtraLarge"].includes(size))
                      .map((size) => (
                        <button
                          key={size}
                          className={`px-3 md:px-6 py-2 md:py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                          onClick={() => toggleSelection(size, sizes, setSizes)}
                        >
                          {size}
                        </button>
                      ))}
                  </div>
                </div>
                {showCustomSizeInput && (
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} mt-2 w-full justify-start ${isMobile ? 'pl-0' : 'pl-[25%]'}`}>
                    <input
                      type="text"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="Custom size..."
                      className="px-4 py-2 rounded-full border border-gray-100"
                    />
                    <button
                      onClick={addCustomSize}
                      className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center"
                    >
                      <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
                    </button>
                  </div>
                )}
                {!showCustomSizeInput && (
                  <button
                    onClick={() => setShowCustomSizeInput(true)}
                    className={`mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center ${isMobile ? '' : 'ml-[25%]'}`}
                  >
                    <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
                  </button>
                )}
              </div>

              {/* Colors Section */}
              <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col items-start ${isMobile ? '' : 'ml-[8rem]'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'items-start w-full'}`}>
                  <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Colors:</label>
                  <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                    {["White", "Gray", "Black", "Orange"].map((color) => (
                      <button
                        key={color}
                        className={`px-3 md:px-6 py-2 md:py-3 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
                          colors.includes(color)
                            ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                            : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleSelection(color, colors, setColors)}
                      >
                        {color}
                      </button>
                    ))}
                    {colors
                      .filter((color) => !["White", "Gray", "Black", "Orange"].includes(color))
                      .map((color) => (
                        <button
                          key={color}
                          className={`px-3 md:px-6 py-2 md:py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                          onClick={() => toggleSelection(color, colors, setColors)}
                        >
                          {color}
                        </button>
                      ))}
                  </div>
                </div>
                {showCustomColorInput && (
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} mt-2 w-full justify-start ${isMobile ? 'pl-0' : 'pl-[25%]'}`}>
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Custom color..."
                      className="px-4 py-2 rounded-full border border-gray-300"
                    />
                    <button
                      onClick={addCustomColor}
                      className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center"
                    >
                      <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                    </button>
                  </div>
                )}
                {!showCustomColorInput && (
                  <button
                    onClick={() => setShowCustomColorInput(true)}
                    className={`mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-full md:w-[200px] justify-center ${isMobile ? '' : 'ml-[25%]'}`}
                  >
                    <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                  </button>
                )}
              </div>
            </div>
            <div className={`mt-4 flex justify-between ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={nextStep}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Set your pricing</h6>
            
            {/* Original Price */}
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <p className="text-gray-600 float-left">Original Price</p>
              <div className={`flex flex-wrap justify-between ${isMobile ? 'mt-6 gap-1' : 'mt-10 gap-2'}`}>
                {["800", "1000", "1500", "2000", "2500"].map((price) => (
                  <button
                    key={price}
                    className={`px-3 py-2 rounded-full border transition-all ${isMobile ? 'text-xs w-[calc(33%-0.25rem)] mb-2' : ''} ${
                      originalPrice === price
                        ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                        : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setOriginalPrice(price)}
                  >
                    {price} ETB
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={originalPrice === "" ? "" : originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                placeholder="Custom price..."
              />
            </div>

            {/* Discount Price */}
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <p className="text-gray-600 float-left">Discount Price</p>
              <div className={`flex flex-wrap justify-between ${isMobile ? 'mt-6 gap-1' : 'mt-10 gap-2'}`}>
                {["800", "1000", "1500", "2000", "2500"].map((price) => (
                  <button
                    key={price}
                    className={`px-3 py-2 rounded-full border transition-all ${isMobile ? 'text-xs w-[calc(33%-0.25rem)] mb-2' : ''} ${
                      discountPrice === price
                        ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                        : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setDiscountPrice(price)}
                  >
                    {price} ETB
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={discountPrice === "" ? "" : discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                placeholder="Custom price..."
              />
            </div>

            {/* Pre-order Option */}
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPreorder}
                  onChange={(e) => setIsPreorder(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-gray-600">Mark as Pre-order</label>
              </div>
              {isPreorder && (
                <div className="mt-2">
                  <label className="text-gray-600 block">Estimated Fulfillment (days)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[2,7,14,30].map((d) => (
                      <button
                        key={d}
                        className={`px-3 py-2 rounded-full border ${estimatedOrderDays == d ? 'border-[#FFC300] bg-[#FFF5CC] text-[#FFC300]' : 'border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => setEstimatedOrderDays(String(d))}
                      >
                        {d} days
                      </button>
                    ))}
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={1}
                        placeholder="Custom"
                        value={estimatedOrderDays}
                        onChange={(e) => setEstimatedOrderDays(e.target.value)}
                        className="mt-2 block w-28 px-3 py-2 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180]"
                      />
                      <span className="ml-2 text-sm text-gray-500">days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`mt-4 flex justify-between ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={discountPrice ? nextStep : () => showToast("error", "Validation Error", "Please enter a discount price")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Description */}
        {step === 5 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Describe your product</h6>
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-3/4'}`}>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={useAIDescription}
                  onChange={(e) => {
                    setUseAIDescription(e.target.checked);
                    if (e.target.checked) setDescription("");
                  }}
                  className="mr-2"
                />
                <label className="text-gray-600">Generate AI Description</label>
              </div>
              <p className="text-gray-600 float-left">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 block w-full h-32 md:h-40 px-4 md:px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                placeholder="Enter description..."
                disabled={useAIDescription || isLoadingAI}
              />
              {useAIDescription && (
                <button
                  className="mt-2 px-4 py-2 bg-[#FFC300] text-white rounded-full hover:bg-[#FFD700]"
                  onClick={previewAIDescription}
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? "Generating..." : "Preview AI Description"}
                </button>
              )}
              {isLoadingAI && <p className="text-gray-500 mt-2">Generating AI description...</p>}
            </div>
            <div className={`mt-4 flex justify-between ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={nextStep}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Image Upload */}
        {step === 6 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Upload product images</h6>
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <input
                type="file"
                name="images"
                id="upload"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="upload"
                className={`flex items-center justify-center w-full py-4 md:py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <AiOutlinePlusCircle size={isMobile ? 24 : 30} className="text-gray-600" />
                <span className="ml-2 text-gray-600 text-sm md:text-base">Upload Images (Max 4)</span>
              </label>
              <div className="mt-4 flex gap-2 md:gap-4 justify-center flex-wrap">
                {images.map((image, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className={`${isMobile ? 'h-[100px] w-[100px]' : 'h-[150px] w-[150px]'} object-cover rounded-lg border border-gray-300`}
                    />
                    <input
                      type="file"
                      id={`replace-${idx}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files[0]) {
                          setImages((prev) => {
                            const newImages = [...prev];
                            newImages[idx] = files[0];
                            return newImages;
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`replace-${idx}`}
                      className="absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-[#FFC300] text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-[#FFD700]"
                    >
                      Replace
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className={`mt-4 flex justify-between ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={images.length > 0 ? nextStep : () => showToast("error", "Validation Error", "Please upload at least one image")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(98vh-100px)] p-4 mt-4' : 'h-[calc(98vh-150px)] p-8 mt-[10rem]'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-4`}>Review your product</h6>
            <div className={`${isMobile ? 'w-full' : 'w-[90%]'} mx-auto py-5`}>
              <div className="flex flex-col md:flex-row">
                
                {/* Images Section */}
                <div className="w-full md:w-1/2">
                  <img
                    src={images.length > 0 ? URL.createObjectURL(images[mainImageIdx]) : ""}
                    alt="main preview"
                    className={`${isMobile ? 'w-full h-[300px]' : 'w-[550px] h-[550px] mx-auto md:mx-0'} border-2 border-white rounded-lg object-cover`}
                  />
                  <div className="relative">
                    <div className={`absolute ${isMobile ? 'top-[-12rem] w-full' : 'top-[-28rem] w-[550px]'} flex justify-center`}>
                      <div className="flex items-center space-x-2 md:space-x-4">
                        {[...Array(images.length)].map((_, i) => (
                          <div
                            key={i}
                            className={`${isMobile ? 'h-1.5' : 'h-2'} rounded-full ${
                              mainImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                            }`}
                            onClick={() => setMainImageIdx(i)}
                            style={{ width: isMobile ? "40px" : "100px" }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className={`flex justify-center ${isMobile ? 'mt-4' : 'mt-[-5rem]'}`}>
                      {images.map((image, idx) => (
                        <div
                          key={idx}
                          className="cursor-pointer mx-1 md:mx-2"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`thumb-${idx}`}
                            className={`${isMobile ? 'w-16 h-12' : 'w-[100px] h-[70px]'} object-cover border-2 border-white rounded-lg`}
                            onClick={() => setMainImageIdx(idx)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div className={`w-full md:w-1/2 ${isMobile ? 'mt-6' : 'md:pl-10 mt-5 md:mt-0'}`}>
                  <h1 className={`${styles.productTitle} ${isMobile ? 'text-xl' : ''}`} style={{ color: "#1c3b3c" }}>
                    {name || "Product Name"}
                  </h1>
                  <div className="flex items-center mt-2">
                    <Ratings rating={0} />
                  </div>
                  {isPreorder && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="bg-[#FFF5CC] text-[#CC9A00] px-3 py-1 rounded-full text-sm font-medium">Pre-order</span>
                      <span className="text-gray-600 text-sm">{estimatedOrderDays ? `Estimated: ${estimatedOrderDays} day${estimatedOrderDays > 1 ? 's' : ''}` : 'Estimated: TBA'}</span>
                    </div>
                  )}
                  <p className="text-gray-600 mt-2 text-sm md:text-base">{description || "No description provided"}</p>
                  <div className="flex items-center mt-4">
                    <h4 className={`${styles.productDiscountPrice} ${isMobile ? 'text-lg' : ''}`}>
                      {discountPrice} birr
                    </h4>
                    {originalPrice && (
                      <h3 className={`${styles.price} ml-2 ${isMobile ? 'text-sm' : ''}`}>{originalPrice} birr</h3>
                    )}
                  </div>

                  {/* Size Selection */}
                  <div className="mt-4 md:mt-6">
                    <label className="text-gray-800 font-semibold">Select Size</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes.length > 0 ? (
                        sizes.map((size) => (
                          <button
                            key={size}
                            className={`px-3 py-2 rounded-full text-sm ${
                              selectedSize === size
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-800"
                            } hover:bg-gray-200`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No sizes available</p>
                      )}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mt-4 md:mt-6">
                    <label className="text-gray-800 font-semibold">Select Color</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colors.length > 0 ? (
                        colors.map((color) => (
                          <button
                            key={color}
                            className={`px-3 py-2 rounded-full text-sm ${
                              selectedColor === color
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-800"
                            } hover:bg-gray-200`}
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No colors available</p>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Section */}
                  <div className="flex items-center mt-4 md:mt-6 space-x-2 md:space-x-4">
                    <div className="flex items-center">
                      <button
                        className="w-6 h-6 md:w-8 md:h-8 border-2 border-[#CC9A00] rounded-full flex items-center justify-center hover:bg-gray-100"
                        style={{ color: "#CC9A00" }}
                        onClick={decrementCount}
                      >
                        -
                      </button>
                      <span className="mx-2 md:mx-4 text-gray-800 font-medium text-sm md:text-base">{count}</span>
                      <button
                        className="w-6 h-6 md:w-8 md:h-8 border-2 border-[#CC9A00] rounded-full flex items-center justify-center hover:bg-gray-100"
                        style={{ color: "#CC9A00" }}
                        onClick={incrementCount}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bg-[#CC9A00] text-white py-2 md:py-3 px-4 md:px-10 rounded-full flex items-center justify-center hover:bg-yellow-500 text-sm md:text-base"
                      onClick={addToCartHandler}
                    >
                      <AiOutlineShoppingCart className="mr-1 md:mr-2" /> Add to Cart
                    </button>
                    <div className="relative">
                      {click ? (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center">
                          <AiFillHeart
                            size={isMobile ? 20 : 24}
                            className="cursor-pointer"
                            onClick={removeFromWishlistHandler}
                            color={click ? "red" : "#333"}
                            title="Remove from wishlist"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center">
                          <AiOutlineHeart
                            size={isMobile ? 20 : 24}
                            className="cursor-pointer"
                            onClick={addToWishlistHandler}
                            color={click ? "red" : "#333"}
                            title="Add to wishlist"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="mt-4 md:mt-6">
                    <div className={`bg-white shadow-md rounded-lg p-3 md:p-4 ${isMobile ? 'w-full' : 'w-3/4 float-left'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Link to={`/shop/preview/${seller?._id}`}>
                            <img
                              src={getImageUrl(seller?.avatar?.url)}
                              alt={seller?.name}
                              className={`${isMobile ? 'w-8 h-8' : 'w-[50px] h-[50px]'} rounded-full mr-2 md:mr-3 object-cover`}
                            />
                          </Link>
                          <div>
                            <Link to={`/shop/preview/${seller?._id}`}>
                              <h3 className={`${styles.shop_name} ${isMobile ? 'text-sm' : ''}`}>{seller?.name || "Seller Name"}</h3>
                            </Link>
                            <div className="flex mt-1">
                              <Ratings rating={0} />
                            </div>
                          </div>
                        </div>
                        <button
                          className={`text-[#CC9A00] border-2 border-[#CC9A00] py-1 md:py-2 px-2 md:px-4 rounded-full hover:bg-gray-100 bg-transparent ${isMobile ? 'text-xs' : ''}`}
                          onClick={handleMessageSubmit}
                        >
                          Send Message <AiOutlineMessage className="ml-1 inline" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className={`mt-4 md:mt-6 flex justify-between ${isMobile ? 'w-full' : 'w-[90%]'}`}>
                <button
                  className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  onClick={prevStep}
                >
                  <AiOutlineArrowLeft size={20} />
                </button>
                <button
                  className="bg-[#CC9A00] text-white py-2 md:py-3 px-6 md:px-10 rounded-full flex items-center justify-center hover:bg-yellow-500 text-sm md:text-base"
                  onClick={handleSubmit}
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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

export default CreateProduct;