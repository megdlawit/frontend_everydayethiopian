import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createevent } from "../../redux/actions/event";
import { getAllCategories } from "../../redux/actions/category";
import { getAllEventsShop } from "../../redux/actions/event";
import { toast } from "react-toastify";
import api from "../../utils/api";
import peacImg from "../../Assests/images/peac.png";
import { server } from "../../server";
import Toast from "../../components/Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateEvent = ({ isOpen, onClose }) => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.events);
  const { categories } = useSelector((state) => state.category);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [useAIDescription, setUseAIDescription] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

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
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast("error", "Event Error", error);
    }
    if (success) {
      showToast("success", "Success", "Event created successfully!");
      dispatch(getAllEventsShop(seller._id));
      setTimeout(() => {
        navigate("/dashboard-events");
        resetForm();
      }, 2000);
    }
  }, [error, success, navigate, dispatch, seller._id]);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setStartDate(startDate);
    setEndDate(null);
    document.getElementById("end-date").min = minEndDate.toISOString().slice(0, 10);
  };

  const handleEndDateChange = (e) => {
    const endDate = new Date(e.target.value);
    setEndDate(endDate);
  };

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : "";

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);
  };

  const previewAIDescription = async () => {
    setIsLoadingAI(true);
    try {
      if (!name || !category) {
        showToast("error", "Validation Error", "Please provide event name and category for AI description.");
        return;
      }

      const response = await axios.post(
        `${server}/event/preview-ai-description`,
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !category || !discountPrice || !startDate || !endDate || images.length === 0) {
      showToast("error", "Validation Error", "Please fill all required fields and upload images.");
      return;
    }

    if (!useAIDescription && !description) {
      showToast("error", "Validation Error", "Please provide a description or enable AI description.");
      return;
    }

    setIsLoadingAI(true);
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("originalPrice", originalPrice || 0);
    formData.append("discountPrice", discountPrice);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("colors", JSON.stringify(colors));
    formData.append("status", status);
    formData.append("shopId", seller._id);
    formData.append("start_Date", startDate.toISOString());
    formData.append("Finish_Date", endDate.toISOString());
    formData.append("useAIDescription", useAIDescription);

    dispatch(createevent(formData)).finally(() => {
      setIsLoadingAI(false);
    });
  };

  const resetForm = () => {
    setImages([]);
    setName("");
    setDescription("");
    setCategory("");
    setTags("");
    setOriginalPrice("");
    setDiscountPrice("");
    setSizes([]);
    setColors([]);
    setStartDate(null);
    setEndDate(null);
    setStatus("");
    setCustomSize("");
    setCustomColor("");
    setStep(1);
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setUseAIDescription(false);
    setIsLoadingAI(false);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
      <div className="bg-white w-full h-[98vh] mt-2 overflow-y-auto relative rounded-2xl shadow-2xl">
        <button
          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
          onClick={onClose}
        >
          <AiOutlineClose />
        </button>
        <div className="text-center my-4">
          <img src={peacImg} alt="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
          <div className="w-1/2 mx-auto bg-gray-100 rounded-full h-2.5">
            <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 8) * 100}%` }}></div>
          </div>
          <p className="text-gray-500 text-sm">Step {step} of 8</p>
        </div>
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
            <h6 className="text-4xl text-center font-['Quesha'] text-gray-800 mb-6">What's the name of your event?</h6>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-4 block w-1/2 px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
              placeholder="Enter event name..."
            />
            <div className="mt-4 flex justify-end w-1/2">
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={name ? nextStep : () => showToast("error", "Validation Error", "Please enter an event name")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
            <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-6">Choose a category for your event</h6>
            <div className="mt-4 grid grid-cols-4 gap-4 w-3/4">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      category === cat._id
                        ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                        : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setCategory(cat._id)}
                  >
                    {cat.title}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 col-span-4">No categories available</p>
              )}
            </div>
            <div className="mt-4 flex justify-between w-1/2">
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
        {step === 3 && (
          <div className="flex flex-col items-center justify-center min-h-[calc(85vh-200px)] mt-8">
            <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-2">Select sizes and colors</h6>
            <div className="w-3/4 max-w-5xl flex flex-col items-center">
              <div className="w-full mb-8 flex flex-col ml-[8rem]">
                <div className="flex w-full">
                  <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Sizes:</label>
                  <div className="flex flex-wrap gap-2 w-3/4">
                    {["Small", "Medium", "Large", "ExtraLarge"].map((size) => (
                      <button
                        key={size}
                        className={`px-6 py-3 rounded-full border transition-all w-[calc(25%-0.5rem)] text-center ${
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
                          className="px-6 py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] w-[calc(25%-0.5rem)] text-center"
                          onClick={() => toggleSelection(size, sizes, setSizes)}
                        >
                          {size}
                        </button>
                      ))}
                  </div>
                </div>
                {showCustomSizeInput && (
                  <div className="flex gap-2 mt-2 w-full justify-start pl-[25%]">
                    <input
                      type="text"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="Custom size..."
                      className="px-4 py-2 rounded-full border border-gray-300 w-[calc(25%-0.5rem)]"
                    />
                    <button
                      onClick={addCustomSize}
                      className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[calc(25%-0.5rem)] justify-center"
                    >
                      <AiOutlinePlusCircle size={20} />
                    </button>
                  </div>
                )}
                {!showCustomSizeInput && (
                  <button
                    onClick={() => setShowCustomSizeInput(true)}
                    className="mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[calc(25%-0.5rem)] justify-center ml-[25%]"
                  >
                    Add Custom Size
                  </button>
                )}
              </div>
              <div className="w-full mb-8 flex flex-col items-start ml-[8rem]">
                <div className="flex items-start w-full">
                  <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Colors:</label>
                  <div className="flex flex-wrap gap-2 w-3/4">
                    {["White", "Gray", "Black", "Orange"].map((color) => (
                      <button
                        key={color}
                        className={`px-6 py-3 rounded-full border transition-all w-[calc(25%-0.5rem)] text-center ${
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
                          className="px-6 py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] w-[calc(25%-0.5rem)] text-center"
                          onClick={() => toggleSelection(color, colors, setColors)}
                        >
                          {color}
                        </button>
                      ))}
                  </div>
                </div>
                {showCustomColorInput && (
                  <div className="flex gap-2 mt-2 w-full justify-start pl-[25%]">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Custom color..."
                      className="px-4 py-2 rounded-full border border-gray-300 w-[calc(25%-0.5rem)]"
                    />
                    <button
                      onClick={addCustomColor}
                      className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[calc(25%-0.5rem)] justify-center"
                    >
                      <AiOutlinePlusCircle size={20} />
                    </button>
                  </div>
                )}
                {!showCustomColorInput && (
                  <button
                    onClick={() => setShowCustomColorInput(true)}
                    className="mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[calc(25%-0.5rem)] justify-center ml-[25%]"
                  >
                    Add Custom Color
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-between w-1/2 mx-auto">
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
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
            <h6 className="text-4xl font-['Quesha'] text-gray-800">Set your pricing</h6>
            <div className="mt-4 w-1/2">
              <p className="text-gray-600 float-left">Original Price</p>
              <div className="flex flex-wrap justify-between mt-10 gap-2">
                {["800", "1000", "1500", "2000", "2500"].map((price) => (
                  <button
                    key={price}
                    className={`px-4 py-2 rounded-full border transition-all ${
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
                className="mt-2 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                placeholder="Custom price..."
              />
            </div>
            <div className="mt-4 w-1/2">
              <p className="text-gray-600 float-left">Discount Price</p>
              <div className="flex flex-wrap justify-between mt-10 gap-2">
                {["800", "1000", "1500", "2000", "2500"].map((price) => (
                  <button
                    key={price}
                    className={`px-4 py-2 rounded-full border transition-all ${
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
                className="mt-2 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                placeholder="Custom price..."
              />
            </div>
            <div className="mt-4 flex justify-between w-1/2">
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
        {step === 5 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
            <h6 className="text-4xl font-['Quesha'] text-gray-800">Describe your event</h6>
            <div className="mt-4 w-3/4">
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
                className="mt-2 block w-full h-40 px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
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
            <div className="mt-4 flex justify-between w-1/2">
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
        {step === 6 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
            <h6 className="text-4xl font-['Quesha'] text-gray-800">Upload event images</h6>
            <div className="mt-4 w-1/2">
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
                className={`flex items-center justify-center w-full py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <AiOutlinePlusCircle size={30} className="text-gray-500" />
                <span className="ml-2 text-gray-500">Upload Images (Max 4)</span>
              </label>
              <div className="mt-4 flex gap-4 justify-center">
                {images.map((image, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="h-[150px] w-[150px] object-cover rounded-lg border border-gray-300"
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between w-1/2">
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
        {step === 7 && (
          <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
            <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-6">Select start and end dates</h6>
            <div className="mt-4 w-1/2">
              <label className="block text-gray-600 mb-2 float-left w-full text-left">Start Date</label>
              <input
                type="date"
                value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                onChange={handleStartDateChange}
                min={today}
                className="block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
              />
            </div>
            <div className="mt-4 w-1/2">
              <label className="block text-gray-600 mb-2 float-left w-full text-left">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                onChange={handleEndDateChange}
                min={minEndDate}
                className="block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                disabled={!startDate}
              />
            </div>
            <div className="mt-4 flex justify-between w-1/2">
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={startDate && endDate ? nextStep : () => showToast("error", "Validation Error", "Please select start and end dates")}
              >
                <AiOutlineArrowRight className="mr-2" /> Next
              </button>
            </div>
          </div>
        )}
        {step === 8 && (
          <div className="w-full my-6 relative">
            <h6 className="text-4xl font-['Quesha'] text-gray-800 text-center mb-10">Review your offer</h6>
            <div className="w-full max-w-3xl mx-auto bg-gradient-to-b from-[#4A9CA4] to-[#1C3B3E] rounded-xl shadow-xl overflow-visible flex flex-col md:flex-row items-start px-6 md:px-8 py-6 relative min-h-[300px]">
              <div className="md:w-1/2 text-white flex flex-col gap-4 ml-6">
                <h1
                  className="text-[48px] leading-tight"
                  style={{ fontFamily: "Quesha, cursive", color: "#FFE180" }}
                >
                  Popular Event
                </h1>
                <h2
                  className="text-[28px]"
                  style={{ fontFamily: "Avenir LT Std, sans-serif", fontWeight: 400 }}
                >
                  {name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="line-through text-gray-300 text-base">{originalPrice || "N/A"} ETB</span>
                  <span className="text-yellow-400 text-lg font-bold">{discountPrice || "N/A"} ETB</span>
                </div>
              </div>
              <div className="md:w-1/2 flex flex-col items-center mt-[-60px] relative z-10">
                <div className="rounded-lg overflow-hidden border-[2px] border-yellow-300 shadow-md">
                  <img
                    src={images.length > 0 ? URL.createObjectURL(images[mainImageIdx]) : ""}
                    alt={name}
                    className="w-[300px] h-[200px] object-cover"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {images.map((image, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(image)}
                      alt={`thumb-${idx}`}
                      onClick={() => setMainImageIdx(idx)}
                      className="w-16 h-14 object-cover rounded cursor-pointer border border-gray-400 hover:scale-105 transition"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between w-1/2 mx-auto">
              <button
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                onClick={prevStep}
              >
                <AiOutlineArrowLeft size={20} />
              </button>
              <button
                className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                onClick={handleSubmit}
                disabled={isLoadingAI}
              >
                {isLoadingAI ? "Creating..." : "Create"}
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

export default CreateEvent;