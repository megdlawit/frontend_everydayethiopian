import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import back2Img from "../../../Assests/images/back2.png";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Toast from "../../../components/Toast";
import { backend_url } from "../../../server";

const BestDeals = () => {
  const { allProducts } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const dispatch = useDispatch();

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return "/Uploads/placeholder-image.jpg";
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

  const bestDeals = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return [...allProducts]
      .filter((p) => p.status === "Active" && p.images?.length > 0 && !p.video && !p.name.startsWith("Sample Product") && p.name !== "Special Discount Product")
      .sort((a, b) => b.sold_out - a.sold_out)
      .slice(0, 9);
  }, [allProducts]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + itemsPerView) % (bestDeals.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [bestDeals, itemsPerView]);

  const visibleCards = Array.from({ length: itemsPerView }, (_, i) => 
    bestDeals[(currentIndex + i) % (bestDeals.length || 1)]
  );

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - itemsPerView < 0 ? bestDeals.length - itemsPerView : prevIndex - itemsPerView;
      return Math.max(0, newIndex);
    });
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerView) % (bestDeals.length || 1));
  };

  const handleWishlistToggle = (product) => {
    if (wishlist?.some((i) => i._id === product._id)) {
      dispatch(removeFromWishlist(product));
      showToast("info", "Info", "Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      showToast("success", "Success", "Added to wishlist");
    }
  };

  const addToCartHandler = (product) => {
    const isItemExists = cart?.some((i) => i._id === product._id);
    if (isItemExists) {
      showToast("error", "Error", "Item already in cart!");
      return;
    }
    if (product.stock < 1) {
      showToast("error", "Error", "Product stock limited!");
      return;
    }
    const cartData = {
      _id: product._id,
      name: product.name,
      qty: 1,
      discountPrice: product.discountPrice,
      shopId: product.shopId?._id || product.shopId,
      images: product.images,
      stock: product.stock,
    };
    dispatch(addTocart(cartData));
    showToast("success", "Success", "Item added to cart successfully!");
    if (product.stock > 0 && product.stock <= 5) {
      showToast("info", "Info", `Only ${product.stock} items left in stock!`);
    }
  };

  return (
    <div className="best-deals-wrapper">
      {bestDeals.length > 0 && visibleCards.every(Boolean) ? (
        <div className="best-deals-container-wrapper">
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={handlePrevClick}
            disabled={bestDeals.length <= itemsPerView}
            title="Previous"
          >
            <FaChevronLeft size={18} color="#1B3B3E" />
          </button>
          <div className="best-deals-container">
            {visibleCards.map((product, index) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="best-deal-card-link"
              >
                <div
                  className={`best-deal-card ${index === Math.floor(itemsPerView / 2) ? 'center-card active' : ''}`}
                  style={{
                    backgroundImage: `url(${back2Img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  {product.images?.[0]?.url && (
                    <img
                      src={getImageUrl(product.images[0].url)}
                      alt={product.name}
                      className="best-deal-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/Uploads/placeholder-image.jpg";
                      }}
                    />
                  )}
                  <div
                    className="best-deal-hover"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "100px",
                      background:"#cc9900c2",
                      backdropFilter: "blur(2px)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: 0,
                      transition: "opacity 0.4s ease, transform 0.4s ease",
                      padding: "0.5rem 1rem",
                      pointerEvents: "none",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    <div className="hover-left" style={{ pointerEvents: "auto", textAlign: "left", flex: 1 }}>
                      <h2 style={{ fontSize: "1.6rem", margin: "0 0 8px 0", fontWeight: 500, color: "#FFF" }}>{product.name}</h2>
                      <p style={{ fontSize: "1rem", margin: 0, color: "#333", fontWeight: 400 }}>{product.discountPrice || product.price} ETB</p>
                    </div>
                    <div className="hover-right" style={{ display: "flex", gap: "1rem", pointerEvents: "auto" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlistToggle(product);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                        }}
                        title={wishlist?.some((i) => i._id === product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {wishlist?.some((i) => i._id === product._id) ? (
                          <FaHeart color="#D10101" size={22} />
                        ) : (
                          <FaHeart color="#ccc" size={22} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartHandler(product);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                        }}
                        title="Add to Cart"
                      >
                        <FaShoppingCart color="#FAC50C" size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={handleNextClick}
            disabled={bestDeals.length <= itemsPerView}
            title="Next"
          >
            <FaChevronRight size={18} color="#1B3B3E" />
          </button>
        </div>
      ) : (
        <div className="empty-state">No Best Deals Available</div>
      )}
      <h1 className="best-deals-title">Best Deals</h1>
      <style>
        {`
          .best-deals-wrapper {
            padding: 2rem;
            background: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            min-height: 100vh;
            position: relative;
          }

          .best-deals-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 55%;
            background-image: url('${back2Img}');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
            z-index: -1;
            pointer-events: none;
          }

          .best-deals-wrapper::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 45%;
            background: #0D4C4C;
            z-index: -1;
          }

          .best-deals-title {
            font-family: 'Quesha', serif;
            font-size: 4rem;
            color: #FFE180;
            margin-top: 1rem;
            margin-bottom: 0;
            background: none;
            box-shadow: none;
            padding: 0;
            order: 2;
          }

          .best-deals-container-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            max-width: 1200px;
          }

          .best-deals-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            padding: 60px 20px 20px;
            order: 1;
            overflow: visible;
            width: 100%;
          }

          @media (max-width: 1024px) and (min-width: 769px) {
            .best-deals-container {
              gap: 30px;
            }
          }

          @media (max-width: 768px) {
            .best-deals-container {
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              gap: 15px;
              padding: 40px 10px 20px;
              justify-content: flex-start;
            }

            .best-deal-card {
              scroll-snap-align: start;
              flex: 0 0 calc(100vw - 60px);
              max-width: calc(100vw - 60px);
              width: calc(100vw - 60px);
            }

            .carousel-arrow {
              display: none;
            }
          }

          @media (max-width: 480px) {
            .best-deals-wrapper {
              padding: 1rem;
            }

            .best-deals-title {
              font-size: 2.5rem;
            }

            .best-deals-container {
              gap: 10px;
              padding: 30px 5px 20px;
            }

            .best-deal-card {
              flex: 0 0 calc(100vw - 40px);
              max-width: calc(100vw - 40px);
              width: calc(100vw - 40px);
              height: 220px;
            }

            .center-card {
              width: calc(100vw - 40px);
              height: 220px;
            }

            .best-deal-hover {
              height: 80px;
              padding: 0.25rem 0.5rem;
            }

            .hover-left h2 {
              font-size: 1.2rem;
            }

            .hover-left p {
              font-size: 0.9rem;
            }

            .hover-right {
              gap: 0.5rem;
            }

            .hover-right button {
              svg {
                width: 18px;
                height: 18px;
              }
            }
          }

          .best-deal-card {
            position: relative;
            background: #fff;
            border-radius: 16px;
            width: 350px;
            height: 250px;
            overflow: visible;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            border: 4px solid transparent;
            flex-shrink: 0;
          }

          .center-card {
            width: 450px;
            height: 350px;
          }

          .active {
            transform: scale(1.08);
            border-color: #FFE180;
            z-index: 3;
          }

          .best-deal-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 12px;
          }

          .best-deal-hover {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: #cc9900c2;
            backdropFilter: "blur(2px)";
            display: flex;
            justify-content: space-between;
            align-items: center;
            opacity: 0;
            transition: opacity 0.4s ease, transform 0.4s ease;
            padding: 0.5rem 1rem;
            pointerEvents: "none";
            border-radius: 0 0 12px 12px;
            z-index: 10;
          }

          .best-deal-card:hover .best-deal-hover,
          .best-deal-card.center-card.active .best-deal-hover {
            opacity: 1 !important;
            pointer-events: auto;
            transform: translateY(0);
          }

          .hover-left {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            font-family: 'Quesha', serif;
            flex: 1;
          }

          .hover-left h2 {
            font-size: 1.5rem;
            margin: 0 0 8px 0;
            font-weight: 500;
            color: #FFF;
            text-align: left;
          }

          .hover-left p {
            font-size: 1rem;
            margin: 0;
            color: #333;
            font-weight: 400;
            text-align: left;
          }

          .hover-right {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .empty-state {
            text-align: center;
            color: #FFE180;
            font-size: 1.25rem;
            padding: 1rem;
          }

          .carousel-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(128, 128, 128, 0.11);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 4;
            transition: background 0.3s ease;
          }

          @media (max-width: 768px) {
            .carousel-arrow {
              display: none;
            }
          }

          .carousel-arrow:hover {
            background: rgba(100, 100, 100, 0.47);
          }

          .carousel-arrow:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .carousel-arrow-left {
            left: -60px;
          }

          .carousel-arrow-right {
            right: -60px;
          }

          @media (max-width: 1024px) {
            .carousel-arrow-left {
              left: -40px;
            }

            .carousel-arrow-right {
              right: -40px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BestDeals;