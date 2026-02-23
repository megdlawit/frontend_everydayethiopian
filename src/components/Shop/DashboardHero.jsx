import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineEye, AiOutlineClose } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { FiShoppingCart } from "react-icons/fi";
import { FaWallet } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import { addTocart } from "../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal } from "@material-ui/core";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import peacImg from "../../Assests/images/peac.png";
import Toast from "../../components/Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const DashboardHero = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { categories } = useSelector((state) => state.category);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsImageIdx, setDetailsImageIdx] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [click, setClick] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/650";
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

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
    if (seller && seller._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

  useEffect(() => {
    if (wishlist && selectedProduct && wishlist.find((i) => i._id === selectedProduct._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, selectedProduct]);

  const handleDetailsOpen = (product) => {
    setSelectedProduct(product);
    setDetailsImageIdx(0);
    setIsDescriptionExpanded(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setCount(1);
    setShowDetailsModal(true);
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

  const addToCartHandler = () => {
    const isItemExists = cart && cart.find((i) => i._id === selectedProduct?._id);
    if (isItemExists) {
      showToast("error", "Cart Error", "Item already in cart!");
    } else {
      if (selectedProduct.stock < 1) {
        showToast("error", "Stock Error", "Product stock limited!");
      } else {
        const cartData = { ...selectedProduct, qty: count, selectedSize, selectedColor };
        dispatch(addTocart(cartData));
        showToast("success", "Cart Success", "Item added to cart successfully!");
      }
    }
    if (selectedProduct.stock > 0 && selectedProduct.stock <= 5) {
      showToast("info", "Low Stock", `Only ${selectedProduct.stock} items left in stock!`);
    }
  };

  const removeFromWishlistHandler = () => {
    setClick(false);
    dispatch(removeFromWishlist(selectedProduct));
  };

  const addToWishlistHandler = () => {
    setClick(true);
    dispatch(addToWishlist(selectedProduct));
  };

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      if (!seller?._id) {
        showToast("error", "Seller Error", "Seller information is unavailable.");
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
        showToast("error", "Conversation Error", error.response?.data?.message || "Failed to start conversation");
      }
    } else {
      showToast("error", "Auth Error", "Please login to create a conversation");
    }
  };

  const getCategoryName = (categoryId, categories) => {
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const availableBalance = seller?.availableBalance.toFixed(2);
  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const popularProducts = products
    ? [...products]
        .sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0))
        .slice(0, 5)
    : [];

  const lowStockProducts = products
    ? [...products]
        .filter((product) => product.stock <= 10)
        .sort((a, b) => (a.stock || 0) - (b.stock || 0))
        .slice(0, 5)
    : [];

  const monthlySalesData = {};
  if (orders && Array.isArray(orders)) {
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (!monthlySalesData[month]) monthlySalesData[month] = 0;
      monthlySalesData[month] += order.totalPrice || 0;
    });
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySales = {};
  months.forEach((month) => {
    monthlySales[month] = monthlySalesData[month] || 0;
  });

  const monthlyOrdersData = {};
  if (orders && Array.isArray(orders)) {
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (!monthlyOrdersData[month]) monthlyOrdersData[month] = 0;
      monthlyOrdersData[month] += 1;
    });
  }

  const monthlyOrders = {};
  months.forEach((month) => {
    monthlyOrders[month] = monthlyOrdersData[month] || 0;
  });

  // Mobile Card Components
  const StatCardMobile = ({ icon: Icon, title, value, link, bgColor = "bg-gray-200" }) => (
    <div className="bg-white rounded-xl border border-gray-300 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className="text-2xl text-[#1C3B3C]" />
        </div>
        <span className="text-xs font-medium text-gray-600">{title}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          {title === "Account Balance" ? "Withdraw Money" : `All ${title}`}
        </span>
        <Link to={link}>
          <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" size={16} />
        </Link>
      </div>
    </div>
  );

  const ProductCardMobile = ({ product, type = "stock" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
            {product.name}
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">
              {type === "stock" ? `Stock: ${product.stock}` : `$${product.discountPrice?.toFixed(2)}`}
            </span>
            {type === "stock" ? (
              product.stock > 0 ? (
                <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-semibold">
                  Low Stock
                </span>
              ) : (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                  Out of Stock
                </span>
              )
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                product.status === "Active" 
                  ? "bg-green-100 text-green-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {product.status}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => handleDetailsOpen(product)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <AiOutlineEye size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <p className="text-xs sm:text-sm text-gray-500 pb-4">Last updated: {currentDateTime} EAT</p>
      
      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCardMobile
          icon={BsBoxSeam}
          title="Products"
          value={products?.length || 0}
          link="/dashboard-products"
        />
        <StatCardMobile
          icon={FiShoppingCart}
          title="Orders"
          value={orders?.length || 0}
          link="/dashboard-orders"
        />
        <StatCardMobile
          icon={FaWallet}
          title="Account Balance"
          value={`$${availableBalance}`}
          link="/dashboard-withdraw-money"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
          <div className="flex gap-2">
            <Link to="/dashboard-orders">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-xs sm:text-sm font-medium">
                See all
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Orders List */}
        <div className="lg:hidden space-y-3">
          {orders?.slice(0, 5).map((order) => (
            <div key={order._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate mb-1">Order ID: {order._id.slice(0, 8)}...</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Delivered" ? "bg-green-100 text-green-600" :
                      order.status === "Pending" ? "bg-yellow-100 text-yellow-600" :
                      order.status === "Canceled" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Items: {order.cart.reduce((acc, item) => acc + (item.qty || 1), 0)}</span>
                <span>Total: ${order.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-end">
                <Link to={`/order/${order._id}`}>
                  <button className="text-xs text-[#CC9A00] hover:text-[#B8860B] font-medium">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Orders Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-gray-500 text-sm">
                <th className="py-2 px-4 text-left font-medium">Order ID</th>
                <th className="py-2 px-4 text-left font-medium">Status</th>
                <th className="py-2 px-4 text-left font-medium">Items Qty</th>
                <th className="py-2 px-4 text-left font-medium">Total</th>
                <th className="py-2 px-4 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-900 font-semibold">{order._id}</td>
                  <td className="py-3 px-4">
                    {order.status === "Delivered" && (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Delivered
                      </span>
                    )}
                    {order.status === "Pending" && (
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    )}
                    {order.status === "Canceled" && (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Canceled
                      </span>
                    )}
                    {order.status !== "Delivered" &&
                      order.status !== "Pending" &&
                      order.status !== "Canceled" && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {order.status}
                        </span>
                      )}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {order.cart.reduce((acc, item) => acc + (item.qty || 1), 0)}
                  </td>
                  <td className="py-3 px-4 text-gray-700">${order.totalPrice?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Link to={`/order/${order._id}`}>
                      <Button>
                        <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Alert & Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Stock Alert - Mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Stock Alert</h3>
          
          {/* Mobile Stock Cards */}
          <div className="lg:hidden space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 5).map((product, index) => (
                <ProductCardMobile key={product._id || index} product={product} type="stock" />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No products with low stock.
              </div>
            )}
          </div>

          {/* Desktop Stock Table */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2 px-4 text-left font-medium max-w-[200px]">Product</th>
                  <th className="py-2 px-4 text-left font-medium">Stock</th>
                  <th className="py-2 px-4 text-left font-medium">Status</th>
                  <th className="py-2 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 5).map((product, index) => (
                    <tr key={product._id || index} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-900 font-semibold max-w-[200px] truncate">{product.name}</td>
                      <td className="py-3 px-4 text-gray-700">{product.stock}</td>
                      <td className="py-3 px-4">
                        {product.stock > 0 ? (
                          <span className="bg-yellow-100 text-yellow-600 px-4 py-1 rounded-full text-xs font-semibold w-[90px] inline-block text-center">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-semibold w-full inline-block text-center">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button onClick={() => handleDetailsOpen(product)}>
                          <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-3 px-4 text-gray-700 text-center">
                      No products with low stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Products - Mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Popular Products</h3>
          
          {/* Mobile Popular Products Cards */}
          <div className="lg:hidden space-y-3">
            {popularProducts.length > 0 ? (
              popularProducts.slice(0, 5).map((product, index) => (
                <ProductCardMobile key={product._id || index} product={product} type="popular" />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No popular products available.
              </div>
            )}
          </div>

          {/* Desktop Popular Products Table */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2 px-4 text-left font-medium max-w-[200px]">Products</th>
                  <th className="py-2 px-4 text-left font-medium">Price</th>
                  <th className="py-2 px-4 text-left font-medium">Status</th>
                  <th className="py-2 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {popularProducts.length > 0 ? (
                  popularProducts.slice(0, 5).map((product, index) => (
                    <tr key={product._id || index} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-900 font-semibold max-w-[200px] truncate">{product.name}</td>
                      <td className="py-3 px-4 text-gray-700">${product.discountPrice?.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {product.status === "Active" ? (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button onClick={() => handleDetailsOpen(product)}>
                          <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-3 px-4 text-gray-700 text-center">
                      No popular products available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Orders Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md" style={{ maxHeight: "300px" }}>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Monthly Orders</h3>
        <div style={{ height: "200px" }}>
          <Bar
            data={{
              labels: Object.keys(monthlyOrders),
              datasets: [
                {
                  label: "Orders",
                  data: Object.values(monthlyOrders),
                  backgroundColor: "#1C3B3C",
                  borderColor: "#1C3B3C",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Orders" },
                },
                x: {
                  title: { display: true, text: "Month" },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: window.innerWidth < 640 ? 10 : 12
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Product Details Modal - Responsive */}
      <Modal open={showDetailsModal} onClose={handleDetailsClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white w-full max-w-7xl max-h-[90vh] overflow-y-auto relative rounded-2xl shadow-2xl">
            <button
              className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition z-10"
              onClick={handleDetailsClose}
            >
              <AiOutlineClose size={20} />
            </button>
            {selectedProduct && (
              <div className="w-full p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Product Images */}
                  <div className="w-full lg:w-1/2">
                    <div className="flex flex-col items-center">
                      <img
                        src={getImageUrl(selectedProduct.images[detailsImageIdx]?.url)}
                        alt={selectedProduct.name || "Product image"}
                        className="w-full max-w-md h-auto max-h-96 object-cover rounded-lg border-2 border-white"
                      />
                      <div className="mt-4 w-full max-w-md">
                        <div className="flex justify-center gap-2 mb-4">
                          {[...Array(selectedProduct.images.length)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 rounded-full transition-all ${
                                detailsImageIdx === i ? "bg-[#CC9A00] w-8" : "bg-gray-300 w-4"
                              }`}
                              onClick={() => setDetailsImageIdx(i)}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-2 overflow-x-auto">
                          {selectedProduct.images.map((i, index) => (
                            <div
                              key={index}
                              className="cursor-pointer flex-shrink-0"
                            >
                              <img
                                src={getImageUrl(i?.url)}
                                alt={`Thumbnail ${index}`}
                                className="w-16 h-12 sm:w-20 sm:h-14 object-cover border-2 border-white rounded-lg"
                                onClick={() => setDetailsImageIdx(index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="w-full lg:w-1/2 lg:pl-6">
                    <button
                      onClick={() => navigate(`/products?category=${selectedProduct.category}`)}
                      className="bg-[#F0F0F0] text-[#263238] py-2 px-4 rounded-[16px] mb-4 w-fit hover:bg-gray-200 cursor-pointer text-sm"
                    >
                      {getCategoryName(selectedProduct.category, categories)}
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1c3b3c] mb-2">
                      {selectedProduct.name || "Unnamed Product"}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg sm:text-xl font-bold text-[#1c3b3c]">
                          {selectedProduct.discountPrice
                            ? `${selectedProduct.discountPrice} Birr`
                            : "N/A"}
                        </h4>
                        {selectedProduct.originalPrice && (
                          <h3 className="text-gray-500 line-through text-sm">
                            {selectedProduct.originalPrice} Birr
                          </h3>
                        )}
                      </div>
                      <Ratings rating={selectedProduct?.ratings || 0} />
                    </div>

                    {/* Product Details Sections */}
                    <div className="space-y-4">
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div>
                          <label className="text-gray-800 font-medium text-sm">Select Size</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.sizes.map((size) => (
                              <button
                                key={size}
                                className={`px-3 py-2 rounded-[16px] text-sm ${
                                  selectedSize === size
                                    ? "bg-gray-800 text-white"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                                onClick={() => setSelectedSize(size)}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div>
                          <label className="text-gray-800 font-medium text-sm">Select Color</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.colors.map((color) => (
                              <button
                                key={color}
                                className={`px-3 py-2 rounded-[16px] text-sm ${
                                  selectedColor === color
                                    ? "bg-gray-800 text-white"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                                onClick={() => setSelectedColor(color)}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-gray-800 font-medium text-sm">Stock</label>
                        <p className="text-gray-800 mt-1">
                          {selectedProduct.stock === undefined || selectedProduct.stock === null
                            ? "Not set"
                            : selectedProduct.stock}
                        </p>
                      </div>

                      <div className="border border-[#525252] rounded-lg p-3">
                        <p className="text-gray-600 text-sm">
                          {isDescriptionExpanded
                            ? selectedProduct.description
                            : truncatedDescription || "No description available"}
                          {isDescriptionLong && (
                            <span
                              className="text-[#CC9A00] cursor-pointer ml-1"
                              onClick={toggleDescription}
                            >
                              {isDescriptionExpanded ? " See Less" : " See More"}
                            </span>
                          )}
                        </p>
                      </div>

                      {discountPercent && (
                        <div className="bg-[#FFF6DB] text-[#CC9A00] rounded-lg p-3 flex items-center">
                          <img
                            src={peacImg}
                            alt="Offer"
                            className="w-8 h-8 mr-3 object-contain"
                          />
                          <p className="text-sm font-semibold">
                            Save {discountPercent}% today. Limited time offer!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

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

export default DashboardHero;