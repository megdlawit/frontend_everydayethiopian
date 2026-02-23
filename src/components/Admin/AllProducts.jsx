import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineDelete, AiOutlineEdit, AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineClose } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; // Adjust path to your custom Toast component
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import peacImg from "../../Assests/images/peac.png";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import DeleteModal from "../DeleteModal"; // Import the DeleteModal component

const AllProducts = () => {
  // Define itemsPerPage to fix no-undef error
  const itemsPerPage = 5;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryNames, setCategoryNames] = useState({});
  const [showStockOverlay, setShowStockOverlay] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [showTransportOverlay, setShowTransportOverlay] = useState(false);
  const [transportProductId, setTransportProductId] = useState(null);
  const [newTransport, setNewTransport] = useState("bike");
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
    transportationType: null,
  });
  const [editStep, setEditStep] = useState(1);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [count, setCount] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // New state for DeleteModal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const { categories } = useSelector((state) => state.category);
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.title : "Unknown";
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/650";
    return imageUrl.startsWith("http") ? imageUrl : `${backend_url}${imageUrl}`;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${server}/product/admin-all-products`, { withCredentials: true });
        const filteredAndSortedProducts = (res.data.products || [])
          .filter((p) => p.status === "Active" && p.images?.length > 0 && !p.video)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setData(filteredAndSortedProducts);
      } catch (error) {
        showToast("error", "Fetch Failed", error.response?.data?.message || "Failed to fetch products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    // Open the delete confirmation modal instead of directly deleting
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${server}/product/admin-delete-product/${deleteProductId}`, { withCredentials: true });
      showToast("success", "Product Deleted", "Product deleted successfully!");
      setData((prev) => prev.filter((product) => product._id !== deleteProductId));
      setShowDeleteModal(false);
      setDeleteProductId(null);
    } catch (error) {
      showToast("error", "Delete Failed", error.response?.data?.message || "Failed to delete product.");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProductId(null);
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(
        `${server}/product/update-product-status/${productId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      showToast("success", "Status Updated", `Product status changed to ${newStatus}!`);
      setData((prev) =>
        prev.map((product) =>
          product._id === productId ? { ...product, status: newStatus } : product
        )
      );
    } catch (error) {
      showToast("error", "Status Update Failed", error.response?.data?.message || "Failed to toggle product status.");
    }
  };

  const handleOpenStockOverlay = (productId) => {
    setStockProductId(productId);
    setShowStockOverlay(true);
    setNewStock("");
  };

  const handleCloseStockOverlay = () => {
    setShowStockOverlay(false);
    setStockProductId(null);
    setNewStock("");
  };

  const handleSaveStock = async () => {
    if (!newStock || isNaN(newStock) || Number(newStock) < 0) {
      showToast("error", "Invalid Input", "Please enter a valid stock value.");
      return;
    }
    try {
      await axios.put(
        `${server}/product/admin-update-stock/${stockProductId}`,
        { stock: Number(newStock) },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      showToast("success", "Stock Updated", "Stock updated successfully!");
      setData((prev) =>
        prev.map((product) =>
          product._id === stockProductId ? { ...product, stock: Number(newStock) } : product
        )
      );
      handleCloseStockOverlay();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast("error", "Authentication Required", "Login to continue");
      } else {
        showToast("error", "Update Failed", error.response?.data?.message || "Failed to update stock.");
      }
    }
  };

  const handleOpenTransportOverlay = (productId) => {
    setTransportProductId(productId);
    setShowTransportOverlay(true);
    setNewTransport("bike");
  };

  const handleCloseTransportOverlay = () => {
    setShowTransportOverlay(false);
    setTransportProductId(null);
    setNewTransport("bike");
  };

  const handleSaveTransport = async () => {
    try {
      await axios.put(
        `${server}/product/admin-update-transport/${transportProductId}`,
        { transportationType: newTransport },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      showToast("success", "Transport Updated", "Transportation type updated successfully!");
      setData((prev) =>
        prev.map((product) =>
          product._id === transportProductId ? { ...product, transportationType: newTransport } : product
        )
      );
      handleCloseTransportOverlay();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast("error", "Authentication Required", "Login to continue");
      } else {
        showToast("error", "Update Failed", error.response?.data?.message || "Failed to update transportation type.");
      }
    }
  };

  const handleEditOpen = (product) => {
    setEditProduct(product);
    const parsedSizes = Array.isArray(product.sizes) ? product.sizes : [];
    const parsedColors = Array.isArray(product.colors) ? product.colors : [];
    setEditFormData({
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
      images: product.images ? product.images.map((img) => img.url) : [],
      transportationType: product.transportationType || null,
    });
    setMainImageIdx(0);
    setEditStep(1);
    setEditOpen(true);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditProduct(null);
    setEditFormData({
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
      transportationType: null,
    });
    setEditStep(1);
    setMainImageIdx(0);
    setCustomSize("");
    setCustomColor("");
    setShowCustomSizeInput(false);
    setShowCustomColorInput(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (
      !editFormData.name ||
      !editFormData.description ||
      !editFormData.category ||
      !editFormData.discountPrice ||
      editFormData.images.length === 0
    ) {
      showToast("error", "Missing Fields", "Please fill all required fields and upload images.");
      return;
    }
    const updatedFormData = new FormData();
    editFormData.images.forEach((image) => {
      if (typeof image === "string") {
        updatedFormData.append("existingImages", image);
      } else {
        updatedFormData.append("images", image);
      }
    });
    updatedFormData.append("name", editFormData.name);
    updatedFormData.append("description", editFormData.description);
    updatedFormData.append("category", editFormData.category);
    updatedFormData.append("tags", editFormData.tags);
    updatedFormData.append("originalPrice", editFormData.originalPrice || 0);
    updatedFormData.append("discountPrice", editFormData.discountPrice);
    updatedFormData.append("stock", editFormData.stock);
    updatedFormData.append("sizes", JSON.stringify(editFormData.sizes));
    updatedFormData.append("colors", JSON.stringify(editFormData.colors));
    updatedFormData.append("status", editFormData.status);
    updatedFormData.append("transportationType", editFormData.transportationType || null);

    try {
      await axios.put(
        `${server}/product/admin-edit-product/${editProduct._id}`,
        updatedFormData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      showToast("success", "Product Updated", "Product updated successfully!");
      setEditOpen(false);
      const res = await axios.get(`${server}/product/admin-all-products`, { withCredentials: true });
      setData(res.data.products.filter((p) => p.status === "Active" && p.images?.length > 0 && !p.video).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      showToast("error", "Update Failed", error.response?.data?.message || "Failed to update product.");
    }
  };

  const handleImageChange = (e, index = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setEditFormData((prev) => {
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

  const addCustomSize = () => {
    if (customSize && !editFormData.sizes.includes(customSize)) {
      setEditFormData({ ...editFormData, sizes: [...editFormData.sizes, customSize] });
      setCustomSize("");
      setShowCustomSizeInput(false);
    }
  };

  const addCustomColor = () => {
    if (customColor && !editFormData.colors.includes(customColor)) {
      setEditFormData({ ...editFormData, colors: [...editFormData.colors, customColor] });
      setCustomColor("");
      setShowCustomColorInput(false);
    }
  };

  const toggleSelection = (item, array) => {
    setEditFormData((prev) => ({
      ...prev,
      [array]: prev[array].includes(item) ? prev[array].filter((i) => i !== item) : [...prev[array], item]
    }));
  };

  const incrementCount = () => {
    if (count < editFormData.stock) {
      setCount(count + 1);
    } else {
      showToast("error", "Stock Limit Reached", `Maximum stock limit reached: ${editFormData.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const handleOpenDetailsModal = (product) => {
    setSelectedProduct(product);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const filteredProducts = Array.isArray(data)
    ? data.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.name?.toLowerCase().includes(searchLower) ||
          item._id?.toLowerCase().includes(searchLower);
        const matchesFilter = !isFiltered || item.category;
        return matchesSearch && matchesFilter;
      })
    : [];

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const discountPercent = selectedProduct?.originalPrice && selectedProduct?.originalPrice > selectedProduct?.discountPrice
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.discountPrice) / selectedProduct.originalPrice) * 100)
    : null;

  const descriptionLimit = 100;
  const isDescriptionLong = selectedProduct?.description && selectedProduct.description.length > descriptionLimit;
  const truncatedDescription = isDescriptionLong
    ? selectedProduct.description.slice(0, descriptionLimit) + "..."
    : selectedProduct?.description;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-gray-100">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1C3B3E]">All Products</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm"
                  />
                  <AiOutlineSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
              </div>
            </div>
            {filteredProducts.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-[#1C3B3E]">No products found matching your search.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[40px]">Product ID</th>
                          <th className="py-2 px-4 text-left font-medium">Product</th>
                          <th className="py-2 px-4 text-left font-medium">Category</th>
                          <th className="py-2 px-4 text-left font-medium">Price</th>
                          <th className="py-2 px-4 text-left font-medium">Stock</th>
                          <th className="py-2 px-4 text-left font-medium">Transport</th>
                          <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentProducts.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-[#1C3B3E] w-[40px] max-w-[100px] truncate"
                              title={item._id}
                            >
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              <div className="flex items-center gap-2">
                                {item.images && item.images[0]?.url && (
                                  <img
                                    src={getImageUrl(item.images[0].url)}
                                    alt={item.name}
                                    className="h-12 w-12 object-cover rounded"
                                  />
                                )}
                                <span>{item.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              {getCategoryName(item.category)}
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">{item.discountPrice || "N/A"} Br</td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              {item.stock === undefined || item.stock === null ? (
                                <button
                                  className="bg-[#CC9A00] text-white px-3 py-1 rounded-full text-xs hover:bg-[#FFD700] transition"
                                  onClick={() => handleOpenStockOverlay(item._id)}
                                >
                                  Enter Stock
                                </button>
                              ) : (
                                item.stock
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#1C3B3E]">
                              {!item.transportationType ? (
                                <button
                                  className="bg-[#CC9A00] text-white px-3 py-1 rounded-full text-xs hover:bg-[#FFD700] transition"
                                  onClick={() => handleOpenTransportOverlay(item._id)}
                                >
                                  Set Transport
                                </button>
                              ) : (
                                item.transportationType
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleOpenDetailsModal(item)}>
                                  <AiOutlineEye
                                    size={20}
                                    className="text-gray-600 hover:text-[#CC9A00] cursor-pointer"
                                  />
                                </button>
                                <button onClick={() => handleEditOpen(item)}>
                                  <AiOutlineEdit
                                    size={20}
                                    className="text-gray-600 hover:text-green-500 cursor-pointer"
                                  />
                                </button>
                                <button onClick={() => handleDelete(item._id)}>
                                  <AiOutlineDelete
                                    size={20}
                                    className="text-gray-600 hover:text-red-500 cursor-pointer"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ThemeProvider>
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
                {showStockOverlay && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] flex flex-col items-center">
                      <h4 className="text-lg font-semibold mb-4 text-[#1C3B3E]">Enter Stock</h4>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E]"
                        placeholder="Enter stock value"
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-[#CC9A00] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#FFD700] transition"
                          onClick={handleSaveStock}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-200 text-[#1C3B3E] px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
                          onClick={handleCloseStockOverlay}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {showTransportOverlay && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] flex flex-col items-center">
                      <h4 className="text-lg font-semibold mb-4 text-[#1C3B3E]">Set Transportation</h4>
                      <select
                        value={newTransport}
                        onChange={(e) => setNewTransport(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E]"
                      >
                        <option value="bike">Bike</option>
                        <option value="motorbike">Motorbike</option>
                        <option value="car">Car</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          className="bg-[#CC9A00] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#FFD700] transition"
                          onClick={handleSaveTransport}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-200 text-[#1C3B3E] px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
                          onClick={handleCloseTransportOverlay}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Render DeleteModal */}
                <DeleteModal
                  open={showDeleteModal}
                  onClose={handleCloseDeleteModal}
                  onConfirm={confirmDelete}
                  title="Delete Product?"
                  description="This action cannot be undone. Are you sure you want to delete this product?"
                />
              </>
            )}
          </div>

          {/* Existing Modals (Details and Edit) */}
          <Modal open={showDetailsModal} onClose={handleCloseDetailsModal}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
              <div className="bg-white w-full max-w-8xl h-[100vh] mt-10 overflow-y-auto relative rounded-2xl shadow-2xl p-6">
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={handleCloseDetailsModal}
                >
                  <AiOutlineClose size={20} />
                </button>
                {selectedProduct && (
                  <div className="w-[90%] mx-auto py-5">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2">
                        <img
                          src={getImageUrl(selectedProduct.images[detailsImageIdx]?.url)}
                          alt={selectedProduct.name || "Product image"}
                          className="w-[550px] h-[500px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                        />
                        <div className="relative">
                          <div className="absolute top-[-25rem] w-[550px] flex justify-center">
                            <div className="flex items-center space-x-4">
                              {[...Array(selectedProduct.images.length)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 rounded-full ${
                                    detailsImageIdx === i ? "bg-[#CC9A00]" : "bg-white border border-white"
                                  }`}
                                  onClick={() => setDetailsImageIdx(i)}
                                  style={{ width: "100px", height: "4px", borderRadius: "2px" }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-center mt-[-5rem]">
                            {selectedProduct.images.map((i, index) => (
                              <div
                                key={index}
                                className={`cursor-pointer mx-2 ${detailsImageIdx === index ? "" : ""}`}
                              >
                                <img
                                  src={getImageUrl(i?.url)}
                                  alt={`Thumbnail ${index}`}
                                  className="w-[100px] h-[70px] object-cover border-2 border-white rounded-lg"
                                  onClick={() => setDetailsImageIdx(index)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-10">
                          <div className="bg-white border border-[#B4B4B4] rounded-lg p-4 w-3/4">
                            <div className="flex items-center justify-between">
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
                                    src={getImageUrl(selectedProduct?.shop?.avatar?.url || "/Uploads/avatar/avatar-1754729528346-341457281.jpg")}
                                    alt={selectedProduct.shop.name || "Shop"}
                                    className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
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
                                    <h3 className={`${styles.shop_name}`}>
                                      {selectedProduct.shop.name || "Unknown Shop"}
                                    </h3>
                                  </Link>
                                  <div className="flex mt-1">
                                    <Ratings rating={selectedProduct?.ratings || 0} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                        <button
                          onClick={() => navigate(`/products?category=${selectedProduct.category}`)}
                          className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                        >
                          <p className="text-sm">{getCategoryName(selectedProduct.category)}</p>
                        </button>
                        <h1 className={`${styles.productTitle}`} style={{ color: "#1c3b3c" }}>
                          {selectedProduct.name || "Unnamed Product"}
                        </h1>
                        <div className="flex items-center justify-start mt-2">
                          <div className="flex items-center">
                            <h4 className={`${styles.productDiscountPrice}`}>
                              {selectedProduct.discountPrice
                                ? `${selectedProduct.discountPrice} Birr`
                                : "N/A"}
                            </h4>
                            {selectedProduct.originalPrice && (
                              <h3 className={`${styles.price} ml-2`}>
                                {selectedProduct.originalPrice} Birr
                              </h3>
                            )}
                          </div>
                          <div className="ml-20">
                            <Ratings rating={selectedProduct?.ratings || 0} />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Select Size</label>
                          <div className="flex space-x-2 mt-2">
                            {selectedProduct.sizes &&
                            Array.isArray(selectedProduct.sizes) &&
                            selectedProduct.sizes.length > 0 ? (
                              selectedProduct.sizes.map((size) => (
                                <button
                                  key={size}
                                  className={`px-4 py-2 rounded-[16px] ${
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
                          <label className="text-gray-800 font-light">Select Color</label>
                          <div className="flex space-x-2 mt-2">
                            {selectedProduct.colors &&
                            Array.isArray(selectedProduct.colors) &&
                            selectedProduct.colors.length > 0 ? (
                              selectedProduct.colors.map((color) => (
                                <button
                                  key={color}
                                  className={`px-4 py-2 rounded-[16px] ${
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
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Stock</label>
                          <p className="text-gray-800 mt-2">
                            {selectedProduct.stock === undefined || selectedProduct.stock === null
                              ? "Not set"
                              : selectedProduct.stock}
                          </p>
                        </div>
                        <div className="mt-6">
                          <label className="text-gray-800 font-light">Transportation Type</label>
                          <p className="text-gray-800 mt-2">
                            {selectedProduct.transportationType || "Not set"}
                          </p>
                        </div>
                        <div className="mt-6 p-4 border border-[#525252] rounded-lg w-3/4">
                          <p className="text-gray-600">
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
                        <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-4 flex items-center w-3/4">
                          <img
                            src={peacImg}
                            alt="Offer"
                            className="w-10 h-10 mr-3 object-contain"
                          />
                          <p className="text-sm font-semibold">
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

          <Modal open={editOpen} onClose={handleEditClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
              <div className="bg-white w-full h-[98vh] mt-2 overflow-y-auto relative rounded-2xl shadow-2xl">
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={handleEditClose}
                >
                  <AiOutlineClose />
                </button>
                <div className="text-center my-4">
                  <img src={peacImg} alt="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
                  <div className="w-1/2 mx-auto bg-gray-100 rounded-full h-2.5">
                    <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(editStep / 7) * 100}%` }}></div>
                  </div>
                  <p className="text-gray-500 text-sm">Step {editStep} of 7</p>
                </div>
                {editStep === 1 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
                    <h6 className="text-4xl text-center font-['Quesha'] text-gray-800 mb-6">What's the name of your product?</h6>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="mt-4 block w-1/2 px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      placeholder="Enter product name..."
                    />
                    <div className="mt-4 flex justify-end w-1/2">
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 2 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-6">Choose a category for your product</h6>
                    <div className="mt-4 grid grid-cols-4 gap-4 w-3/4">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            editFormData.category === cat._id
                              ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                              : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => setEditFormData({ ...editFormData, category: cat._id })}
                        >
                          {cat.title || cat.name || "Unknown"}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 3 && (
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
                                  editFormData.sizes.includes(size)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(size, "sizes")}
                              >
                                {size}
                              </button>
                            ))}
                            {editFormData.sizes
                              .filter((size) => !["Small", "Medium", "Large", "ExtraLarge"].includes(size))
                              .map((size) => (
                                <button
                                  key={size}
                                  className="px-6 py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] w-[calc(25%-0.5rem)] text-center"
                                  onClick={() => toggleSelection(size, "sizes")}
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
                              className="px-4 py-2 rounded-full border border-gray-300"
                            />
                            <button
                              onClick={addCustomSize}
                              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[200px] justify-center"
                            >
                              <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
                            </button>
                          </div>
                        )}
                        {!showCustomSizeInput && (
                          <button
                            onClick={() => setShowCustomSizeInput(true)}
                            className="mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[200px] justify-center ml-[25%]"
                          >
                            <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Size
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
                                  editFormData.colors.includes(color)
                                    ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                    : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSelection(color, "colors")}
                              >
                                {color}
                              </button>
                            ))}
                            {editFormData.colors
                              .filter((color) => !["White", "Gray", "Black", "Orange"].includes(color))
                              .map((color) => (
                                <button
                                  key={color}
                                  className="px-6 py-3 rounded-full border-[1px] border-[#FFC300] bg-[#FFF5CC] text-[#FFC300] w-[calc(25%-0.5rem)] text-center"
                                  onClick={() => toggleSelection(color, "colors")}
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
                              className="px-4 py-2 rounded-full border border-gray-300"
                            />
                            <button
                              onClick={addCustomColor}
                              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[200px] justify-center"
                            >
                              <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                            </button>
                          </div>
                        )}
                        {!showCustomColorInput && (
                          <button
                            onClick={() => setShowCustomColorInput(true)}
                            className="mt-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-200 flex items-center w-[200px] justify-center ml-[25%]"
                          >
                            <AiOutlinePlusCircle size={20} className="mr-2" /> Add Custom Color
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 4 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800">Set your pricing</h6>
                    <div className="mt-4 w-1/2">
                      <p className="text-gray-600 float-left">Original Price</p>
                      <div className="flex flex-wrap justify-between mt-10 gap-2">
                        {["800", "1000", "1500", "2000", "2500"].map((price) => (
                          <button
                            key={price}
                            className={`px-4 py-2 rounded-full border transition-all ${
                              editFormData.originalPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setEditFormData({ ...editFormData, originalPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={editFormData.originalPrice}
                        onChange={(e) => setEditFormData({ ...editFormData, originalPrice: e.target.value })}
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
                              editFormData.discountPrice === price
                                ? "border-[#FFC300] border-[1px] bg-[#FFF5CC] text-[#FFC300]"
                                : "border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setEditFormData({ ...editFormData, discountPrice: price })}
                          >
                            {price} ETB
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={editFormData.discountPrice}
                        onChange={(e) => setEditFormData({ ...editFormData, discountPrice: e.target.value })}
                        className="mt-2 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Custom price..."
                      />
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 5 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800">Describe your product and set stock</h6>
                    <div className="mt-4 w-3/4">
                      <p className="text-gray-600 float-left">Description</p>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="mt-2 block w-full h-40 px-6 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left resize-none"
                        placeholder="Enter description..."
                      />
                    </div>
                    <div className="mt-4 w-1/2">
                      <p className="text-gray-600 float-left">Stock</p>
                      <input
                        type="number"
                        value={editFormData.stock}
                        onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                        className="mt-2 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Enter stock quantity..."
                      />
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 6 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-[6rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800">Enter transportation type</h6>
                    <div className="mt-4 w-1/2">
                      <p className="text-gray-600 float-left">Transportation Type</p>
                      <select
                        value={editFormData.transportationType || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, transportationType: e.target.value || null })}
                        className="mt-2 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      >
                        <option value="">Select Transportation Type</option>
                        <option value="bike">Bike</option>
                        <option value="motorbike">Motorbike</option>
                        <option value="car">Car</option>
                      </select>
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 7 && (
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
                        className={`flex items-center justify-center w-full py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 ${editFormData.images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <AiOutlinePlusCircle size={30} className="text-gray-600" />
                        <span className="ml-2 text-gray-600">Upload Images (Max 4)</span>
                      </label>
                      <div className="mt-4 flex gap-4 justify-center flex-wrap">
                        {editFormData.images.map((image, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={typeof image === "string" ? getImageUrl(image) : URL.createObjectURL(image)}
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
                        onClick={() => setEditStep(editStep - 1)}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={() => setEditStep(editStep + 1)}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {editStep === 8 && (
                  <div className="flex flex-col items-center justify-center h-[calc(98vh-150px)] p-8 mt-[10rem]">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-4">Review your product</h6>
                    <div className="w-[90%] mx-auto py-5">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2">
                          <img
                            src={editFormData.images.length > 0 ? (typeof editFormData.images[mainImageIdx] === "string" ? getImageUrl(editFormData.images[mainImageIdx]) : URL.createObjectURL(editFormData.images[mainImageIdx])) : ""}
                            alt="main preview"
                            className="w-[550px] h-[550px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                          />
                          <div className="relative">
                            <div className="absolute top-[-28rem] w-[550px] flex justify-center">
                              <div className="flex items-center space-x-4">
                                {[...Array(editFormData.images.length)].map((_, i) => (
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
                              {editFormData.images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className={`cursor-pointer mx-2 ${mainImageIdx === idx ? "" : ""}`}
                                >
                                  <img
                                    src={typeof image === "string" ? getImageUrl(image) : URL.createObjectURL(image)}
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
                            {editFormData.name || "Product Name"}
                          </h1>
                          <div className="flex items-center mt-2">
                            <Ratings rating={0} />
                          </div>
                          <p className="text-gray-600 mt-2">{editFormData.description || "No description provided"}</p>
                          <div className="flex items-center mt-4">
                            <h4 className={`${styles.productDiscountPrice}`}>
                              {editFormData.discountPrice} birr
                            </h4>
                            {editFormData.originalPrice && (
                              <h3 className={`${styles.price} ml-2`}>{editFormData.originalPrice} birr</h3>
                            )}
                          </div>
                          <div className="mt-6">
                            <label className="text-gray-800 font-semibold">Select Size</label>
                            <div className="flex space-x-2 mt-2">
                              {editFormData.sizes.length > 0 ? (
                                editFormData.sizes.map((size) => (
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
                              {editFormData.colors.length > 0 ? (
                                editFormData.colors.map((color) => (
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
                          </div>
                          <div className="mt-6">
                            <label className="text-gray-800 font-semibold">Transportation Type</label>
                            <p className="text-gray-800 mt-2">{editFormData.transportationType || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-between w-[90%]">
                        <button
                          className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                          onClick={() => setEditStep(editStep - 1)}
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
        </div>
      )}
    </>
  );
};

export default AllProducts;
