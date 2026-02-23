import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineDollarCircle, AiOutlineShop, AiOutlineShoppingCart, AiOutlineEye, AiOutlineUser, AiOutlineClose } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { getAllUsers } from "../../redux/actions/user";
import { getAllProducts } from "../../redux/actions/product";
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import Toast from "../../components/Toast"; // Adjust path to your custom Toast component
import { createTheme, ThemeProvider } from "@material-ui/core";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import AdminOrderDetails from "../../components/Admin/AdminOrderDetails";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const theme = createTheme({
  palette: {
    primary: {
      main: "#797a7a",
    },
  },
});

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);
  const { users } = useSelector((state) => state.user);
  const { allProducts, isLoading: productsLoading } = useSelector((state) => state.products || {});
  const [pendingShops, setPendingShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [showStockOverlay, setShowStockOverlay] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [showPreview, setShowPreview] = useState(false); // New state for preview overlay
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
    dispatch(getAllUsers());
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    const fetchPendingShops = async () => {
      setIsLoadingShops(true);
      try {
        const { data } = await axios.get(`${server}/shop/admin/pending-shops`, {
          withCredentials: true,
        });
        setPendingShops(data.pendingShops || []);
      } catch (error) {
        console.error("Error fetching pending shops:", error);
        showToast("error", "Fetch Failed", error.response?.data?.message || "Failed to fetch pending shops.");
      } finally {
        setIsLoadingShops(false);
      }
    };
    fetchPendingShops();
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setIsLoadingDeliveries(true);
      try {
        const { data } = await axios.get(`${server}/delivery/unapproved`, {
          withCredentials: true,
        });
        setDeliveries(data.deliveries || []);
      } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch deliveries";
        showToast("error", "Fetch Failed", message);
        if (message.includes("expired") || message.includes("login")) {
          window.location.href = "/login";
        }
      } finally {
        setIsLoadingDeliveries(false);
      }
    };
    fetchDeliveries();
  }, []);

  // Debug product data
  useEffect(() => {
    console.log("allProducts:", allProducts);
    console.log("productsLoading:", productsLoading);
  }, [allProducts, productsLoading]);

  const adminEarning = adminOrders && adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.10, 0);
  const adminBalance = adminEarning?.toFixed(2);

  const currentDateTime = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const monthlyOrdersData = {};
  if (adminOrders && Array.isArray(adminOrders)) {
    adminOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (!monthlyOrdersData[month]) monthlyOrdersData[month] = 0;
      monthlyOrdersData[month] += 1;
    });
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyOrders = {};
  months.forEach((month) => {
    monthlyOrders[month] = monthlyOrdersData[month] || 0;
  });

  const handleViewShopDetails = async (shopId) => {
    try {
      const { data } = await axios.get(`${server}/shop/admin/view-shop/${shopId}`, {
        withCredentials: true,
      });
      setSelectedShop(data.shop);
    } catch (error) {
      showToast("error", "Fetch Failed", error.response?.data?.message || "Failed to fetch shop details.");
    }
  };

  const handleViewDeliveryDetails = async (id) => {
    try {
      const { data } = await axios.get(`${server}/delivery/view/${id}`, {
        withCredentials: true,
      });
      setSelectedDelivery(data.delivery);
    } catch (error) {
      showToast("error", "Fetch Failed", error.response?.data?.message || "Failed to fetch delivery details.");
    }
  };

  const handleApproveShop = async (shopId) => {
    try {
      await axios.put(`${server}/shop/admin/approve-shop/${shopId}`, {}, {
        withCredentials: true,
      });
      showToast("success", "Shop Approved", "Shop approved successfully!");
      setSelectedShop(null);
      setShowPreview(false); // Close preview if open
      const { data } = await axios.get(`${server}/shop/admin/pending-shops`, {
        withCredentials: true,
      });
      setPendingShops(data.pendingShops || []);
    } catch (error) {
      showToast("error", "Approval Failed", error.response?.data?.message || "Failed to approve shop.");
    }
  };

  const handleRejectShop = async (shopId) => {
    try {
      await axios.put(`${server}/shop/admin/decline-shop/${shopId}`, {}, {
        withCredentials: true,
      });
      showToast("success", "Shop Declined", "Shop declined successfully!");
      setSelectedShop(null);
      setShowPreview(false); // Close preview if open
      const { data } = await axios.get(`${server}/shop/admin/pending-shops`, {
        withCredentials: true,
      });
      setPendingShops(data.pendingShops || []);
    } catch (error) {
      showToast("error", "Decline Failed", error.response?.data?.message || "Failed to decline shop.");
    }
  };

  const handlePreviewShop = (shop) => {
    setSelectedShop(shop);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    // Keep selectedShop to return to the detail modal
  };

  const getPreviewUrl = (shop) => {
    const selectedTemplate = shop.template || "basic";
    const plan = shop.plan || "free";
    const billingCycle = shop.billingCycle || "monthly";
    return selectedTemplate
      ? `${
          selectedTemplate === "growthplan"
            ? `/shop/growthplan/${shop._id}`
            : selectedTemplate === "proplan"
            ? `/shop/proplan/${shop._id}`
            : `/shop/preview/${shop._id}`
        }?plan=${encodeURIComponent(plan)}&template=${encodeURIComponent(selectedTemplate)}&billingCycle=${encodeURIComponent(billingCycle)}`
      : '';
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
      setShowStockOverlay(false);
      setStockProductId(null);
      setNewStock("");
      dispatch(getAllProducts());
    } catch (error) {
      showToast("error", "Update Failed", error.response?.data?.message || "Failed to update stock.");
    }
  };

  // Products that are no-stock or below (or equal to) the lowStockThreshold
  const lowStockProducts = Array.isArray(allProducts)
    ? allProducts.filter((p) =>
        p.status === "Active" &&
        p.shopId && p.shopId.isActive &&
        // include undefined/null stock (treated as 0) and any stock <= threshold
        (p.stock === undefined || p.stock === null || Number(p.stock) <= Number(lowStockThreshold))
      )
    : [];

  // keep existing debug but reference the new variable name
  useEffect(() => {
    console.log("All Products:", allProducts);
    console.log("Low / No Stock Products:", lowStockProducts);
    console.log("Filtered low/none count:", lowStockProducts.length);

    lowStockProducts.forEach((product, index) => {
      console.log(`LowStock Product ${index + 1}:`, {
        name: product.name,
        stock: product.stock,
        id: product._id
      });
    });
  }, [allProducts, lowStockProducts]);

  const getProductImageSrc = (images) => {
    if (images && images.length > 0) {
      const firstImage = images[0];
      let imageUrl = firstImage.url || firstImage;
      if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/Uploads/")) {
        imageUrl = `${server}/Uploads/${imageUrl.split("/").pop()}`;
      }
      console.log("Product Image URL:", imageUrl);
      return imageUrl;
    }
    console.warn("No valid image found, using placeholder");
    return `${server}/Uploads/messages/placeholder.png`;
  };

  return (
    <>
      {adminOrderLoading || isLoadingShops || isLoadingDeliveries || productsLoading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="p-6">
          <p className="text-sm text-gray-500 pb-4">Last updated: {currentDateTime} EAT</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <AiOutlineDollarCircle className="text-3xl text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{adminBalance} br</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Earnings</span>
                <Link to="/admin-withdraw-request">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <AiOutlineShop className="text-3xl text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600">All Sellers</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{sellers && sellers.length}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">View Sellers</span>
                <Link to="/admin-sellers">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <AiOutlineShoppingCart className="text-3xl text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600">All Orders</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{adminOrders && adminOrders.length}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">View Orders</span>
                <Link to="/admin-orders">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-200 rounded-lg p-3">
                  <AiOutlineUser className="text-3xl text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600">All Users</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{users && users.length}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">View Users</span>
                <Link to="/admin-users">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md mb-8">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-gray-800">Pending Shop Requests</span>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pendingShops.length} pending
                  </span>
                </div>
              </div>

              {isLoadingShops ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : pendingShops.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No pending shop requests</div>
                </div>
              ) : (
                <ThemeProvider theme={theme}>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="py-2 px-4 text-left font-medium">Shop Name</th>
                        <th className="py-2 px-4 text-left font-medium">Email</th>
                        <th className="py-2 px-4 text-left font-medium">Date</th>
                        <th className="py-2 px-4 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingShops.slice(0, 4).map((shop) => (
                        <tr key={shop._id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-700 truncate max-w-[120px] font-medium" title={shop.name || "N/A"}>
                            {shop.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 truncate max-w-[120px]" title={shop.phoneNumber || "N/A"}>
                            {shop.email || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-sm">
                            {new Date(shop.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleViewShopDetails(shop._id)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                              title="View Details"
                            >
                              <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ThemeProvider>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-600">View All Pending Shops</span>
                <Link to="/admin/pending-shops" className="flex items-center text-gray hover:text-blue-800 transition-colors">
                  <AiOutlineArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md mb-8">
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <span className="float-left font-bold text-lg text-gray-800">Products With No/Low Stock</span>
                </div>
              </div>
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">Loading products...</div>
                </div>
              ) : !Array.isArray(allProducts) || allProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No products available.</div>
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">All products have sufficient stock.</div>
                </div>
              ) : (
                <ThemeProvider theme={theme}>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="py-2 px-4 text-left font-medium">Product</th>
                        <th className="py-2 px-4 text-left font-medium">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lowStockProducts.slice(0, 4).map((product) => {
                        const stockStatus =
                          product.stock === undefined || product.stock === null || product.stock === 0
                            ? 'no-stock'
                            : 'low-stock';

                        const stockValue =
                          product.stock === undefined || product.stock === null || product.stock === 0
                            ? 0
                            : product.stock;

                        return (
                          <tr key={product._id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-700">
                              <span className="truncate max-w-[2rem]" title={product.name || "N/A"}>
                                {product.name || "N/A"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              <div className="flex items-center gap-2">
                                {stockStatus === 'no-stock' ? (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                    No Stock
                                  </span>
                                ) : (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Low Stock: {stockValue}
                                  </span>
                                )}
                                <button
                                  className="bg-[#CC9A00] text-white px-3 py-1 rounded-full text-xs hover:bg-[#FFD700] transition"
                                  onClick={() => handleOpenStockOverlay(product._id)}
                                >
                                  Update Stock
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ThemeProvider>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-gray-600">View All Products</span>
                <Link to="/admin-products">
                  <AiOutlineArrowRight className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                </Link>
              </div>
              {showStockOverlay && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] flex flex-col items-center">
                    <h4 className="text-lg font-semibold mb-4 text-[#1C3B3E]">Update Stock</h4>
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E]"
                      placeholder="Enter stock quantity"
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
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md mb-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-900">Latest Orders</h4>
                <div className="flex gap-2">
                  <Link to="/admin-orders">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium">
                      See all
                    </button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <ThemeProvider theme={theme}>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="py-2 px-4 text-left font-medium">Order ID</th>
                        <th className="py-2 px-4 text-left font-medium">Status</th>
                        <th className="py-2 px-4 text-left font-medium">Items Qty</th>
                        <th className="py-2 px-4 text-left font-medium">Total</th>
                        <th className="py-2 px-4 text-left font-medium">Order Date</th>
                        <th className="py-2 px-4 text-left font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adminOrders?.slice(0, 5).map((order) => (
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
                          <td className="py-3 px-4 text-gray-700">{order.createdAt.slice(0, 10)}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedOrderId(order._id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <AiOutlineEye size={20} className="text-gray-400 hover:text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ThemeProvider>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md mt-10" style={{ maxHeight: "300px" }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Orders</h3>
            <div style={{ height: "200px" }}>
              <Bar
                data={{
                  labels: Object.keys(monthlyOrders),
                  datasets: [
                    {
                      label: "Orders",
                      data: Object.values(monthlyOrders),
                      backgroundColor: "#1C3B3c",
                      borderColor: "#1C3B3c",
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
                }}
              />
            </div>
          </div>

          {selectedShop && !showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden animate-scaleIn">
                <div className="bg-[radial-gradient(circle_at_top,_#41666A_33%,_#1C3B3E_100%)] text-white flex items-center justify-between p-6 relative">
                  <div className="flex items-center gap-4">
                    {selectedShop.avatar && selectedShop.avatar.url ? (
                      <img
                        src={`${backend_url}${selectedShop.avatar.url}`}
                        alt={`${selectedShop.name} logo`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{selectedShop.name || "N/A"}</h2>
                      <p className="text-sm opacity-80">ShopId- {selectedShop._id || "N/A"}</p>
                      <span className="inline-block mt-2 px-4 py-1 border border-[#FFC300] bg-[#FFF3CC] text-[#FFC300] rounded-full text-sm font-medium">
                        {selectedShop.status ? selectedShop.status.charAt(0).toUpperCase() + selectedShop.status.slice(1) : "Pending"}
                      </span>
                    </div>
                  </div>
                  {selectedShop.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveShop(selectedShop._id)}
                        className="px-5 py-2 bg-[#FFC300] text-white rounded-full hover:bg-yellow-500 font-semibold shadow"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectShop(selectedShop._id)}
                        className="px-5 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 font-semibold shadow"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    onClick={() => setSelectedShop(null)}
                  >
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                <div className="p-8">
                  <div className="border rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Email</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.email || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Address</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.address || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Phone Number</label>
                        <div className="px-4 py-2 border rounded-full text-gray-600 font-light">
                          {selectedShop.phoneNumber || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-normal text-gray-700 mb-1">Template</label>
                        <div
                          className="inline-block px-4 py-2 bg-purple-200 text-purple-800 rounded-full font-light cursor-pointer hover:bg-purple-300 transition-colors"
                          onClick={() => handlePreviewShop(selectedShop)}
                        >
                          {selectedShop.template || "N/A"}
                        </div>
                      </div>
                    </div>
                    {selectedShop.description && (
                      <div className="mt-6">
                        <label className="block text-sm font-normal text-gray-700 mb-1">Description</label>
                        <div className="px-4 py-2 border rounded-lg text-gray-600 font-light">
                          {selectedShop.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreview && selectedShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 pointer-events-auto animate-scaleIn">
              <div
                className="absolute w-[1000px] h-[900px] rounded-full z-[-1]"
                style={{
                  background: `radial-gradient(circle, rgba(255, 193, 7, 0.7) 0%, rgba(255, 193, 7, 0.4) 40%, transparent 70%)`,
                  filter: 'blur(100px)',
                  opacity: 0.8,
                }}
              />
              <div className="relative rounded-2xl w-full max-w-7xl flex flex-col max-h-[100vh] mt-[2rem] overflow-y-hidden">
                <button
                  onClick={handleClosePreview}
                  className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-600 rounded-full p-2 transition-colors z-50"
                  aria-label="Close preview"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="white"
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
                <div className="flex-1 rounded-lg border border-gray-200 shadow-inner">
                  <iframe
                    src={getPreviewUrl(selectedShop)}
                    title="Shop Preview"
                    className="w-full h-full min-h-[100vh] rounded-lg"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="sticky bottom-10 pt-4 pb-4 flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => handleApproveShop(selectedShop._id)}
                    className="bg-[#CC9A00] text-white px-8 py-3 rounded-full font-avenir-lt-std hover:bg-[#FFB300] transition-colors shadow-md text-lg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectShop(selectedShop._id)}
                    className="bg-gray-500 text-white px-8 py-3 rounded-full font-avenir-lt-std hover:bg-gray-600 transition-colors shadow-md text-lg"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedDelivery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Delivery Details</h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Delivery ID:</strong> {selectedDelivery._id}</p>
                  <p><strong>Full Name:</strong> {selectedDelivery.fullName || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedDelivery.email || "N/A"}</p>
                  <p><strong>Phone Number:</strong> {selectedDelivery.phoneNumber || "N/A"}</p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedDelivery.address || selectedDelivery.coverageArea?.join(", ") || "N/A"}
                  </p>
                  <p>
                    <strong>Charge/Km:</strong>{" "}
                    {selectedDelivery.chargePerKm
                      ? `$${selectedDelivery.chargePerKm.toFixed(2)}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedDelivery.status.charAt(0).toUpperCase() +
                      selectedDelivery.status.slice(1) || "N/A"}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setSelectedDelivery(null)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedOrderId && (
            <AdminOrderDetails orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
          )}
        </div>
      )}
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-in-out;
          }
          @import url('https://fonts.cdnfonts.com/css/avenir-lt-std');
          .font-avenir-lt-std {
            font-family: 'Avenir LT Std', sans-serif;
          }
        `}
      </style>
    </>
  );
};

export default AdminDashboardMain;