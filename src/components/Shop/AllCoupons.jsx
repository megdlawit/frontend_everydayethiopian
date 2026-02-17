import React, { useEffect, useState } from "react";
import { AiOutlineSearch, AiOutlineDelete, AiOutlineClose, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import Loader from "../Layout/Loader";
import { server } from "../../server";
import { createTheme, ThemeProvider } from "@material-ui/core";
import Pagination from "../Pagination";
import DeleteModal from "../DeleteModal"; 
import peacImg from "../../Assests/images/peac.png";
import { getAllProducts } from "../../redux/actions/product";

const AllCoupons = () => {
  const { seller } = useSelector((state) => state.seller);
  const { allProducts } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCouponId, setDeleteCouponId] = useState(null);
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
    setIsLoading(true);
    axios
      .get(`${server}/coupon/get-coupon/${seller._id}`, { withCredentials: true })
      .then((res) => {
        setIsLoading(false);
        console.log("Fetched coupons:", res.data.couponCodes);
        setCoupons(res.data.couponCodes || []);
      })
      .catch((error) => {
        setIsLoading(false);
        showToast("error", "Error", error.response?.data?.message || "Failed to fetch coupons.");
      });
    if (!allProducts || allProducts.length === 0) {
      console.log("Fetching products, current allProducts:", allProducts);
      dispatch(getAllProducts());
    }
    console.log("allProducts after dispatch:", allProducts);
  }, [dispatch, seller._id, allProducts]);

  const handleDelete = (id) => {
    setDeleteCouponId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${server}/coupon/delete-coupon/${deleteCouponId}`, { withCredentials: true });
      showToast("success", "Success", "Coupon code deleted successfully!");
      setCoupons(coupons.filter((coupon) => coupon._id !== deleteCouponId));
      setShowDeleteModal(false);
      setDeleteCouponId(null);
    } catch (error) {
      showToast("error", "Error", error.response?.data?.message || "Failed to delete coupon.");
      setShowDeleteModal(false);
      setDeleteCouponId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteCouponId(null);
  };

  const handleEdit = (coupon) => {
    console.log("Editing coupon:", coupon);
    setName(coupon.name || "");
    setValue(coupon.value || "");
    setMinAmount(coupon.minAmount || "");
    setMaxAmount(coupon.maxAmount || "");
    setSelectedProduct(coupon.selectedProduct || "");
    console.log("Set selectedProduct:", coupon.selectedProduct);
    setEditCouponId(coupon._id);
    setEditMode(true);
    setStep(1);
    setOpen(true);
  };

  const handleViewDetails = (coupon) => {
    console.log("Viewing coupon details:", coupon);
    setSelectedCoupon(coupon);
    setDetailsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !value) {
      showToast("error", "Error", "Please fill all required fields (Name and Discount).");
      return;
    }

    if (allProducts && allProducts.length > 0 && !selectedProduct) {
      showToast("error", "Error", "Please select a product if products are available.");
      return;
    }

    if (
      selectedProduct &&
      allProducts &&
      allProducts.length > 0 &&
      !allProducts.find((p) => p._id === selectedProduct)
    ) {
      showToast("error", "Error", "Selected product is invalid. Please choose a valid product.");
      return;
    }

    const payload = {
      name,
      value: Number(value),
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
      selectedProduct: selectedProduct || null,
      shopId: seller._id,
    };
    console.log("Submitting payload:", payload);

    try {
      if (editMode) {
        await axios.put(
          `${server}/coupon/update-coupon/${editCouponId}`,
          payload,
          { withCredentials: true }
        );
        showToast("success", "Success", "Coupon code updated successfully!");
      } else {
        await axios.post(
          `${server}/coupon/create-coupon-code`,
          payload,
          { withCredentials: true }
        );
        showToast("success", "Success", "Coupon code created successfully!");
      }
      setOpen(false);
      resetForm();
      axios
        .get(`${server}/coupon/get-coupon/${seller._id}`, { withCredentials: true })
        .then((res) => {
          console.log("Refreshed coupons:", res.data.couponCodes);
          setCoupons(res.data.couponCodes || []);
        });
    } catch (error) {
      showToast("error", "Error", error.response?.data?.message || `Failed to ${editMode ? "update" : "create"} coupon.`);
    }
  };

  const resetForm = () => {
    setName("");
    setValue("");
    setMinAmount("");
    setMaxAmount("");
    setSelectedProduct("");
    setStep(1);
    setEditMode(false);
    setEditCouponId(null);
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const filteredCoupons = coupons.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || item._id.toLowerCase().includes(searchLower);
    const matchesFilter = !isFiltered || item.selectedProduct;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastCoupon = currentPage * itemsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };

  const getProductName = (productId) => {
    if (!productId) return "None";
    const product = (allProducts || []).find((p) => p._id === productId);
    return product ? product.name : "None";
  };

  // Mobile Card Component
  const CouponCard = ({ coupon }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{coupon.name}</h3>
          <p className="text-xs text-gray-500 mt-1">ID: {coupon._id.slice(-8)}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-gray-900">{coupon.value}%</span>
            <span className="text-sm text-gray-600">{getProductName(coupon.selectedProduct)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Min: {coupon.minAmount || "N/A"} | Max: {coupon.maxAmount || "N/A"}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewDetails(coupon)}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <AiOutlineEye size={18} />
          </button>
          <button 
            onClick={() => handleEdit(coupon)}
            className="p-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <AiOutlineEdit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(coupon._id)}
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
        <div className="w-full mx-2 md:mx-8 pt-1 mt-4 md:mt-10 bg-white font-avenir">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-md">
            {/* Header Section - Responsive */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">All Coupons</h3>
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
                  <button
                    onClick={handleFilterToggle}
                    className={`flex items-center gap-2 px-4 py-2 border ${isFiltered ? 'border-[#FFC300] bg-[#FFF5CC] text-[#FFC300]' : 'border-gray-200 text-gray-700 bg-white'} rounded-lg hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                    </svg>
                    Filter
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      resetForm();
                      setOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium w-full md:w-auto justify-center"
                  >
                    Create Coupon Code
                  </button>
                </div>
              </div>
            </div>

            {/* Coupons List - Mobile Cards */}
            {isMobile ? (
              <div className="space-y-3">
                {currentCoupons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No coupons found matching your criteria.
                  </div>
                ) : (
                  currentCoupons.map((item) => (
                    <CouponCard key={item._id} coupon={item} />
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
                        <th className="py-2 px-2 text-left font-medium w-[40px]">Coupon ID</th>
                        <th className="py-2 px-4 text-left font-medium">Coupon Code</th>
                        <th className="py-2 px-4 text-left font-medium">Value</th>
                        <th className="py-2 px-4 text-left font-medium">Product</th>
                        <th className="py-2 px-4 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentCoupons.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-gray-500">
                            No coupons found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        currentCoupons.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate" title={item._id}>
                              {item._id}
                            </td>
                            <td className="py-3 px-4 text-gray-700">{item.name}</td>
                            <td className="py-3 px-4 text-gray-700">{item.value}%</td>
                            <td className="py-3 px-4 text-gray-700">{getProductName(item.selectedProduct)}</td>
                            <td className="py-3 px-4 text-left">
                              <div className="flex gap-2">
                                <button onClick={() => handleViewDetails(item)}>
                                  <AiOutlineEye size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
                                </button>
                                <button onClick={() => handleEdit(item)}>
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
                totalItems={filteredCoupons.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
              <DeleteModal
                open={showDeleteModal}
                onClose={handleCloseDeleteModal}
                onConfirm={confirmDelete}
                title="Delete Coupon?"
                description="This action cannot be undone. Are you sure you want to delete this coupon code?"
              />
            </div>
          </div>

          {/* Create/Edit Coupon Modal - Responsive */}
          {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 md:p-0">
              <div className={`bg-white ${isMobile ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  <AiOutlineClose />
                </button>
                <div className="text-center my-4">
                  <img src={peacImg} alt="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
                  <div className={`${isMobile ? 'w-3/4' : 'w-1/2'} mx-auto bg-gray-100 rounded-full h-2.5`}>
                    <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
                  </div>
                  <p className="text-gray-500 text-sm">Step {step} of 4</p>
                </div>
                
                {step === 1 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-center font-['Quesha'] text-gray-800 mb-6`}>
                      {editMode ? "Edit coupon name" : "What's the name of your coupon?"}
                    </h6>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
                      placeholder="Enter coupon name..."
                      required
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
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>
                      {editMode ? "Edit discount percentage" : "Set discount percentage"}
                    </h6>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={`mt-4 block ${isMobile ? 'w-3/4' : 'w-1/2'} px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left`}
                      placeholder="Enter discount percentage..."
                      required
                    />
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
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>
                      {editMode ? "Edit minimum and maximum amount" : "Set minimum and maximum amount"}
                    </h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <label className="block text-gray-600 mb-2">Min Amount</label>
                      <input
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Enter minimum amount..."
                      />
                    </div>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <label className="block text-gray-600 mb-2">Max Amount</label>
                      <input
                        type="number"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                        placeholder="Enter maximum amount..."
                      />
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

                {step === 4 && (
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'h-[calc(85vh-200px)] mt-6' : 'h-[calc(85vh-250px)] mt-10'}`}>
                    <h6 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-['Quesha'] text-gray-800 mb-6`}>
                      {editMode ? "Edit product and review" : "Select product and review"}
                    </h6>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <label className="block text-gray-600 mb-2">Select Product</label>
                      <div className="relative">
                        <select
                          className={`w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left appearance-none ${isMobile ? 'text-sm' : ''}`}
                          value={selectedProduct || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            console.log(`Dropdown: Selected product ID: ${newValue}`);
                            setSelectedProduct(newValue);
                          }}
                        >
                          <option value="">Choose a product</option>
                          {(allProducts || []).map((i) => (
                            <option value={i._id} key={i._id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                        {selectedProduct && allProducts && allProducts.length > 0 && getProductName(selectedProduct) !== "None" && (
                          <svg
                            className="w-4 h-4 text-[#FFC300] absolute right-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      {allProducts && allProducts.length === 0 && (
                        <p className="text-red-500 text-sm mt-2">No products available. Please add products first.</p>
                      )}
                      {selectedProduct && allProducts && allProducts.length > 0 && getProductName(selectedProduct) === "None" && (
                        <p className="text-red-500 text-sm mt-2">Selected product is invalid. Please choose a valid product.</p>
                      )}
                    </div>
                    <div className={`mt-4 ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <h6 className={`text-xl font-semibold text-gray-800 mb-2 ${isMobile ? 'text-lg' : ''}`}>Review Coupon Details</h6>
                      <div className="bg-[#faf9f6] p-4 rounded-lg">
                        <p className={`${isMobile ? 'text-sm' : ''}`}><strong>Name:</strong> {name || "N/A"}</p>
                        <p className={`${isMobile ? 'text-sm' : ''}`}><strong>Discount:</strong> {value ? `${value}%` : "N/A"}</p>
                        <p className={`${isMobile ? 'text-sm' : ''}`}><strong>Min Amount:</strong> {minAmount || "N/A"}</p>
                        <p className={`${isMobile ? 'text-sm' : ''}`}><strong>Max Amount:</strong> {maxAmount || "N/A"}</p>
                        <p className={`flex items-center ${isMobile ? 'text-sm' : ''}`}>
                          <strong>Selected Product:</strong> {getProductName(selectedProduct)}
                          {selectedProduct && allProducts && allProducts.length > 0 && getProductName(selectedProduct) !== "None" && (
                            <svg
                              className="w-4 h-4 text-[#FFC300] ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={`mt-4 flex ${isMobile ? 'flex-col-reverse gap-4' : 'justify-between'} ${isMobile ? 'w-5/6' : 'w-1/2'}`}>
                      <button
                        className={`${isMobile ? 'w-full py-2' : 'w-8 h-8'} bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition ${isMobile ? 'justify-center' : ''}`}
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                        {isMobile && <span className="ml-2">Back</span>}
                      </button>
                      <button
                        className={`px-6 py-2 bg-[#FFC300] text-white rounded-full text-sm font-semibold hover:bg-[#FFD700] ${isMobile ? 'w-full py-3' : ''}`}
                        onClick={handleSubmit}
                      >
                        {editMode ? "Update" : "Create"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coupon Details Overlay - Responsive */}
          {detailsOpen && selectedCoupon && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className={`bg-white ${isMobile ? 'w-full max-w-md' : 'w-1/2 max-w-lg'} rounded-2xl shadow-2xl p-4 sm:p-6 relative`}>
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={() => setDetailsOpen(false)}
                >
                  <AiOutlineClose />
                </button>
                <div className="text-center my-4">
                  <img src={peacImg} alt="Peac Logo" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 animate-bounce" />
                  <h6 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-['Quesha'] text-gray-800 mb-4`}>Coupon Details</h6>
                </div>
                <div className="bg-[#faf9f6] p-3 sm:p-4 rounded-lg">
                  <p className={`flex items-center mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Coupon ID:</strong> <span className="truncate">{selectedCoupon._id || "N/A"}</span>
                    <svg
                      className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </p>
                  <p className={`flex items-center mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Name:</strong> {selectedCoupon.name || "N/A"}
                    <svg
                      className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </p>
                  <p className={`flex items-center mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Discount:</strong> {selectedCoupon.value ? `${selectedCoupon.value}%` : "N/A"}
                    <svg
                      className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </p>
                  <p className={`flex items-center mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Min Amount:</strong> {selectedCoupon.minAmount || "N/A"}
                    <svg
                      className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </p>
                  <p className={`flex items-center mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Max Amount:</strong> {selectedCoupon.maxAmount || "N/A"}
                    <svg
                      className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </p>
                  <p className={`flex items-center ${isMobile ? 'text-sm' : ''}`}>
                    <strong className="mr-2">Selected Product:</strong> {getProductName(selectedCoupon.selectedProduct)}
                    {selectedCoupon.selectedProduct && allProducts && allProducts.length > 0 && getProductName(selectedCoupon.selectedProduct) !== "None" && (
                      <svg
                        className="w-4 h-4 text-[#FFC300] ml-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AllCoupons;