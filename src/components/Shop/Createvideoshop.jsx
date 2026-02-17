import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { getAllCategories } from "../../redux/actions/category";
import { toast } from "react-toastify";
import peacImg from "../../Assests/images/peac.png";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import Toast from "../../components/Toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateVideoShop = ({ isOpen, onClose }) => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.category);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [video, setVideo] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [status, setStatus] = useState("Active");
  const [step, setStep] = useState(1);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast("error", "Product Error", error);
      dispatch({ type: "clearErrors" });
    }
    if (success && seller) {
      showToast("success", "Success", "Video product created successfully!");
      navigate("/dashboard-allvideo");
      resetForm();
    }
  }, [dispatch, error, success, seller, navigate]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !description || !category || !discountPrice || !video) {
      showToast("error", "Validation Error", "Please fill all required fields and upload a video.");
      return;
    }

    const newForm = new FormData();
    newForm.append("video", video);
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

    dispatch(createProduct(newForm));
  };

  const resetForm = () => {
    setVideo(null);
    setName("");
    setDescription("");
    setCategory("");
    setTags("");
    setOriginalPrice("");
    setDiscountPrice("");
    setSizes([]);
    setColors([]);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setStatus("Active");
    setStep(1);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleSelection = (item, array, setArray) => {
    setArray((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
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

  const discountPercent = originalPrice && parseFloat(originalPrice) > parseFloat(discountPrice)
    ? Math.round(((parseFloat(originalPrice) - parseFloat(discountPrice)) / parseFloat(originalPrice)) * 100)
    : null;

  const getCategoryName = (categoryId) => {
    const categoryItem = categories.find((cat) => cat._id === categoryId);
    return categoryItem ? categoryItem.title : "Unknown Category";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-0">
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
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-center font-['Quesha'] text-gray-800 mb-6`}>What's the name of your video product?</h6>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-4 md:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
              placeholder="Enter video product name..."
              aria-required="true"
            />
            <div className={`mt-4 flex justify-end ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={name ? nextStep : () => showToast("error", "Validation Error", "Please enter a video product name")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 2 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>Choose a category for your video product</h6>
            <div className={`mt-4 grid ${isMobile ? 'grid-cols-2 gap-3 w-5/6' : 'grid-cols-4 gap-4 w-3/4'}`}>
              {categories.map((cat) => (
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
              ))}
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
                      className="px-4 py-2 rounded-full border border-gray-300"
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
                className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                placeholder="Custom price..."
                onChange={(e) => setDiscountPrice(e.target.value)}
                aria-required="true"
              />
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
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Describe your video product</h6>
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-3/4'}`}>
              <p className="text-gray-600 float-left">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 block w-full h-32 md:h-40 px-4 md:px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                placeholder="Enter description..."
                aria-required="true"
              />
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
                onClick={description ? nextStep : () => showToast("error", "Validation Error", "Please provide a description")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Video Upload */}
        {step === 6 && (
          <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
            <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Upload product video</h6>
            <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
              <input
                type="file"
                name="video"
                id="upload-video"
                className="hidden"
                accept="video/*"
                onChange={handleVideoChange}
                aria-required="true"
              />
              <label
                htmlFor="upload-video"
                className={`flex items-center justify-center w-full py-4 md:py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100`}
              >
                <AiOutlinePlusCircle size={isMobile ? 24 : 30} className="text-gray-600" />
                <span className="ml-2 text-gray-600 text-sm md:text-base">Upload Video (Max 1)</span>
              </label>
              {video && (
                <div className="mt-4 flex justify-center">
                  <video
                    src={URL.createObjectURL(video)}
                    className={`${isMobile ? 'h-[120px] w-[120px]' : 'h-[150px] w-[150px]'} object-cover rounded-lg border border-gray-300`}
                    controls
                  />
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
                onClick={video ? nextStep : () => showToast("error", "Validation Error", "Please upload a video")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className={`w-full ${isMobile ? 'px-4 py-4' : 'w-[90%] mx-auto py-5'}`}>
            <div className="flex flex-col md:flex-row">
              
              {/* Video Section */}
              <div className="w-full md:w-1/2">
                {video ? (
                  <video
                    src={URL.createObjectURL(video)}
                    className={`${isMobile ? 'w-full h-[300px]' : 'w-[550px] h-[500px] mx-auto md:mx-0'} border-2 border-white rounded-lg object-contain`}
                    controls
                  />
                ) : (
                  <div className={`${isMobile ? 'w-full h-[300px]' : 'w-[550px] h-[500px] mx-auto md:mx-0'} bg-gray-100 border-2 border-white rounded-lg flex items-center justify-center`}>
                    <span className="text-gray-500">No Video Available</span>
                  </div>
                )}
                <div className={`${isMobile ? 'mt-4' : 'mt-10'}`}>
                  <div className={`bg-white border border-[#B4B4B4] rounded-lg p-3 md:p-4 ${isMobile ? 'w-full' : 'w-3/4 mx-auto'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Link to={`/shop/preview/${seller?._id}`}>
                          <img
                            src={
                              seller?.avatar?.url
                                ? seller.avatar.url.startsWith('http')
                                  ? seller.avatar.url
                                  : `${backend_url}${seller.avatar.url}`
                                : peacImg
                            }
                            alt={seller?.name || "Shop"}
                            className={`${isMobile ? 'w-10 h-10' : 'w-[50px] h-[50px]'} rounded-full mr-2 md:mr-3 object-cover`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = peacImg;
                            }}
                          />
                        </Link>
                        <div>
                          <Link to={`/shop/preview/${seller?._id}`}>
                            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
                              {seller?.name || "Unknown Shop"}
                            </h3>
                          </Link>
                          <div className="flex mt-1">
                            <Ratings rating={0} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className={`w-full md:w-1/2 ${isMobile ? 'mt-6' : 'md:pl-10 mt-5 md:mt-0'}`}>
                <button
                  onClick={() => navigate(`/products?category=${category}`)}
                  className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                >
                  <p className="text-sm">{getCategoryName(category)}</p>
                </button>
                <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 mb-4`}>
                  {name || "Unnamed Video Product"}
                </h1>
                <div className="flex items-center justify-start mt-2 mb-6">
                  <div className="flex items-center">
                    <h4 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>
                      {discountPrice ? `${discountPrice} ETB` : "N/A"}
                    </h4>
                    {originalPrice && (
                      <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 line-through ml-2`}>
                        {originalPrice} ETB
                      </h3>
                    )}
                  </div>
                  <div className={`${isMobile ? 'ml-4' : 'ml-20'}`}>
                    <Ratings rating={0} />
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mt-4 md:mt-6">
                  <label className="text-gray-800 font-light">Available Sizes</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.length > 0 ? (
                      sizes.map((size) => (
                        <span
                          key={size}
                          className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No sizes available</p>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mt-4 md:mt-6">
                  <label className="text-gray-800 font-light">Available Colors</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.length > 0 ? (
                      colors.map((color) => (
                        <span
                          key={color}
                          className="px-3 py-2 rounded-[16px] bg-gray-100 text-gray-800 text-sm"
                        >
                          {color}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No colors available</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className={`mt-4 md:mt-6 p-3 md:p-4 border border-[#525252] rounded-lg ${isMobile ? 'w-full' : 'w-3/4'}`}>
                  <p className="text-gray-600 text-sm md:text-base">
                    {description || "No description available"}
                  </p>
                </div>

                {/* Offer Banner */}
                <div className={`mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 md:p-4 flex items-center ${isMobile ? 'w-full' : 'w-3/4'}`}>
                  <img
                    src={peacImg}
                    alt="Offer"
                    className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} mr-3 object-contain`}
                  />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>
                    {discountPercent
                      ? `Save ${discountPercent}% today. Limited time offer!`
                      : "Great Value! Limited time offer!"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className={`mt-4 md:mt-6 flex justify-between ${isMobile ? 'w-full' : 'w-full'}`}>
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="bg-[#CC9A00] text-white py-2 md:py-3 px-6 md:px-10 rounded-full flex items-center justify-center hover:bg-yellow-500 text-sm md:text-base"
                onClick={handleSubmit}
              >
                Create
              </button>
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

export default CreateVideoShop;