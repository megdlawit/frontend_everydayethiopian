import React, { useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Toast from "../../../components/Toast"; // Adjust the path to your Toast component as needed
import { addTocart } from "../../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";
import axios from "axios";
import { server, backend_url } from "../../../server";

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/uploads/placeholder-image.jpg";
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
    if (wishlist && wishlist.find((item) => item._id === data._id)) {
      setIsInWishlist(true);
    } else {
      setIsInWishlist(false);
    }
  }, [wishlist, data._id]);

  const handleMessageSubmit = async () => {
    if (!user) {
      showToast("error", "Error", "Please login to send a message");
      return;
    }

    if (!data?.shop?._id) {
      showToast("error", "Error", "Shop information not available");
      return;
    }

    try {
      // Create conversation with the seller
      const groupTitle = `product_${data._id}_${user._id}_${data.shop._id}`;
      const userId = user._id;
      const sellerId = data.shop._id;

      const res = await axios.post(
        `${server}/conversation/create-new-conversation`,
        { groupTitle, userId, sellerId },
        { withCredentials: true }
      );

      // Navigate to user inbox with the conversation
      navigate(`/inbox?${res.data.conversation._id}`);
    } catch (error) {
      // If conversation already exists, just navigate to inbox with seller ID
      if (error.response?.status === 400) {
        navigate(`/inbox?${data.shop._id}`);
      } else {
        showToast("error", "Error", error.response?.data?.message || "Failed to start conversation");
      }
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const incrementCount = () => {
    setCount(count + 1);
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((item) => item._id === id);
    if (isItemExists) {
      showToast("error", "Error", "Item already in cart!");
    } else {
      if (data.stock < count) {
        showToast("error", "Error", "Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        showToast("success", "Success", "Item added to cart successfully!");
      }
    }
  };

  const removeFromWishlistHandler = () => {
    setIsInWishlist(false);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = () => {
    setIsInWishlist(true);
    dispatch(addToWishlist(data));
  };

  const handleImageError = (e) => {
    e.target.src = "/uploads/placeholder-image.jpg"; // Provide a default fallback image
  };

  return (
    <div className="bg-[#fff]">
      {data ? (
        <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
          <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
            <RxCross1
              size={30}
              className="absolute right-3 top-3 z-50 cursor-pointer"
              onClick={() => setOpen(false)}
            />

            <div className="block w-full 800px:flex">
              <div className="w-full 800px:w-[50%]">
                <img
                  src={getImageUrl(data.images && data.images[0]?.url)}
                  alt="Product"
                  onError={handleImageError} // Fallback handling
                  className="w-full h-[170px] object-contain"
                />
                <div className="flex mt-4">
                  <Link to={(() => {
                    const template = data.shop?.template || 'basic';
                    if (template === 'growthplan') return `/shop/growthplan/${data.shop._id}`;
                    if (template === 'proplan') return `/shop/proplan/${data.shop._id}`;
                    return `/shop/preview/${data.shop._id}`;
                  })()} className="flex">
                    <img
                      src={getImageUrl(data.shop.logo)}
                      alt={`${data.shop.name} Logo`}
                      onError={handleImageError} // Fallback handling for logo
                      className="w-[50px] h-[50px] rounded-full mr-2"
                    />
                    <div>
                      <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                      <h5 className="pb-3 text-[15px]">{data.ratings} Ratings</h5>
                    </div>
                  </Link>
                </div>
                <div
                  className={`${styles.button} bg-[#000] mt-4 rounded-[4px] h-11`}
                  onClick={handleMessageSubmit}
                >
                  <span className="text-[#fff] flex items-center">
                    Send Message <AiOutlineMessage className="ml-1" />
                  </span>
                </div>
                <h5 className="text-[16px] text-[red] mt-5">
                  {data.stock < 1 ? "Sold out" : "In stock"}
                </h5>
              </div>

              <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                <h1 className={`${styles.productTitle} text-[20px]`}>{data.name}</h1>
                <p>{data.description}</p>

                {data.isPreorder && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-[#FFF5CC] text-[#CC9A00] px-2 py-1 rounded-full text-sm">Pre-order</span>
                    <span className="text-sm text-gray-600">{data.estimatedOrderDays ? `Estimated: ${data.estimatedOrderDays} day${data.estimatedOrderDays > 1 ? 's' : ''}` : (data.estimatedOrderDate ? `Estimated date: ${new Date(data.estimatedOrderDate).toLocaleDateString()}` : 'Estimated: TBA')}</span>
                  </div>
                )}

                <div className="flex pt-3">
                  <h4 className={`${styles.productDiscountPrice}`}>{data.discountPrice}$</h4>
                  <h3 className={`${styles.price}`}>{data.originalPrice ? data.originalPrice + "$" : null}</h3>
                </div>
                <div className="flex items-center mt-12 justify-between pr-3">
                  <div>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={decrementCount}
                    >
                      -
                    </button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                      {count}
                    </span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={incrementCount}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    {isInWishlist ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={removeFromWishlistHandler}
                        color="red"
                        title="Remove from wishlist"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={addToWishlistHandler}
                        title="Add to wishlist"
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.button} mt-6 rounded-[31px] h-11 flex items-center`}
                  onClick={() => addToCartHandler(data._id)}
                >
                  <span className="text-[#1E1E1E] flex items-center">
                    Add to cart <AiOutlineShoppingCart className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailsCard;