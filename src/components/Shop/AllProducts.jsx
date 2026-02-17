import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllProductsShop, deleteProduct, updateProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import { Button, Modal, TextField, Box, Input, createTheme, ThemeProvider } from "@material-ui/core";
import axios from "axios";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; 
import Pagination from "../Pagination";
import CreateProduct from "./CreateProduct";
import peacImg from "../../Assests/images/peac.png";
import Ratings from "../Products/Ratings";
import { addTocart } from "../../redux/actions/cart";
import styles from "../../styles/styles";
import { server, backend_url } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import DeleteModal from "../DeleteModal";

const AllProducts = () => {
  const { products = [], isLoading, success, error } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const { categories } = useSelector((state) => state.category);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [formData, setFormData] = useState({
    images: [],
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    sizes: [],
    colors: [],
    status: "",
  });
  const [step, setStep] = useState(1);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [click, setClick] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
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
        dispatch(getAllProductsShop(seller._id));
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
      showToast("success", "Success", "Product updated successfully!");
      dispatch({ type: "clearSuccess" });
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === selectedProduct?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, selectedProduct]);

  const normalizeArray = (arr) => {
    if (!arr) return [];
    const flattened = arr.flat(Infinity);
    return [...new Set(flattened.map(item => {
      if (typeof item === "string" && item.startsWith('[') && item.endsWith(']')) {
        try {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed.map(i => i.replace(/[\[\]\"\\]/g, "").trim()) : [item.replace(/[\[\]\"\\]/g, "").trim()];
        } catch (e) {
          return item.replace(/[\[\]\"\\]/g, "").trim();
        }
      }
      return item;
    }).filter(item => item))];
  };

  const handleOpen = (product) => {
    if (product && product._id) {
      setSelectedProduct(product);
      const parsedSizes = normalizeArray(product.sizes);
      const parsedColors = normalizeArray(product.colors);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        tags: product.tags || "",
        originalPrice: product.originalPrice || "",
        discountPrice: product.discountPrice || "",
        stock: product.stock || "",
        sizes: parsedSizes,
        colors: parsedColors,
        status: product.status || "Active",
        images: product.images ? product.images.map(img => img.url) : [],
      });
      setMainImageIdx(0);
      setStep(1);
      setOpen(true);
    } else {
      console.error("Product object does not contain id:", product);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      images: [],
      name: "",
      description: "",
      category: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      stock: "",
      sizes: [],
      colors: [],
      status: "",
    });
    setStep(1);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const handleDetailsOpen = (product) => {
    setSelectedProduct(product);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setShowDetailsModal(true);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleDelete = (id) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteProduct(deleteProductId));
      dispatch(getAllProductsShop(seller?._id));
      showToast("success", "Success", "Product deleted successfully!");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    } catch (error) {
      showToast("error", "Error", error.message || "Failed to delete product.");
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

    if (!formData.name || !formData.description || !formData.category || !formData.discountPrice || formData.images.length === 0) {
      showToast("error", "Error", "Please fill all required fields and upload images.");
      return;
    }

    const updatedFormData = new FormData();
    formData.images.forEach((image) => {
      if (typeof image === "string") {
        updatedFormData.append("existingImages", image);
      } else {
        updatedFormData.append("images", image);
      }
    });
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
        handleClose();
        dispatch(getAllProductsShop(seller._id));
        showToast("success", "Success", "Product updated successfully!");
      })
      .catch((error) => {
        console.error('Error updating product:', error);
        showToast("error", "Error", error.message || "Failed to update product.");
      });
  };

  const handleImageChange = (e, index = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setFormData((prev) => {
      const newImages = [...prev.images];
      if (index !== null) {
        if (files[0]) {
          newImages[index] = files[0];
        }
      } else {
        const availableSlots = 4 - newImages.length;
        const imagesToAdd = files.slice(0, availableSlots);
        newImages.push(...imagesToAdd);
      }
      return { ...prev, images: newImages };
    });
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const statusData = new FormData();
    statusData.append("status", newStatus);
    statusData.append("shopId", seller._id);

    try {
      await dispatch(updateProduct(productId, statusData));
      dispatch(getAllProductsShop(seller._id));
      showToast("success", "Success", `Product status changed to ${newStatus}!`);
    } catch (error) {
      console.error('Error toggling product status:', error);
      showToast("error", "Error", error.message || "Failed to toggle product status.");
    }
  };

  const filteredProducts = products.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || item._id.toLowerCase().includes(searchLower);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const hasImages = item.images?.length > 0;
    const noVideo = !item.video;
    return matchesSearch && matchesCategory && hasImages && noVideo;
  });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const toggleCreate = () => setIsCreateOpen(!isCreateOpen);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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

  const toggleSelection = (item, array) => {
    setFormData((prev) => ({
      ...prev,
      [array]: prev[array].includes(item) ? prev[array].filter((i) => i !== item) : [...prev[array], item]
    }));
  };

  const incrementCount = () => {
    if (count < formData.stock) {
      setCount(count + 1);
    } else {
      showToast("error", "Error", `Maximum stock limit reached: ${formData.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addToCartHandler = () => {
    const isItemExists = cart && cart.find((i) => i._id === selectedProduct?._id);
    if (isItemExists) {
      showToast("error", "Error", "Item already in cart!");
    } else {
      if (formData.stock < 1) {
        showToast("error", "Error", "Product stock limited!");
      } else {
        const cartData = { ...selectedProduct, qty: count, selectedSize, selectedColor };
        dispatch(addTocart(cartData));
        showToast("success", "Success", "Item added to cart successfully!");
      }
    }
    if (formData.stock > 0 && formData.stock <= 5) {
      showToast("info", "Info", `Only ${formData.stock} items left in stock!`);
    }
  };

  const removeFromWishlistHandler = () => {
    setClick(!click);
    dispatch(removeFromWishlist(selectedProduct));
  };

  const addToWishlistHandler = () => {
    setClick(!click);
    dispatch(addToWishlist(selectedProduct));
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!seller?._id) {
        showToast("error", "Error", "Seller information is unavailable.");
        return;
      }
      const groupTitle = selectedProduct?._id + user._id;
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
        showToast("error", "Error", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Error", "Please login to create a conversation");
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.title : "Unknown";
  };

  const discountPercent = selectedProduct?.originalPrice && selectedProduct?.originalPrice > selectedProduct?.discountPrice
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.discountPrice) / selectedProduct.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedProduct?.description && selectedProduct.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedProduct.description.slice(0, descriptionLimit) + "..."
    : selectedProduct?.description;

  // Mobile Card Component
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {product.images && product.images[0] && (
            <img
              src={`${backend_url}${product.images[0].url}`}
              alt={product.name}
              className="h-16 w-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Uploads/placeholder-image.jpg";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-1">ID: {product._id.slice(-8)}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-900">{product.discountPrice} br</span>
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
            onClick={() => handleDetailsOpen(product)}
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
      
      <div className="text-xs text-gray-500">
        Category: {getCategoryName(product.category)}
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-2 md:mx-8 pt-1 mt-4 md:mt-10 bg-white font-avenir">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-md">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">All Products</h3>
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
                
                {/* Filter and Create Buttons */}
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={handleFilterToggle}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium w-full md:w-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                      </svg>
                      Filter
                    </button>
                    {isFilterOpen && (
                      <div className="absolute top-12 right-0 md:left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={clearFilter}
                            className={`px-4 py-2 rounded-lg text-sm w-full text-left ${
                              !selectedCategory ? "bg-[#FFC300] text-white" : "bg-gray-100 text-gray-700"
                            } hover:bg-gray-200`}
                          >
                            All Categories
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat._id}
                              onClick={() => handleCategorySelect(cat._id)}
                              className={`px-4 py-2 rounded-lg text-sm w-full text-left ${
                                selectedCategory === cat._id ? "bg-[#FFC300] text-white" : "bg-gray-100 text-gray-700"
                              } hover:bg-gray-200`}
                            >
                              {cat.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={toggleCreate}
                    className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center"
                  >
                    <AiOutlinePlusCircle size={16} />
                    Create Product
                  </button>
                </div>
              </div>
            </div>

            {/* Products List - Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {currentProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No products found matching your criteria.
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
                            No products found matching your criteria.
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
                                {item.images && item.images[0] && (
                                  <img
                                    src={`${backend_url}${item.images[0].url}`}
                                    alt={item.name}
                                    className="h-12 w-12 object-cover rounded"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/Uploads/placeholder-image.jpg";
                                    }}
                                  />
                                )}
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.discountPrice} br</td>
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
                                <button onClick={() => handleDetailsOpen(item)}>
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
                title="Delete Product?"
                description="This action cannot be undone. Are you sure you want to delete this product?"
              />
            </div>
          </div>

          {/* Product Details Modal - Responsive */}
          <Modal open={showDetailsModal} onClose={handleDetailsClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
              <div className={`bg-white w-full max-w-8xl ${isMobile ? 'h-[95vh] mt-2 rounded-2xl' : 'h-[100vh] mt-10'} overflow-y-auto relative shadow-2xl p-4 md:p-6`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
                  onClick={handleDetailsClose}
                >
                  <AiOutlineClose size={20} />
                </button>
                {selectedProduct && (
                  <div className={`w-full ${isMobile ? 'py-2' : 'md:w-[90%] mx-auto py-4 md:py-5'}`}>
                    <div className={`${isMobile ? 'flex flex-col' : 'flex flex-col lg:flex-row'}`}>
                      {/* Product Images */}
                      <div className={`${isMobile ? 'w-full mb-4' : 'w-full lg:w-1/2 mb-6 lg:mb-0'}`}>
                        <img
                          src={
                            selectedProduct.images[detailsImageIdx]?.url
                              ? `${backend_url}${selectedProduct.images[detailsImageIdx].url}`
                              : "https://via.placeholder.com/650"
                          }
                          alt={selectedProduct.name || "Product image"}
                          className={`${isMobile ? 'w-full h-[250px]' : 'w-full max-w-[500px] h-[300px] md:h-[400px] lg:h-[500px] mx-auto'} border-2 border-white rounded-lg object-cover`}
                        />
                        <div className="relative mt-4">
                          <div className={`flex justify-center ${isMobile ? '-mt-6' : '-mt-8 md:-mt-12 lg:-mt-20'}`}>
                            <div className="flex items-center space-x-2 md:space-x-4 bg-black bg-opacity-50 rounded-full px-3 py-2">
                              {[...Array(selectedProduct.images.length)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`${isMobile ? 'h-1.5' : 'h-1.5 md:h-2'} rounded-full cursor-pointer ${
                                    detailsImageIdx === i ? "bg-[#CC9A00]" : "bg-white"
                                  }`}
                                  onClick={() => setDetailsImageIdx(i)}
                                  style={{ width: isMobile ? "30px" : "40px" }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className={`flex justify-center mt-4 ${isMobile ? 'space-x-1' : 'space-x-2 md:space-x-4'}`}>
                            {selectedProduct.images.map((i, index) => (
                              <div
                                key={index}
                                className="cursor-pointer"
                              >
                                <img
                                  src={
                                    i?.url
                                      ? `${backend_url}${i.url}`
                                      : "https://via.placeholder.com/140x100"
                                  }
                                  alt={`Thumbnail ${index}`}
                                  className={`${isMobile ? 'w-12 h-10' : 'w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16'} object-cover border-2 border-white rounded-lg`}
                                  onClick={() => setDetailsImageIdx(index)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Shop Info */}
                        <div className={`${isMobile ? 'mt-4' : 'mt-6 md:mt-10'}`}>
                          <div className={`bg-white border border-[#B4B4B4] rounded-lg p-4 w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                              <div className="flex items-center">
                                <Link
                                  to={
                                    selectedProduct?.shop?.template === "growthplan"
                                      ? `/shop/growthplan/${selectedProduct?.shop._id}`
                                      : selectedProduct?.shop?.template === "proplan"
                                      ? `/shop/proplan/${selectedProduct?.shop._id}`
                                      : `/shop/preview/${selectedProduct?.shop._id}`
                                  }
                                >
                                  <img
                                    src={
                                      selectedProduct?.shop?.avatar?.url
                                        ? `${backend_url}${selectedProduct.shop.avatar.url}`
                                        : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                    }
                                    alt={selectedProduct.shop.name || "Shop"}
                                    className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} rounded-full mr-3 object-cover`}
                                  />
                                </Link>
                                <div>
                                  <Link
                                    to={
                                      selectedProduct?.shop?.template === "growthplan"
                                        ? `/shop/growthplan/${selectedProduct?.shop._id}`
                                        : selectedProduct?.shop?.template === "proplan"
                                        ? `/shop/proplan/${selectedProduct?.shop._id}`
                                        : `/shop/preview/${selectedProduct?.shop._id}`
                                    }
                                  >
                                    <h3 className={`${styles.shop_name} ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                                      {selectedProduct.shop.name || "Unknown Shop"}
                                    </h3>
                                  </Link>
                                  <div className="flex mt-1">
                                    <Ratings rating={selectedProduct?.ratings || 0} />
                                  </div>
                                </div>
                              </div>
                              <button
                                className={`text-[#CC9A00] border-2 border-[#CC9A00] py-2 px-3 ${isMobile ? 'text-xs' : 'md:px-4 text-sm'} rounded-full hover:bg-gray-100 bg-transparent`}
                                onClick={handleMessageSubmit}
                              >
                                Send Message <AiOutlineMessage className="ml-1 inline" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className={`${isMobile ? 'w-full mt-4' : 'w-full lg:w-1/2 lg:pl-6'}`}>
                        <button
                          onClick={() => navigate(`/products?category=${selectedProduct.category}`)}
                          className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
                        >
                          {getCategoryName(selectedProduct.category)}
                        </button>
                        <h1 className={`${styles.productTitle} ${isMobile ? 'text-lg' : 'text-xl md:text-2xl lg:text-3xl'}`} style={{ color: "#1c3b3c" }}>
                          {selectedProduct.name || "Unnamed Product"}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center">
                            <h4 className={`${styles.productDiscountPrice} ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
                              {selectedProduct.discountPrice
                                ? `${selectedProduct.discountPrice} Birr`
                                : "N/A"}
                            </h4>
                            {selectedProduct.originalPrice && (
                              <h3 className={`${styles.price} ml-2 ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                                {selectedProduct.originalPrice} Birr
                              </h3>
                            )}
                          </div>
                          <div>
                            <Ratings rating={selectedProduct?.ratings || 0} />
                          </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Select Size</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.sizes &&
                            Array.isArray(selectedProduct.sizes) &&
                            selectedProduct.sizes.length > 0 ? (
                              selectedProduct.sizes.map((size) => (
                                <button
                                  key={size}
                                  className={`px-3 py-2 rounded-[16px] text-sm ${
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
                          <label className="text-gray-800 font-light">Select Color</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.colors &&
                            Array.isArray(selectedProduct.colors) &&
                            selectedProduct.colors.length > 0 ? (
                              selectedProduct.colors.map((color) => (
                                <button
                                  key={color}
                                  className={`px-3 py-2 rounded-[16px] text-sm ${
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

                        {/* Stock */}
                        <div className="mt-4 md:mt-6">
                          <label className="text-gray-800 font-light">Stock</label>
                          <p className="text-gray-800 mt-2">
                            {selectedProduct.stock === undefined || selectedProduct.stock === null
                              ? "Not set"
                              : selectedProduct.stock}
                          </p>
                        </div>

                        {/* Description */}
                        <div className={`mt-4 md:mt-6 p-4 border border-[#525252] rounded-lg w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                          <p className="text-gray-600 text-sm md:text-base">
                            {isDescriptionExpanded
                              ? selectedProduct.description
                              : truncatedDescription || "No description available"}
                            {isDescriptionLong && (
                              <span
                                className="text-[#CC9A00] cursor-pointer ml-2"
                                onClick={toggleDescription}
                              >
                                {isDescriptionExpanded ? "See Less" : "See More"}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Offer Banner */}
                        <div className={`mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-3 ${isMobile ? '' : 'md:p-4'} flex items-center w-full ${isMobile ? '' : 'lg:w-3/4'}`}>
                          <img
                            src={peacImg}
                            alt="Offer"
                            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'} mr-3 object-contain`}
                          />
                          <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-sm'} font-semibold`}>
                            {discountPercent
                              ? `Save ${discountPercent}% today. Limited time offer!`
                              : "Great Value! Limited time offer!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>

          {/* Edit Product Modal - Responsive */}
          <Modal open={open} onClose={handleClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-0">
              <div className={`bg-white ${isMobile ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
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
                
                {step === 1 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-center font-['Quesha'] text-gray-800 mb-6`}>What's the name of your product?</h6>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
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

                {step === 2 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>Choose a category for your product</h6>
                    <div className={`mt-4 grid ${isMobile ? 'grid-cols-2 gap-3 w-5/6' : 'grid-cols-4 gap-4 w-3/4'}`}>
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          className={`px-4 py-2 rounded-full border transition-all ${
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

                {step === 3 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'min-h-[calc(85vh-150px)] mt-4' : 'min-h-[calc(85vh-200px)] mt-8'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-2`}>Select sizes and colors</h6>
                    <div className={`${isMobile ? 'w-5/6' : 'w-3/4 max-w-5xl'} flex flex-col items-center`}>
                      <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col ${isMobile ? '' : 'ml-[8rem]'}`}>
                        <div className={`flex ${isMobile ? 'flex-col' : 'w-full'}`}>
                          <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Sizes:</label>
                          <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                            {["Small", "Medium", "Large", "ExtraLarge"].map((size) => (
                              <button
                                key={size}
                                className={`px-4 py-2 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
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
                                  className={`px-4 py-2 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
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

                      <div className={`w-full mb-6 ${isMobile ? '' : 'md:mb-8'} flex flex-col items-start ${isMobile ? '' : 'ml-[8rem]'}`}>
                        <div className={`flex ${isMobile ? 'flex-col' : 'items-start w-full'}`}>
                          <label className="text-gray-600 text-lg font-medium w-20 mt-[1rem]">Colors:</label>
                          <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full mt-2' : 'w-3/4'}`}>
                            {["White", "Gray", "Black", "Orange"].map((color) => (
                              <button
                                key={color}
                                className={`px-4 py-2 rounded-full border transition-all ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center ${
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
                                  className={`px-4 py-2 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] ${isMobile ? 'w-[calc(50%-0.5rem)] text-sm' : 'w-[calc(25%-0.5rem)]'} text-center`}
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

                {/* Steps 4-7 follow similar responsive patterns */}
                {step === 4 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-[6rem]'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800`}>Set your pricing</h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <p className="text-gray-600 float-left">Original Price</p>
                      <div className={`flex flex-wrap justify-between mt-6 ${isMobile ? 'gap-1' : 'md:mt-10 gap-2'}`}>
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
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <p className="text-gray-600 float-left">Discount Price</p>
                      <div className={`flex flex-wrap justify-between mt-6 ${isMobile ? 'gap-1' : 'md:mt-10 gap-2'}`}>
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

           {step === 5 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800">Describe your product</h6>
                    <div className="mt-4 w-3/4">
                      <p className="text-gray-600 float-left">Description</p>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 block w-full h-40 px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                        placeholder="Enter description..."
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
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {step === 6 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800">Upload product images</h6>
                    <div className="mt-4 w-1/2">
                      <input
                        type="file"
                        id="upload"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="upload"
                        className={`flex items-center justify-center w-full py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 ${formData.images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <AiOutlinePlusCircle size={30} className="text-gray-600" />
                        <span className="ml-2 text-gray-600">Upload Images (Max 4)</span>
                      </label>
                      <div className="mt-4 flex gap-4 justify-center flex-wrap">
                        {formData.images.map((image, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={typeof image === "string" ? (image.startsWith("http") ? image : `${backend_url}${image}`) : URL.createObjectURL(image)}
                              alt="preview"
                              className="h-[150px] w-[150px] object-cover rounded-lg border border-gray-300"
                            />
                            <input
                              type="file"
                              id={`replace-${idx}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, idx)}
                            />
                            <label
                              htmlFor={`replace-${idx}`}
                              className="absolute bottom-2 right-2 bg-[#FFC300] text-white px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-[#FFD700]"
                            >
                              Replace
                            </label>
                          </div>
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
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {step === 7 && (
                  <div className="flex flex-col items-center justify-center h-[calc(98vh-150px)] p-8 mt-[10rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-4">Review your product</h6>
                    <div className="w-[90%] mx-auto py-5">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2">
                          <img
                            src={formData.images.length > 0 ? (typeof formData.images[mainImageIdx] === "string" ? (formData.images[mainImageIdx].startsWith("http") ? formData.images[mainImageIdx] : `${backend_url}${formData.images[mainImageIdx]}`) : URL.createObjectURL(formData.images[mainImageIdx])) : ""}
                            alt="main preview"
                            className="w-[550px] h-[550px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                          />
                          <div className="relative">
                            <div className="absolute top-[-28rem] w-[550px] flex justify-center">
                              <div className="flex items-center space-x-4">
                                {[...Array(formData.images.length)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-2 rounded-full ${
                                      mainImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                                    }`}
                                    onClick={() => setMainImageIdx(i)}
                                    style={{ width: "100px", height: "4px", borderRadius: "2px" }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-center mt-[-5rem]">
                              {formData.images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className={`cursor-pointer mx-2 ${mainImageIdx === idx ? "" : ""}`}
                                >
                                  <img
                                    src={typeof image === "string" ? (image.startsWith("http") ? image : `${backend_url}${image}`) : URL.createObjectURL(image)}
                                    alt={`thumb-${idx}`}
                                    className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                                    onClick={() => setMainImageIdx(idx)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                          <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                            {formData.name || "Product Name"}
                          </h1>
                          <div className="flex items-center mt-2">
                            <Ratings rating={0} />
                          </div>
                          <p className="text-gray-600 mt-2">{formData.description || "No description provided"}</p>
                          <div className="flex items-center mt-4">
                            <h4 className={`${styles.productDiscountPrice}`}>
                              {formData.discountPrice} birr
                            </h4>
                            {formData.originalPrice && (
                              <h3 className={`${styles.price} ml-2`}>{formData.originalPrice} birr</h3>
                            )}
                          </div>
                          <div className="mt-6">
                            <label className="text-gray-800 font-semibold">Select Size</label>
                            <div className="flex space-x-2 mt-2">
                              {formData.sizes.length > 0 ? (
                                formData.sizes.map((size) => (
                                  <button
                                    key={size}
                                    className={`px-4 py-2 rounded-full ${
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
                                <p className="text-gray-500">No sizes available</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-6">
                            <label className="text-gray-800 font-semibold">Select Color</label>
                            <div className="flex space-x-2 mt-2">
                              {formData.colors.length > 0 ? (
                                formData.colors.map((color) => (
                                  <button
                                    key={color}
                                    className={`px-4 py-2 rounded-full ${
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
                                <p className="text-gray-500">No colors available</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center mt-6 space-x-4">
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 border-2 border-[#CC9A00] rounded-full flex items-center justify-center hover:bg-gray-100"
                                style={{ color: "#CC9A00" }}
                                onClick={decrementCount}
                              >
                                -
                              </button>
                              <span className="mx-4 text-gray-800 font-medium">{count}</span>
                              <button
                                className="w-8 h-8 border-2 border-[#CC9A00] rounded-full flex items-center justify-center hover:bg-gray-100"
                                style={{ color: "#CC9A00" }}
                                onClick={incrementCount}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="bg-[#CC9A00] text-white py-3 px-10 rounded-full flex items-center justify-center hover:bg-yellow-500"
                              onClick={addToCartHandler}
                            >
                              <AiOutlineShoppingCart className="mr-2" /> Add to Cart
                            </button>
                            <div className="relative">
                              {click ? (
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                  <AiFillHeart
                                    size={24}
                                    className="cursor-pointer"
                                    onClick={removeFromWishlistHandler}
                                    color={click ? "red" : "#333"}
                                    title="Remove from wishlist"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                  <AiOutlineHeart
                                    size={24}
                                    className="cursor-pointer"
                                    onClick={addToWishlistHandler}
                                    color={click ? "red" : "#333"}
                                    title="Add to wishlist"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-6">
                            <div className="bg-white shadow-md rounded-lg p-4 w-3/4 float-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Link
                                    to={`/shop/preview/${seller?._id}`}
                                  >
                                    <img
                                      src={seller?.avatar?.url ? `${backend_url}${seller.avatar.url}` : ""}
                                      alt={seller?.name}
                                      className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                                    />
                                  </Link>
                                  <div>
                                    <Link
                                      to={`/shop/preview/${seller?._id}`}
                                    >
                                      <h3 className={`${styles.shop_name}`}>{seller?.name || "Seller Name"}</h3>
                                    </Link>
                                    <div className="flex mt-1">
                                      <Ratings rating={0} />
                                    </div>
                                  </div>
                                </div>
                                <button
                                  className="text-[#CC9A00] border-2 border-[#CC9A00] py-2 px-4 rounded-full hover:bg-gray-100 bg-transparent"
                                  onClick={handleMessageSubmit}
                                >
                                  Send Message <AiOutlineMessage className="ml-1 inline" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-between w-[90%]">
                        <button
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                          onClick={prevStep}
                        >
                          <AiOutlineArrowLeft size={20} />
                        </button>
                        <button
                          className="bg-[#CC9A00] text-white py-3 px-10 rounded-full flex items-center justify-center hover:bg-yellow-500"
                          onClick={handleEditSubmit}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Modal>
          <CreateProduct isOpen={isCreateOpen} onClose={toggleCreate} />
        </div>
      )}
    </>
  );
};

export default AllProducts;