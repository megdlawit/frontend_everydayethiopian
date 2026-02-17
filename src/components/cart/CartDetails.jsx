import React from "react";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart, removeFromCart } from "../../redux/actions/cart";
import styles from "../../styles/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import { backend_url } from "../../server";

const CartDetails = () => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

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

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const quantityChangeHandler = (data) => {
    if (data.qty > data.stock) {
      showToast("error", "Stock Limit", "Product stock limited!");
      return;
    }
    if (data.qty < 1) return;
    dispatch(addTocart(data));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  // Helper function to get full media URL
  const getMediaUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${backend_url}${url}`;
  };

  const renderMedia = (item, className) => {
    const videoSrc = item?.video ? getMediaUrl(item.video) : null;
    const hasVideo = !!videoSrc;
    const posterSrc = item?.images && item.images.length > 0 ? getMediaUrl(item.images[0].url) : null;

    if (hasVideo) {
      return (
        <video
          src={videoSrc}
          poster={posterSrc}
          className={className}
          muted
          loop
          playsInline
          preload="metadata"
          onMouseEnter={(e) => {
            e.target.play().catch((error) => {
              console.error("Video play failed:", error);
            });
          }}
          onMouseLeave={(e) => {
            e.target.pause();
            e.target.currentTime = 0; // Reset to start for next hover
          }}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          src={posterSrc || "/placeholder-image.jpg"}
          alt="Product"
          className={className}
        />
      );
    }
  };

  return (
    <div className="w-full min-h-screen shadow-md p-4 md:p-20 font-[Avenir_Lt_Std]">
      <h1 className="text-4xl md:text-6xl text-center mb-6 font-[Quesha]">Cart</h1>
      
      {/* Mobile View */}
      <div className="block md:hidden">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    {renderMedia(item, "w-16 h-16 object-cover rounded-md")}
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                      <p className="text-[#FAC50C] font-medium mt-1">{item.discountPrice} Birr</p>
                    </div>
                  </div>
                  <button
                    className="text-[#D10101] p-1"
                    onClick={() => removeFromCartHandler(item)}
                  >
                    <RxCross1 size={18} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      className="border border-[#FAC50C] rounded-full w-6 h-6 flex justify-center items-center text-[#FAC50C] hover:bg-[#FAC50C] hover:text-white transition duration-300"
                      onClick={() => quantityChangeHandler({ ...item, qty: item.qty - 1 })}
                      disabled={item.qty <= 1}
                    >
                      <HiOutlineMinus size={12} />
                    </button>
                    <span className="px-3 font-medium">{item.qty}</span>
                    <button
                      className="border border-[#FAC50C] rounded-full w-6 h-6 flex justify-center items-center text-[#FAC50C] hover:bg-[#FAC50C] hover:text-white transition duration-300"
                      onClick={() => quantityChangeHandler({ ...item, qty: item.qty + 1 })}
                      disabled={item.qty >= item.stock}
                      title={item.qty >= item.stock ? "Product stock limited!" : ""}
                    >
                      <HiPlus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Subtotal</p>
                    <p className="font-semibold">{item.qty * item.discountPrice} Birr</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop View - Unchanged */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Product</th>
              <th className="text-center p-4">Quantity</th>
              <th className="text-center p-4">Price</th>
              <th className="text-center p-4">Subtotal</th>
              <th className="text-center p-4">Remove</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="flex items-center p-4">
                  {renderMedia(item, "w-24 h-24 object-cover rounded-md")}
                  <div className="ml-4">
                    <p className="font-semibold">{item.name}</p>
                  </div>
                </td>
                <td className="text-center">
                  <div className="flex justify-center items-center">
                    <button
                      className="border border-[#FAC50C] rounded-full w-5 h-5 flex justify-center items-center text-[#FAC50C] hover:bg-[#FAC50C] hover:text-white transition duration-300"
                      onClick={() => quantityChangeHandler({ ...item, qty: item.qty - 1 })}
                      disabled={item.qty <= 1}
                    >
                      <HiOutlineMinus size={10} />
                    </button>
                    <span className="px-4">{item.qty}</span>
                    <button
                      className="border border-[#FAC50C] rounded-full w-5 h-5 flex justify-center items-center text-[#FAC50C] hover:bg-[#FAC50C] hover:text-white transition duration-300"
                      onClick={() => quantityChangeHandler({ ...item, qty: item.qty + 1 })}
                      disabled={item.qty >= item.stock}
                      title={item.qty >= item.stock ? "Product stock limited!" : ""}
                    >
                      <HiPlus size={10} />
                    </button>
                  </div>
                </td>
                <td className="text-center">{item.discountPrice} Birr</td>
                <td className="text-center">{item.qty * item.discountPrice} Birr</td>
                <td className="text-center">
                  <button
                    className="bg-white text-[#D10101] p-2 rounded-full hover:bg-white transition duration-300"
                    onClick={() => removeFromCartHandler(item)}
                  >
                    <RxCross1 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions - Responsive */}
      <div className="flex flex-col md:flex-row justify-between mt-6 space-y-4 md:space-y-0">
        <Link to="/products" className="w-full md:w-auto">
          <button className={`${styles.button} w-full md:w-auto text-[#FAC50C] bg-[#FFFFFF] border border-[#FAC50C] p-4 hover:bg-[#fff4cc]`}>
            Continue Shopping
          </button>
        </Link>
        
        <div className="text-center md:text-right w-full md:w-auto">
          <p className="text-xl py-2 px-6 font-semibold">Total: {totalPrice} Birr</p>
          <Link to="/checkout" className="w-full md:w-auto block">
            <button className={`${styles.button} w-full md:w-auto bg-[#FAC50C] text-white py-2 px-6 rounded-full mt-4 hover:bg-[#e6b700] transition duration-300`}>
              Checkout
            </button>
          </Link>
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
          top: "80px",
        }}
      />
    </div>
  );
};

export default CartDetails;