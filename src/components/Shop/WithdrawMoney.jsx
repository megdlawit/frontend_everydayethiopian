import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { RxCross1 } from "react-icons/rx";
import api from "../../utils/api";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { AiOutlineDelete } from "react-icons/ai";
import Toast from "../Toast"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WithdrawMoney = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankCountry: "",
    bankSwiftCode: null,
    bankAccountNumber: null,
    bankHolderName: "",
    bankAddress: "",
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
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawMethod = { ...bankInfo };
    setPaymentMethod(false);
    try {
      await api.put(
        `${server}/shop/update-payment-methods`,
        { withdrawMethod },
        { withCredentials: true }
      );
      showToast("success", "Withdraw Success", "Withdraw method added successfully!");
      dispatch(loadSeller());
      setBankInfo({
        bankName: "",
        bankCountry: "",
        bankSwiftCode: null,
        bankAccountNumber: null,
        bankHolderName: "",
        bankAddress: "",
      });
    } catch (error) {
      console.error(error.response?.data?.message || "Error adding withdraw method");
      showToast("error", "Withdraw Error", error.response?.data?.message || "Failed to add withdraw method");
    }
  };

  const deleteHandler = async () => {
    try {
      await axios.delete(`${server}/shop/delete-withdraw-method`, {
        withCredentials: true,
      });
      showToast("success", "Delete Success", "Withdraw method deleted successfully!");
      dispatch(loadSeller());
    } catch (error) {
      console.error(error.response?.data?.message || "Error deleting withdraw method");
      showToast("error", "Delete Error", error.response?.data?.message || "Failed to delete withdraw method");
    }
  };

  const error = () => {
    showToast("error", "Balance Error", "You don't have enough balance to withdraw!");
  };

  const withdrawHandler = async () => {
    const amount = parseFloat(withdrawAmount);
    const balance = parseFloat(availableBalance);
    if (amount < 50 || amount > balance) {
      showToast("error", "Amount Error", "You can't withdraw this amount!");
    } else {
      try {
        await axios.post(
          `${server}/withdraw/create-withdraw-request`,
          { amount },
          { withCredentials: true }
        );
        showToast("success", "Withdraw Success", "Withdraw money request is successful!");
        setWithdrawAmount(50);
      } catch (error) {
        console.error(error.response?.data?.message || "Error processing withdrawal");
        showToast("error", "Withdraw Error", error.response?.data?.message || "Failed to process withdrawal");
      }
    }
  };

  const availableBalance =
    seller && typeof seller.availableBalance === "number"
      ? seller.availableBalance.toFixed(2)
      : "0.00";

  return (
    <div className="w-full min-h-[90vh] p-4 sm:p-6 bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl bg-gradient-to-br from-[#1C3B3E] via-[#1C3B3E]/100 to-[#1C3B3E]/70 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-xs font-mono tracking-widest opacity-70">
          **** **** **** {seller?.withdrawMethod?.bankAccountNumber?.slice(-4) || "1234"}
        </div>
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-7 sm:w-12 sm:h-8 bg-gradient-to-br from-[#CC9A00] to-[#FFD700] rounded-md shadow-inner"></div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="pr-2">
            <h6 className="text-xs sm:text-sm font-medium">{seller?.withdrawMethod?.bankName || "Bank Name"}</h6> 
            <p className="text-xs opacity-80 truncate">
              Account Name: {seller?.withdrawMethod?.bankHolderName?.slice(0, 10) +
                (seller?.withdrawMethod?.bankHolderName?.length > 10 ? "..." : "") || "Holder Name"}
            </p>
            <p className="text-xs opacity-80 truncate">
              Account Number: {seller?.withdrawMethod?.bankAccountNumber || "10030244.48"}
            </p>
          </div>
          <div className="w-16 h-10 sm:w-20 sm:h-12 bg-[#CC9A00] rounded-lg flex items-center justify-center opacity-80 flex-shrink-0"></div>
        </div>
        <div className="text-center pt-4">
          <h5 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
            Available Balance <span className="text-[#FFFFFF] block mt-1 sm:mt-2">{availableBalance} Br</span>
          </h5>
          <button
            className="bg-[#CC9A00] text-[#FFFFFF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FFD700] transition-colors duration-300 text-sm sm:text-base"
            onClick={() => (parseFloat(availableBalance) < 50 ? error() : setOpen(true))}
          >
            Withdraw
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen p-2 sm:p-4">
          <div className={`bg-white ${window.innerWidth < 640 ? 'w-full h-[98vh] mt-2 rounded-2xl' : 'w-full max-w-2xl h-[98vh] mt-2'} overflow-y-auto relative shadow-2xl p-4 sm:p-6`}>
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 text-[#1C3B3E] hover:bg-[#CC9A00] hover:text-white transition"
              onClick={() => {
                setOpen(false);
                setPaymentMethod(false);
              }}
            >
              <RxCross1 size={window.innerWidth < 640 ? 18 : 24} />
            </button>

            {paymentMethod ? (
              <div className="flex flex-col items-center justify-center h-[calc(85vh-80px)] sm:h-[calc(85vh-100px)] pt-4 sm:pt-0">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-['Quesha'] text-[#1C3B3E] text-center mb-6 sm:mb-8">
                  Add New Withdraw Method
                </h3>
                <form onSubmit={handleSubmit} className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6 px-2 sm:px-0">
                  <div>
                    <label className="block text-sm font-medium text-[#1C3B3E]">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      className="mt-2 w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm sm:text-base"
                    >
                      <option value="">Select a bank</option>
                      <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</option>
                      <option value="Dashen Bank">Dashen Bank</option>
                      <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                      <option value="ZEMEN Bank">ZEMEN Bank</option>
                      <option value="Awash Bank">Awash Bank</option>
                      <option value="Abay Bank">Abay Bank</option>
                      <option value="Global Bank">Global Bank</option>
                      <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1C3B3E]">
                      Bank Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={bankInfo.bankAccountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankAccountNumber: e.target.value })}
                      placeholder="Enter your bank account number"
                      className="mt-2 w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C3B3E]">
                      Bank Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankInfo.bankHolderName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankHolderName: e.target.value })}
                      placeholder="Enter your bank holder name"
                      className="mt-2 w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm sm:text-base"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-1/2 mx-auto bg-[#CC9A00] text-[#FFFFFF] py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FFD700] transition-colors duration-300 text-sm sm:text-base"
                  >
                    Add Withdraw Method
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(85vh-80px)] sm:h-[calc(85vh-100px)] pt-4 sm:pt-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-['Quesha'] text-[#1C3B3E] text-center mb-6 sm:mb-8">
                  Available Withdraw Methods
                </h3>
                {seller?.withdrawMethod ? (
                  <div className="w-full max-w-md sm:max-w-lg space-y-4 sm:space-y-6 px-2 sm:px-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#1C3B3E]/10 p-3 sm:p-4 rounded-lg">
                      <div className="flex-1">
                        <p className="text-[#1C3B3E] text-sm sm:text-base">
                          Account Number:{" "}
                          <span className="font-medium">
                            {"*".repeat(seller?.withdrawMethod.bankAccountNumber.length - 3) +
                              seller?.withdrawMethod.bankAccountNumber.slice(-3)}
                          </span>
                        </p>
                        <p className="text-[#1C3B3E] text-sm sm:text-base">
                          Bank Name: <span className="font-medium">{seller?.withdrawMethod.bankName}</span>
                        </p>
                      </div>
                      <AiOutlineDelete
                        size={window.innerWidth < 640 ? 20 : 24}
                        className="cursor-pointer text-red-500 hover:text-red-600 mt-2 sm:mt-0 self-end sm:self-center"
                        onClick={deleteHandler}
                      />
                    </div>
                    <p className="text-[#1C3B3E] text-sm sm:text-base">
                      Available Balance: <span className="font-medium text-[#CC9A00]">{availableBalance} Br</span>
                    </p>
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <input
                        type="number"
                        placeholder="Amount..."
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full sm:w-32 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#CC9A00] text-[#1C3B3E] text-sm sm:text-base"
                      />
                      <button
                        className="bg-[#CC9A00] text-[#FFFFFF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FFD700] transition-colors duration-300 w-full sm:w-auto text-sm sm:text-base"
                        onClick={withdrawHandler}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full max-w-md sm:max-w-lg px-2 sm:px-0">
                    <p className="text-base sm:text-lg text-[#1C3B3E] mb-4 sm:mb-6">
                      No Withdraw Methods Available
                    </p>
                    <button
                      className="bg-[#CC9A00] text-[#FFFFFF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FFD700] transition-colors duration-300 text-sm sm:text-base"
                      onClick={() => setPaymentMethod(true)}
                    >
                      Add New Method
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
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

export default WithdrawMoney;