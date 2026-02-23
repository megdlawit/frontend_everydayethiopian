import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../styles/styles";
import {
  CardNumberElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../../utils/api";
import { server } from "../../server";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import { RxCross1 } from "react-icons/rx";
import telebirrLogo from "../../Assests/images/tele.jpg";
import cbeLogo from "../../Assests/images/cbe.png";
import { clearCart } from "../Checkout/Checkout"; 

const Payment = () => {
  const [orderData, setOrderData] = useState(null);
  const [open, setOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

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
    const orderDataStr = localStorage.getItem("latestOrder");
    if (orderDataStr) {
      const orderData = JSON.parse(orderDataStr);
      // Ensure numbers are parsed correctly
      orderData.totalPrice = parseFloat(orderData.totalPrice);
      orderData.subTotalPrice = parseFloat(orderData.subTotalPrice || 0);
      orderData.shipping = parseFloat(orderData.shipping || 0);
      orderData.discountPrice = parseFloat(orderData.discountPrice || 0);
      setOrderData(orderData);
    } else {
      showToast("error", "Order Error", "No order data found. Please go back and try again.");
      navigate("/checkout");
    }
  }, [navigate]);

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user?._id || null,
    totalPrice: orderData?.totalPrice,
    couponCode: orderData?.couponCode,
    couponData: orderData?.couponData,
    discountPrice: orderData?.discountPrice,
    subTotalPrice: orderData?.subTotalPrice,
    shipping: orderData?.shipping,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async function (details) {
      const { payer } = details;
      if (payer) {
        await paypalPaymentHandler(payer);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    };

    const fullOrder = { ...order, paymentInfo: { id: paymentInfo.payer_id, status: "succeeded", type: "Paypal" } };

    try {
      setIsProcessingPayment(true);
      const res = await axios.post(`${server}/order/create-order`, fullOrder, config);
      if (res.data.success) {
        setOpen(false);
        navigate("/order/success");
        showToast("success", "Payment Success", "Order successful!");
        await dispatch(clearCart());
        localStorage.removeItem("latestOrder");
      } else {
        showToast("error", "Order Error", res.data.message || "Failed to create order.");
        // Attempt refund if payment succeeded but order failed
        // await handleRefund(paymentInfo.id, order.totalPrice);
      }
    } catch (error) {
      showToast("error", "Order Error", error.response?.data?.message || "Failed to create order.");
      // Attempt refund
      // await handleRefund(paymentInfo.id, order.totalPrice);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const paymentData = {
    amount: Math.round(orderData?.totalPrice * 100),
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return showToast("error", "Stripe Error", "Stripe not loaded");

    try {
      setIsProcessingPayment(true);
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post(`${server}/payment/process`, paymentData, config);
      const client_secret = data.client_secret;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name: user?.name },
        },
      });

      if (result.error) {
        showToast("error", "Payment Error", result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        const fullOrder = { ...order, paymentInfo: { id: result.paymentIntent.id, status: result.paymentIntent.status, type: "Credit Card" } };
        const res = await axios.post(`${server}/order/create-order`, fullOrder, config);
        if (res.data.success) {
          setOpen(false);
          navigate("/order/success");
          showToast("success", "Payment Success", "Order successful!");
          await dispatch(clearCart());
          localStorage.removeItem("latestOrder");
        } else {
          showToast("error", "Order Error", res.data.message || "Failed to create order.");
          // Refund
          // await stripe.refunds.create({ payment_intent: result.paymentIntent.id });
        }
      }
    } catch (error) {
      showToast("error", "Payment Error", error.response?.data?.message || "Payment failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const cashOnDeliveryHandler = async () => {
    const config = {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    };

    const fullOrder = { ...order, paymentInfo: { type: "Cash On Delivery", status: "Pending" } };

    try {
      setIsProcessingPayment(true);
      const res = await axios.post(`${server}/order/create-order`, fullOrder, config);
      if (res.data.success) {
        setOpen(false);
        navigate("/order/success");
        showToast("success", "Payment Success", "Order successful!");
        await dispatch(clearCart());
        localStorage.removeItem("latestOrder");
      } else {
        showToast("error", "Order Error", res.data.message || "Failed to create order.");
      }
    } catch (error) {
      showToast("error", "Order Error", error.response?.data?.message || "Failed to create order.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMobilePayment = async (bankType) => {
    // Example for Telebirr - replace with actual API
    const paymentUrl = `https://api.telebirr.com/pay?amount=${orderData.totalPrice}&orderId=${Date.now()}&callback=${encodeURIComponent(window.location.origin + '/payment/callback')}&userId=${user._id}`;
    window.location.href = paymentUrl;
    // On callback, verify and call create-order
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            isProcessingPayment={isProcessingPayment}
            onApprove={onApprove}
            handleMobilePayment={handleMobilePayment}
            paymentHandler={paymentHandler}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
            showToast={showToast}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>

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
    </div>
  );
};

const PaymentInfo = ({
  user,
  open,
  setOpen,
  isProcessingPayment,
  onApprove,
  handleMobilePayment,
  paymentHandler,
  cashOnDeliveryHandler,
  showToast,
}) => {
  const [select, setSelect] = useState("");

  const handleMobileBankingOption = (option) => {
    if (select === option) return;
    setSelect(option);
  };

  const handleConfirm = () => {
    if (["cbe", "telebirr", "other"].includes(select)) {
      handleMobilePayment(select);
    } else if (select === "cod") {
      cashOnDeliveryHandler();
    }
  };

  return (
    <div className="w-full p-5">
      <h5 className="text-[16px] font-[500] mb-4 text-gray-600">
        Choose Payment Information
      </h5>

      <div className="border border-gray-300 rounded-sm p-6 space-y-6">
        {/* Mobile Banking */}
        <div>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setSelect(select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other" ? "" : "mobile")}
          >
            <div
              className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center ${
                select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other"
                  ? "border-[#0f2c2f] bg-[#0f2c2f]"
                  : "border-gray-400 bg-gray-200"
              }`}
            >
              {(select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other") && (
                <div className="w-[10px] h-[10px] bg-white rounded-full" />
              )}
            </div>
            <h4 className="text-[15px] font-[500] text-gray-700">Mobile Banking</h4>
          </div>

          <div className="flex space-x-3 mt-3">
            <button
              className={`flex items-center justify-center px-3 py-2 rounded-md border w-1/3 transition ${
                select === "cbe"
                  ? "bg-[#F7E3F6] text-[#95298E] border-[#95298E]"
                  : select.includes("mobile") || select === "telebirr" || select === "other"
                  ? "bg-[#F7E3F6] text-[#95298E] opacity-50"
                  : "bg-gray-200 text-gray-600 border-gray-400"
              }`}
              onClick={() => handleMobileBankingOption("cbe")}
              disabled={!(select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other")}
            >
              <img
                src={cbeLogo}
                alt="CBE"
                className={`w-6 h-6 mr-2 ${select === "cbe" ? "" : "grayscale opacity-50"}`}
              />
              <span className="text-[14px]">CBE</span>
            </button>

            <button
              className={`flex items-center justify-center px-3 py-2 rounded-md border w-1/3 transition ${
                select === "telebirr"
                  ? "bg-[#DBF1FF] text-[#0072BB] border-[#0072BB]"
                  : select.includes("mobile") || select === "cbe" || select === "other"
                  ? "bg-[#DBF1FF] text-[#0072BB] opacity-50"
                  : "bg-gray-200 text-gray-600 border-gray-400"
              }`}
              onClick={() => handleMobileBankingOption("telebirr")}
              disabled={!(select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other")}
            >
              <img
                src={telebirrLogo}
                alt="Telebirr"
                className={`w-6 h-6 mr-2 ${select === "telebirr" ? "" : "grayscale opacity-50"}`}
              />
              <span className="text-[14px]">Telebirr</span>
            </button>

            <button
              className={`flex items-center justify-center px-3 py-2 rounded-md border w-1/3 transition ${
                select === "other"
                  ? "bg-[#E4F1F2] text-[#263238] border-[#263238]"
                  : select.includes("mobile") || select === "cbe" || select === "telebirr"
                  ? "bg-[#E4F1F2] text-[#263238] opacity-50"
                  : "bg-gray-200 text-gray-600 border-gray-400"
              }`}
              onClick={() => handleMobileBankingOption("other")}
              disabled={!(select.includes("mobile") || select === "cbe" || select === "telebirr" || select === "other")}
            >
              <span className={`text-[14px] ${select === "other" ? "" : "text-gray-600"}`}>
                Other
              </span>
            </button>
          </div>
        </div>

        {/* Cash on Delivery */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setSelect(select === "cod" ? "" : "cod")}
        >
          <div
            className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center ${
              select === "cod"
                ? "border-[#0f2c2f] bg-[#0f2c2f]"
                : "border-gray-400 bg-gray-200"
            }`}
          >
            {select === "cod" && <div className="w-[10px] h-[10px] bg-white rounded-full" />}
          </div>
          <h4 className={`text-[15px] font-[500] ${select === "cod" ? "text-black" : "text-gray-700"}`}>
            Cash on delivery
          </h4>
        </div>
      </div>

      {select && (
        <div className="mt-6 flex justify-center">
          <button
            className="bg-[#CC9A00] text-white h-[45px] rounded-full w-[40%] text-[18px] font-[600] hover:bg-[#A77A00] transition disabled:opacity-50"
            onClick={handleConfirm}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? "Processing..." : (select === "cod" ? "Confirm" : "Pay Now")}
          </button>
          {open && (
            <div className="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
              <div className="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                <div className="w-full flex justify-end p-3">
                  <RxCross1
                    size={30}
                    className="cursor-pointer absolute top-3 right-3"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <p>{isProcessingPayment ? "Processing payment..." : "Complete payment on next page..."}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CartData = ({ orderData }) => {
  return (
    <div className="w-full bg-[radial-gradient(circle_at_center,#41666A_0%,#1C3B3E_100%)] text-white p-8 rounded-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Subtotal</h3>
        <h5 className="text-[18px] font-light text-white">{orderData?.subTotalPrice ? `${orderData.subTotalPrice.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Shipping</h3>
        <h5 className="text-[18px] font-light text-white">{orderData?.shipping ? `${orderData.shipping.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-4">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Discount</h3>
        <h5 className="text-[18px] font-light text-white">{orderData?.discountPrice ? `${orderData.discountPrice.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
      <div className="flex justify-between mb-6 border-t pt-2">
        <h3 className="text-[16px] font-light text-[#B7B7B7]">Total</h3>
        <h5 className="text-[18px] font-light text-white">{orderData?.totalPrice ? `${orderData.totalPrice.toFixed(2)} Birr` : "0 Birr"}</h5>
      </div>
    </div>
  );
};

export default Payment;