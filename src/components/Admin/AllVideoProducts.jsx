import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import { createTheme, ThemeProvider, Modal } from "@material-ui/core";
import { getAllAdminVideoProducts } from "../../redux/actions/product";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import Ratings from "../Products/Ratings";
import axios from "axios";
import { server, backend_url } from "../../server";
import styles from "../../styles/styles";
import peac from "../../Assests/images/peac.png";
import DeleteModal from "../DeleteModal"; // Import the DeleteModal component

const AllVideoProducts = () => {
  const { allVideoProducts = [], isLoading, error } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [category, setCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state for DeleteModal
  const [deleteProductId, setDeleteProductId] = useState(null); // New state for product ID to delete
  const [showStockOverlay, setShowStockOverlay] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const itemsPerPage = 5;

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

  const videoSrc = (videoPath) => {
    if (!videoPath) return null;
    return videoPath.startsWith('http') ? videoPath : `${backend_url}${videoPath}`;
  };

  useEffect(() => {
    dispatch(getAllAdminVideoProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
      dispatch({ type: "clearErrors" });
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (wishlist && selectedProduct && wishlist.find((i) => i._id === selectedProduct._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, selectedProduct]);

  const handleDelete = (id) => {
    // Open the delete confirmation modal instead of using window.confirm
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${server}/product/admin-delete-product/${deleteProductId}`, { withCredentials: true });
      dispatch(getAllAdminVideoProducts());
      showToast("success", "Product Deleted", "Video product deleted successfully!");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    } catch (error) {
      showToast("error", "Delete Error", error.response?.data?.message || "Failed to delete video product.");
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProductId(null);
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
      dispatch(getAllAdminVideoProducts());
      handleCloseStockOverlay();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast("error", "Authentication Error", "Login to continue");
      } else {
        showToast("error", "Update Error", error.response?.data?.message || "Failed to update stock.");
      }
    }
  };

  const handleOpen = async (product) => {
    setSelectedProduct(product);
    setCount(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setIsDescriptionExpanded(false);
    try {
      if (product.category) {
        const categoryRes = await axios.get(`${server}/category/get-category/${product.category}`, { withCredentials: true });
        if (categoryRes.data.success) {
          setCategory(categoryRes.data.category);
        } else {
          setCategory(null);
        }
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setCategory(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setCount(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setIsDescriptionExpanded(false);
    setCategory(null);
  };

  const incrementCount = () => {
    if (selectedProduct && count < selectedProduct.stock) {
      setCount(count + 1);
    } else if (selectedProduct) {
      showToast("error", "Stock Limit", `Maximum stock limit reached: ${selectedProduct.stock}`);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else if (selectedProduct) {
      if (selectedProduct.stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = {
          ...selectedProduct,
          qty: count,
          selectedSize,
          selectedColor,
          shopId: selectedProduct.shop?._id || selectedProduct.shopId,
        };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Updated", "Item added to cart successfully!");
      }
      if (selectedProduct.stock > 0 && selectedProduct.stock <= 5) {
        showToast("info", "Low Stock", `Only ${selectedProduct.stock} items left in stock!`);
      }
    }
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!selectedProduct?.shop?._id) {
        showToast("error", "Seller Error", "Seller information is unavailable.");
        return;
      }
      const groupTitle = selectedProduct._id + user._id;
      const userId = user._id;
      const sellerId = selectedProduct.shop._id;
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
      showToast("error", "Authentication Error", "Please login to create a conversation");
    }
  };

  const handleCategoryClick = () => {
    if (category?._id) {
      navigate(`/VideoShoppingPage?category=${category._id}`);
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const sortedProducts = [...allVideoProducts]
    .filter(item => item.video && item.video !== "")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredProducts = sortedProducts.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(searchLower) ||
      item._id?.toLowerCase().includes(searchLower);
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

  const discountPercent = selectedProduct?.originalPrice && selectedProduct?.discountPrice
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.discountPrice) / selectedProduct.originalPrice) * 100)
    : 0;

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
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Video Products</h3>
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
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-sm"
                  />
                  <AiOutlineSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
                {/* <button
                  onClick={handleFilterToggle}
                  className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Filter
                </button> */}
              </div>
            </div>
            {filteredProducts.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-900">No video products found matching your search.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ThemeProvider theme={theme}>
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr className="text-gray-500 text-sm">
                          <th className="py-2 px-2 text-left font-medium w-[40px]">Product ID</th>
                          <th className="py-2 px-4 text-left font-medium">Product</th>
                          <th className="py-2 px-4 text-left font-medium">Price</th>
                          <th className="py-2 px-4 text-left font-medium">Stock</th>
                          <th className="py-2 px-4 text-left font-medium w-[40px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentProducts.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td
                              className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate"
                              title={item._id}
                            >
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
                                <span>{item.name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {item.discountPrice ? `${item.discountPrice} ETB` : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
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
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleOpen(item)}>
                                  <AiOutlineEye
                                    size={20}
                                    className="text-gray-600 hover:text-blue-500 cursor-pointer"
                                    title="View Details"
                                  />
                                </button>
                                <button onClick={() => handleDelete(item._id)}>
                                  <AiOutlineDelete
                                    size={20}
                                    className="text-gray-600 hover:text-red-500 cursor-pointer"
                                    title="Delete Product"
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
                  {/* Render DeleteModal */}
                  <DeleteModal
                    open={showDeleteModal}
                    onClose={handleCloseDeleteModal}
                    onConfirm={confirmDelete}
                    title="Delete Video Product?"
                    description="This action cannot be undone. Are you sure you want to delete this video product?"
                  />
                </div>
                {showStockOverlay && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] flex flex-col items-center">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900">Enter Stock</h4>
                      <input
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-700"
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
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
                          onClick={handleCloseStockOverlay}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <Modal open={open} onClose={handleClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
              <div className="bg-white w-full max-w-9xl h-[100vh] mt-10 overflow-y-auto relative rounded-2xl shadow-2xl p-6">
                <button
                  className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={handleClose}
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {selectedProduct && (
                  <div className="w-[90%] mx-auto py-5">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2">
                        <div className="relative">
                          <video
                            src={videoSrc(selectedProduct.video)}
                            controls
                            className="w-[650px] h-[600px] mx-auto md:mx-0 border-2 border-white rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = "/Uploads/placeholder-video.mp4";
                            }}
                          />
                          {discountPercent > 0 && (
                            <div className="absolute top-2 right-2 bg-[#CC9A00] text-white text-xs font-bold px-2 py-1 rounded-full">
                              {discountPercent}% OFF
                            </div>
                          )}
                        </div>
                        {selectedProduct.images && selectedProduct.images.length > 0 && (
                          <div className="flex justify-center mt-4">
                            {selectedProduct.images.map((i, index) => (
                              <div key={index} className="cursor-pointer mx-2">
                                <img
                                  src={
                                    i?.url
                                      ? `${backend_url}${i.url}`
                                      : "https://via.placeholder.com/140x100"
                                  }
                                  alt={`Thumbnail ${index}`}
                                  className="w-[140px] h-[100px] object-cover border-2 border-white rounded-lg"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/140x100";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
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
                                    src={
                                      selectedProduct?.shop?.avatar?.url
                                        ? `${backend_url}${selectedProduct.shop.avatar.url}`
                                        : "/Uploads/avatar/avatar-1754729528346-341457281.jpg"
                                    }
                                    alt={selectedProduct.shop?.name || "Shop"}
                                    className="w-[50px] h-[50px] rounded-full mr-3 object-cover"
                                    onError={(e) => {
                                      e.target.src = "/Uploads/avatar/avatar-1754729528346-341457281.jpg";
                                    }}
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
                                      {selectedProduct.shop?.name || "Unknown Shop"}
                                    </h3>
                                  </Link>
                                  <div className="flex mt-1">
                                    <Ratings rating={selectedProduct?.ratings || 0} />
                                  </div>
                                </div>
                              </div>
                              {/* <button
                                className="text-[#CC9A00] bg-[#FFF6DB] py-2 px-4 rounded-[16px] border border-[#CC9A00] hover:bg-yellow-100"
                                onClick={handleMessageSubmit}
                              >
                                Send Message <AiOutlineMessage className="ml-1 inline" />
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 md:pl-10 mt-5 md:mt-0">
                        {category && (
                          <button
                            onClick={handleCategoryClick}
                            className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer"
                          >
                            <p className="text-sm">{category.title || "Unknown Category"}</p>
                          </button>
                        )}
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
                        {/* <div className="mt-6 w-3/4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                                onClick={decrementCount}
                              >
                                -
                              </button>
                              <span className="mx-4 text-gray-800 font-medium">{count}</span>
                              <button
                                className="w-8 h-8 bg-[#F0F0F0] text-[#263238] rounded-full flex items-center justify-center hover:bg-gray-200"
                                onClick={incrementCount}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="bg-[#CC9A00] text-white py-3 px-10 rounded-[16px] flex items-center justify-center hover:bg-yellow-500 flex-grow"
                              onClick={() => addToCartHandler(selectedProduct._id)}
                            >
                              <AiOutlineShoppingCart className="mr-2" /> Add to Cart
                            </button>
                            <div className="relative">
                              {click ? (
                                <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                                  <AiFillHeart
                                    size={24}
                                    className="cursor-pointer"
                                    onClick={() => removeFromWishlistHandler(selectedProduct)}
                                    color={click ? "red" : "#333"}
                                    title="Remove from wishlist"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-[16px] bg-gray-50 flex items-center justify-center">
                                  <AiOutlineHeart
                                    size={24}
                                    className="cursor-pointer"
                                    onClick={() => addToWishlistHandler(selectedProduct)}
                                    color={click ? "red" : "#333"}
                                    title="Add to wishlist"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}
                        <div className="mt-6 p-4 border border-[#525252] rounded-lg w-3/4">
                          <p className="text-gray-600">
                            {isDescriptionExpanded
                              ? selectedProduct.description
                              : truncatedDescription || "No description available"}
                            {isDescriptionLong && (
                              <span
                                className="text-[#CC9A00] cursor-pointer ml-2 font-semibold"
                                onClick={toggleDescription}
                              >
                                {isDescriptionExpanded ? "See Less" : "See More"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-4 bg-[#FFF6DB] text-[#CC9A00] shadow-md rounded-lg p-4 flex items-center w-3/4">
                          <img
                            src={peac}
                            alt="Offer"
                            className="w-10 h-10 mr-3 object-contain"
                          />
                          <p className="text-sm font-semibold">
                            {discountPercent > 0
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
        </div>
      )}

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
    </>
  );
};

export default AllVideoProducts;