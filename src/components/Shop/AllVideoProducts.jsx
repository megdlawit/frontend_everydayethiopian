import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { FiHome, FiShoppingBag, FiVideo, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllVideoProducts, deleteProduct, updateProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import { Button, Modal, TextField, createTheme, ThemeProvider } from "@material-ui/core";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; 
import Pagination from "../Pagination";
import CreateVideoShop from "./Createvideoshop";
import VideoProductDetail from "../Products/VideoProductDetail";
import DeleteModal from "../DeleteModal";
import peacImg from "../../Assests/images/peac.png"; 
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";

const AllVideoProducts = () => {
  const { allVideoProducts = [], isLoading, success, error } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const { categories } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [formData, setFormData] = useState({
    video: null,
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    status: "",
    sizes: [],
    colors: [],
  });
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const itemsPerPage = 5;

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

  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

  useEffect(() => {
    if (seller?._id) {
      if (/^[0-9a-fA-F]{24}$/.test(seller._id)) {
        dispatch(getAllVideoProducts(seller._id));
      } else {
        console.error("Invalid seller ID:", seller._id);
        showToast("error", "Error", "Invalid shop ID. Please try again.");
      }
    } else {
      console.error("Seller ID is undefined");
      showToast("error", "Error", "Shop ID is not available. Please log in again.");
    }
  }, [dispatch, seller?._id]);

  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
      dispatch({ type: "clearErrors" });
    }
    if (success) {
      showToast("success", "Success", "Video product updated successfully!");
      dispatch({ type: "clearSuccess" });
    }
  }, [error, success, dispatch]);

  const handleOpen = (product) => {
    if (product && product._id) {
      setSelectedProduct(product);
      setFormData({
        video: product.video || null,
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        tags: product.tags || "",
        originalPrice: product.originalPrice || "",
        discountPrice: product.discountPrice || "",
        status: product.status || "Active",
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
      });
      setStep(1);
      setOpen(true);
    } else {
      console.error("Product object does not contain id:", product);
    }
  };

  const handleDetailOpen = (product) => {
    if (product && product._id) {
      setSelectedDetailProduct(product);
      setDetailOpen(true);
    } else {
      console.error("Product object does not contain id:", product);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      video: null,
      name: "",
      description: "",
      category: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      status: "",
      sizes: [],
      colors: [],
    });
    setStep(1);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setSelectedProduct(null);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedDetailProduct(null);
  };

  const handleDelete = (id) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteProduct(deleteProductId));
      await dispatch(getAllVideoProducts(seller._id));
      showToast("success", "Success", "Video product deleted successfully!");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    } catch (error) {
      showToast("error", "Error", error.message || "Failed to delete video product.");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProductId(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.category || !formData.discountPrice) {
      showToast("error", "Error", "Please fill all required fields.");
      return;
    }

    const updatedFormData = new FormData();
    if (formData.video && typeof formData.video !== "string") {
      updatedFormData.append("video", formData.video);
    }
    updatedFormData.append("name", formData.name);
    updatedFormData.append("description", formData.description);
    updatedFormData.append("category", formData.category);
    updatedFormData.append("tags", formData.tags);
    updatedFormData.append("originalPrice", formData.originalPrice || 0);
    updatedFormData.append("discountPrice", formData.discountPrice);
    updatedFormData.append("sizes", JSON.stringify(formData.sizes));
    updatedFormData.append("colors", JSON.stringify(formData.colors));
    updatedFormData.append("status", formData.status);
    if (seller._id) {
      updatedFormData.append("shopId", seller._id);
    }

    dispatch(updateProduct(selectedProduct._id, updatedFormData))
      .then(() => {
        dispatch(getAllVideoProducts(seller._id)).then(() => {
          handleClose();
          showToast("success", "Success", "Video product updated successfully!");
        });
      })
      .catch((error) => {
        console.error('Error updating video product:', error);
        showToast("error", "Error", error.message || "Failed to update video product.");
      });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video: file });
    }
  };

  const toggleSelection = (item, array) => {
    setFormData((prev) => ({
      ...prev,
      [array]: prev[array].includes(item) ? prev[array].filter((i) => i !== item) : [...prev[array], item]
    }));
  };

  const addCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, customSize] });
      setCustomSize("");
      setShowCustomSizeInput(false);
    }
  };

  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData({ ...formData, colors: [...formData.colors, customColor] });
      setCustomColor("");
      setShowCustomColorInput(false);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const statusData = new FormData();
    statusData.append("status", newStatus);
    statusData.append("shopId", seller._id);

    try {
      await dispatch(updateProduct(productId, statusData));
      dispatch(getAllVideoProducts(seller._id));
      showToast("success", "Success", `Video product status changed to ${newStatus}!`);
    } catch (error) {
      console.error('Error toggling video product status:', error);
      showToast("error", "Error", error.message || "Failed to toggle video product status.");
    }
  };

  const filteredProducts = allVideoProducts
    .filter(item => item.video)
    .filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(searchLower) || item._id.toLowerCase().includes(searchLower);
      const matchesFilter = !isFiltered || item.category;
      return matchesSearch && matchesFilter;
    });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const toggleCreate = () => setIsCreateOpen(!isCreateOpen);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleLogout = () => {
    showToast("success", "Success", "Logged out successfully!");
    navigate("/login");
  };

  const discountPercent = formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.discountPrice)
    ? Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountPrice)) / parseFloat(formData.originalPrice)) * 100)
    : null;

  const getCategoryName = (categoryId) => {
    const categoryItem = categories.find((cat) => cat._id === categoryId);
    return categoryItem ? categoryItem.title : "Unknown Category";
  };

  const videoSrc = (video) => {
    if (!video) return null;
  
    // Case 1: It's a File object (newly uploaded)
    if (video instanceof File || video instanceof Blob) {
      return URL.createObjectURL(video);
    }
  
    // Case 2: It's already a full URL (starts with http/https)
    if (typeof video === "string" && video.startsWith("http")) {
      return video;
    }
  
    // Case 3: It's a server-relative path
    if (typeof video === "string") {
      return `${backend_url}${video}`;
    }
  
    return null;
  };

  // Mobile Card Component
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {product.video && (
            <video
              src={videoSrc(product.video)}
              className="h-16 w-16 object-cover rounded-lg"
              muted
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1">ID: {product._id.slice(-8)}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-900">{product.discountPrice} ETB</span>
              <span className="text-sm text-gray-600">Stock: {product.stock}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Status:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={product.status === "Active"}
              onChange={() => handleToggleStatus(product._id, product.status)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-600"></div>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleDetailOpen(product)}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <AiOutlineEye size={18} />
          </button>
          <button 
            onClick={() => handleOpen(product)}
            className="p-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <AiOutlineEdit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(product._id)}
            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <AiOutlineDelete size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={`w-full ${isMobile ? 'mx-2' : 'mx-8'} pt-1 ${isMobile ? 'mt-4' : 'mt-10'} bg-white`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-md">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">All Video Products</h3>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                  />
                  <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
                
                {/* Create Button */}
                <button
                  onClick={toggleCreate}
                  className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center"
                >
                  Create Video Product
                </button>
              </div>
            </div>

            {/* Products List - Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {currentProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No video products found matching your criteria.
                  </div>
                ) : (
                  currentProducts.map((item) => (
                    <ProductCard key={item._id} product={item} />
                  ))
                )}
              </div>
            ) : (
              /* Desktop Table */
              <div className="overflow-x-auto">
                <ThemeProvider theme={theme}>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="py-2 px-2 text-left font-medium w-[40px]">Product ID</th>
                        <th className="py-2 px-4 text-left font-medium">Product</th>
                        <th className="py-2 px-4 text-left font-medium">Price</th>
                        <th className="py-2 px-4 text-left font-medium">Stock</th>
                        <th className="py-2 px-4 text-left font-medium">Status</th>
                        <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-4 text-center text-gray-500">
                            No video products found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        currentProducts.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate" title={item._id}>
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <div className="flex items-center gap-2">
                                {item.video && (
                                  <video
                                    src={videoSrc(item.video)}
                                    className="h-12 w-12 object-cover rounded"
                                    muted
                                  />
                                )}
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.discountPrice} ETB</td>
                            <td className="py-3 px-4 text-gray-700">{item.stock}</td>
                            <td className="py-3 px-4 text-gray-700">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.status === "Active"}
                                  onChange={() => handleToggleStatus(item._id, item.status)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                              </label>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleDetailOpen(item)}>
                                  <AiOutlineEye size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
                                </button>
                                <button onClick={() => handleOpen(item)}>
                                  <AiOutlineEdit size={20} className="text-gray-600 hover:text-green-500 cursor-pointer" />
                                </button>
                                <button onClick={() => handleDelete(item._id)}>
                                  <AiOutlineDelete size={20} className="text-gray-600 hover:text-red-500 cursor-pointer" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </ThemeProvider>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
              <DeleteModal
                open={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDelete}
                title="Delete Video Product?"
                description="This action cannot be undone. Are you sure you want to delete this video product?"
              />
            </div>
          </div>

          {/* Edit Modal - Responsive */}
          <Modal open={open} onClose={handleClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-0">
              <div className={`bg-white ${isMobile ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
                  onClick={handleClose}
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-4 md:px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
                      placeholder="Enter product name..."
                    />
                    <div className={`mt-4 flex justify-end ${isMobile ? 'w-3/4' : 'w-1/2'}`}>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
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
                            formData.category === cat._id
                              ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                              : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                          } ${isMobile ? 'text-sm' : ''}`}
                          onClick={() => setFormData({ ...formData, category: cat._id })}
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
                        onClick={nextStep}
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
                                  formData.sizes.includes(size)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(size, "sizes")}
                              >
                                {size}
                              </button>
                            ))}
                            {formData.sizes
                              .filter((size) => !["Small", "Medium", "Large", "ExtraLarge"].includes(size))
                              .map((size) => (
                                <button
                                  key={size}
                                  className={`px-3 md:px-6 py-2 md:py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                                  onClick={() => toggleSelection(size, "sizes")}
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
                                  formData.colors.includes(color)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(color, "colors")}
                              >
                                {color}
                              </button>
                            ))}
                            {formData.colors
                              .filter((color) => !["White", "Gray", "Black", "Orange"].includes(color))
                              .map((color) => (
                                <button
                                  key={color}
                                  className={`px-3 md:px-6 py-2 md:py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
                                  onClick={() => toggleSelection(color, "colors")}
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
                              formData.originalPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setFormData({ ...formData, originalPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
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
                              formData.discountPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setFormData({ ...formData, discountPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        className="mt-2 block w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Custom price..."
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
                        onClick={nextStep}
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
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 block w-full h-32 md:h-40 px-4 md:px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                        placeholder="Enter description..."
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
                        onClick={nextStep}
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
                      />
                      <label htmlFor="upload-video" className={`flex items-center justify-center w-full py-4 md:py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100`}>
                        <AiOutlinePlusCircle size={isMobile ? 24 : 30} className="text-gray-600" />
                        <span className="ml-2 text-gray-600 text-sm md:text-base">Upload Video (Max 1)</span>
                      </label>
                      {formData.video && (
                        <div className="mt-4 flex justify-center">
                          <video
                            src={videoSrc(formData.video)}
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
                        onClick={nextStep}
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
                        {formData.video ? (
                          <video
                            src={videoSrc(formData.video)}
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
                          onClick={() => navigate(`/products?category=${formData.category}`)}
                          className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                        >
                          <p className="text-sm">{getCategoryName(formData.category)}</p>
                        </button>
                        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 mb-4`}>
                          {formData.name || "Unnamed Video Product"}
                        </h1>
                        <div className="flex items-center justify-start mt-2 mb-6">
                          <div className="flex items-center">
                            <h4 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>
                              {formData.discountPrice ? `${formData.discountPrice} ETB` : "N/A"}
                            </h4>
                            {formData.originalPrice && (
                              <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 line-through ml-2`}>
                                {formData.originalPrice} ETB
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
                            {formData.sizes.length > 0 ? (
                              formData.sizes.map((size) => (
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
                            {formData.colors.length > 0 ? (
                              formData.colors.map((color) => (
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
                            {formData.description || "No description available"}
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
                        onClick={handleEditSubmit}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>

          {/* Detail Modal - Responsive */}
          <Modal open={detailOpen} onClose={handleDetailClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-4">
              <div className={`bg-white w-full max-w-8xl ${isMobile ? 'h-[95vh] mt-2 rounded-2xl' : 'h-[100vh] mt-10 mx-auto'} overflow-y-auto relative shadow-2xl`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
                  onClick={handleDetailClose}
                >
                  <AiOutlineClose />
                </button>
                <VideoProductDetail data={selectedDetailProduct} isModal={true} />
              </div>
            </div>
          </Modal>

          <CreateVideoShop isOpen={isCreateOpen} onClose={toggleCreate} />
        </div>
      )}
    </>
  );
};

export default AllVideoProducts;