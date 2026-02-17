import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FaRegHeart } from "react-icons/fa";
import { BsCartPlus } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { backend_url } from "../../server";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addTocart(newData));
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-[9999] font-[Aviner Lt Std]">
      <div className="fixed top-0 right-0 h-full w-full sm:w-[80%] md:w-[60%] lg:w-[30%] bg-white flex flex-col overflow-y-scroll shadow-sm">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end fixed top-3 right-3">
              <RxCross1
                size={18}
                className="cursor-pointer absolute top-2 right-2 text-[#FFC300] hover:opacity-75 transition"
                onClick={() => setOpenWishlist(false)}
              />
            </div>
            <h5>Wishlist is empty!</h5>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center">
                <FaRegHeart size={30} className="text-[#FFC300]" />
                <h5 className="pl-2 text-[18px] font-[500]">
                  {wishlist.length} items
                </h5>
              </div>
              <RxCross1
                size={18}
                className="cursor-pointer text-[#FFC300] hover:opacity-75 transition"
                onClick={() => setOpenWishlist(false)}
              />
            </div>

            {/* Wishlist Items */}
            <div className="px-2 flex flex-col">
              {wishlist.slice().reverse().map((i, index) => (
                <WishlistSingle
                  key={index}
                  data={i}
                  addToCartHandler={addToCartHandler}
                  removeFromWishlistHandler={removeFromWishlistHandler}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WishlistSingle = ({
  data,
  addToCartHandler,
  removeFromWishlistHandler,
  index,
}) => {
  const [value] = useState(1);
  const totalPrice = data.discountPrice * value;

  const normalizeUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${backend_url}${url}`;
  };

  const videoSrc = normalizeUrl(data?.video);
  const hasVideo = !!videoSrc;
  const posterSrc =
    data?.images && data.images.length > 0
      ? normalizeUrl(data.images[0].url)
      : null;

  return (
    <div
      className={`relative border border-gray-300 border-[1px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center shadow-lg rounded-md mx-2 ${
        index !== 0 ? "mt-4" : ""
      }`}
    >
      {/* Close Icon */}
      <RxCross1
        className="absolute top-2 right-2 cursor-pointer text-[#D10101] hover:opacity-80 transition"
        size={18}
        onClick={() => removeFromWishlistHandler(data)}
      />

      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center">
        {hasVideo ? (
          <video
            src={videoSrc}
            poster={posterSrc}
            className="w-full sm:w-[120px] h-32 sm:h-[100px] object-cover rounded-[5px] mb-3 sm:mb-0 sm:mr-4"
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
              e.target.currentTime = 0; // Reset to start
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={posterSrc || "/placeholder-image.jpg"}
            alt="Product"
            className="w-full sm:w-[120px] h-32 sm:h-[100px] object-cover rounded-[5px] mb-3 sm:mb-0 sm:mr-4"
          />
        )}

        <div className="flex-1 w-full sm:w-auto flex flex-col space-y-2">
          <h1 className="text-[16px] font-[400] truncate">{data.name}</h1>
          <h4 className="font-[400] text-[13px] text-[#00000082]">
            {data.discountPrice} Birr X {value}
          </h4>
          <h4 className="font-[400] text-[15px] text-[#1e1e1e] mb-2">
            {totalPrice} Birr
          </h4>

          {/* Add to cart button */}
          <div>
            <button
              className="flex items-center justify-center space-x-2 bg-[#FFC300] hover:bg-[#e6b800] text-white px-4 py-1 rounded-full w-full sm:w-fit transition"
              onClick={() => addToCartHandler(data)}
            >
              <BsCartPlus size={16} />
              <span className="text-[14px] font-[500]">Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;