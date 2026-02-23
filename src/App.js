import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
  Shop
} from "./routes/Routes.js";

import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  PremiumShopPreview,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,

  ShopPreviewWrapper,
  ShopCreateProductVideo,
  ProfileAllProducts,
  ShopProfileDataEdit,
  ShopAllVideo,
} from "./routes/ShopRoutes";
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
  AdminDashboardAdvertizment,
  AdminRefundOrders,
  ShopInboxPage,
   
} from "./routes/AdminRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store from "./redux/store";
import { loadSeller, loadUser } from "./redux/actions/user";
import { loadDeliveryUser } from "./redux/actions/delivery";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import { ShopHomePage } from "./ShopRoutes.js";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import DeliveryProtectedRoute from "./routes/DeliveryProtectedRoute";
import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import api from "./utils/api";
import api from "./utils/api";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import TermsPage from "./pages/Terms.jsx";
import AboutPage from "./pages/About.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartDetail  from "./pages/CartDetail.jsx"
import CartDetails from "./pages/CartDetail.jsx";
import SellerApprovalPending from "./components/Shop/SellerApprovalPending.jsx";
import Premiumweb from "./components/Shop/Premiumweb/Premiumweb.jsx";
import PremiumEdit from "./components/Shop/Premiumweb/PremiumEdit.jsx";
import Premium from "./components/Shop/Premiumweb/Premium.jsx";
import AdminDashboardApproval from "./pages/AdminDashboardApproval.jsx"
import { useSelector } from "react-redux";
import DeliveryActivation from "./components/DeliveryActivation";
import DeliveryReactivate from "./components/DeliveryReactivate.jsx";
import DeliveryDashboardPage from "./pages/Delivery/DeliveryDashboardPage"; // Import DeliveryDashboardPage
import OrdersPage from "./pages/Delivery/OrdersPage";
import SettingsPage from "./pages/Delivery/SettingsPage";
import AdminUnapprovedDeliveries from "./pages/AdminUnapprovedDeliveries.jsx"; // Import the component
import AdminAllVideoProducts from "./pages/AdminAllVideoProducts.jsx";
import DeliveryApprovalPending from "./pages/Delivery/DeliveryApprovalPending";
import Plan from "./components/Plan.jsx"; 
import VideoShoppingPage from "./pages/VideoShoppingPage"
import ShopProfileDataEditWrapper from "./pages/Shop/ShopProfileDataEditWrapper";
import OffPercentCard from "./components/Events/OffPercentCard.jsx";
import GrowthPlanMain from "./components/Shop/Premiumweb/GrowthPlan/GrowthPlanMain.jsx"
import ProPlan from "./components/Shop/Premiumweb/ProPlan/ProPlanMain.jsx";
import GrowthPlanAllProducts from "./components/Shop/Premiumweb/GrowthPlan/GrowthPlanAllProducts";
import GrowthPlanEditWrapper from "./pages/Shop/GrowthPlanEditWrapper";
import ProPlanEdit from "./components/Shop/Premiumweb/ProPlan/ProPlanEdit.jsx"
import ProPlanAllProductsPage from './components/Shop/Premiumweb/ProPlan/ProPlanAllProductsPage';
import EventsDetail from "./components/Events/EventsDetail.jsx";
import Loader from "./components/Layout/Loader.jsx"
import VideoProductDetail from "./components/Products/VideoProductDetail.jsx";
import VideoProductDetailsPage from "./pages/VideoProductDetailsPage";
import Toast from "./components/Toast";
import NotFound from "./components/NotFound.jsx";
import MagazineArticle from "./pages/MagazineArticle.jsx";

const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("");
  const { isAuthenticated, user } = useSelector((state) => state.user); // Retrieve user state
  const { isSeller } = useSelector((state) => state.seller); // Retrieve isSeller from seller state
  const { isDelivery } = useSelector((state) => state.delivery); // Retrieve isDelivery from delivery state
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
  async function getStripeApikey() {
    try {
      const { data } = await api.get(`/payment/stripeapikey`);
      setStripeApiKey(data?.stripeApikey || "");
    } catch (err) {
      console.error("Failed to load Stripe API key:", err);
    }
  }

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(loadDeliveryUser());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApikey();
  }, []);

  // Memoize Stripe load promise outside of JSX to satisfy hooks rules
  const stripePromise = React.useMemo(() => (stripeApikey ? loadStripe(stripeApikey) : null), [stripeApikey]);

  return (
    
    <BrowserRouter>
      {stripeApikey && (
        <Elements stripe={stripePromise}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )}
      <Routes>
        <Route
          path="/"
          element={
            isSeller || isAuthenticated || isDelivery
              ? <Shop />
              : <HomePage />
          }
        />
        <Route
          path="/delivery/dashboard"
          element={
            <DeliveryProtectedRoute>
              <DeliveryDashboardPage />
            </DeliveryProtectedRoute>
          }
        />
         <Route path="/loader" element={< Loader/>} />
        <Route
          path="/delivery/orders"
          element={
            <DeliveryProtectedRoute>
              <OrdersPage />
            </DeliveryProtectedRoute>
          }
        />
        <Route
          path="/delivery/settings"
          element={
            <DeliveryProtectedRoute>
              <SettingsPage />
            </DeliveryProtectedRoute>
          }
        />
        <Route path="/delivery/approval-pending" element={<DeliveryApprovalPending />} />
        <Route path="/shop" element={<Shop />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
         <Route path="/VideoShoppingPage" element={<VideoShoppingPage />} />
        <Route
          path="/activation/:activation_token"
          element={<ActivationPage />}
        />
        <Route path="/delivery/reactivate/:token" element={<DeliveryReactivate />} />
        <Route
          path="/seller/activation/:activation_token"
          element={<SellerActivationPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />   
        <Route path="/cart-details" element={<CartDetails />} /> 
         <Route path="/OffPercentCard" element={<OffPercentCard />} /> 
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard-categories" element={
          <ProtectedRoute>
          <CategoryPage />
          </ProtectedRoute>
          } />     
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <UserInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          }
        />
        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
        <Route path="/shop/proplan/:id" element={<GrowthPlanMain />} />
        <Route path="/shop/growthplan/:id" element={<ProPlan />} />
        <Route path="/shop/:id/all-products" element={<GrowthPlanAllProducts />} />
         {/* <Route path="/shop/GrowthPlan" element={<GrowthPlanMain />} /> */}
        {/* shop Routes */}
        <Route path="/shop-create" element={<ShopCreatePage />} />
        <Route path="/shop-login" element={<ShopLoginPage />} />
        <Route
          path="/shop/:id"
          element={
            <SellerProtectedRoute>
              <ShopHomePage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <SellerProtectedRoute>
              <ShopSettingsPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <ShopDashboardPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <SellerProtectedRoute>
              <ShopCreateProduct />
            </SellerProtectedRoute>
          }
        />
         <Route
          path="/dashboard-create-product"
          element={
            <SellerProtectedRoute>
              <ShopCreateProduct />
            </SellerProtectedRoute>
          }
        />
            <Route
          path="/dashboard-withdraw-money"
          element={
            <SellerProtectedRoute>
              <ShopWithDrawMoneyPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-orders"
          element={
            <SellerProtectedRoute>
              <ShopAllOrders />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-refunds"
          element={
            <SellerProtectedRoute>
              <ShopAllRefunds />
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <SellerProtectedRoute>
              <ShopOrderDetails />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-allvideo"
          element={
            <SellerProtectedRoute>
              <ShopAllVideo />
            </SellerProtectedRoute>
          }
        />
         <Route
          path="/dashboard-products"
          element={
            <SellerProtectedRoute>
              <ShopAllProducts />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-event"
          element={
            <SellerProtectedRoute>
              <ShopCreateEvents />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-events"
          element={
            <SellerProtectedRoute>
              <ShopAllEvents />
            </SellerProtectedRoute>
          }
        />
      <Route
  path="/shop/edit/:id"
  element={
    <SellerProtectedRoute>
      <ShopProfileDataEditWrapper />
    </SellerProtectedRoute>
  }
/>
<Route
  path="/shop/growthplan/edit/:id"
  element={
    <SellerProtectedRoute>
      <ProPlanEdit />
    </SellerProtectedRoute>
  }
/>

        <Route
          path="/dashboard-coupouns"
          element={
            <SellerProtectedRoute>
              <ShopAllCoupouns />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/ShopCreateProductVideo"
          element={
            <SellerProtectedRoute>
              <ShopCreateProductVideo />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-messages"
          element={
            <ProtectedAdminRoute>
              <ShopInboxPage />
            </ProtectedAdminRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardOrders />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardProducts />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-events"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardEvents />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-withdraw-request"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardWithdraw />
            </ProtectedAdminRoute>
          }
        />
       <Route
          path="/admin/pending-shops"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardApproval />
            </ProtectedAdminRoute>
          }
        />
          <Route
          path="/admin/AdminDashboardAdvertizment"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardAdvertizment />
            </ProtectedAdminRoute>
          }
        />
             <Route
          path="/admin/admin-refund-orders"
          element={
            <ProtectedAdminRoute>
              <AdminRefundOrders />
            </ProtectedAdminRoute>
          }
        />
       
          <Route
          path="/admin/admin-all-video-products"
          element={
            <ProtectedAdminRoute>
              <AdminAllVideoProducts />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/unapproved-deliveries"
          element={
            <ProtectedAdminRoute>
              <AdminUnapprovedDeliveries />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
        <Route path="/SellerApprovalPending" element={<SellerApprovalPending />} />
        <Route path="/Premiumweb" element={<Premiumweb />} />
        {/* <Route path="/PremiumEdit" element={<PremiumEdit />} /> */}
        {/* <Route path="/shop/edit/:id" element={<PremiumEdit />} /> */}
        <Route path="/Premium" element={<Premium />} />
        <Route path="/delivery/activation/:token" element={<DeliveryActivation />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/shop/profile/:id/all-products" element={<ProfileAllProducts />} />
        <Route
          path="/shop/proplan/edit/:id"
          element={
            <SellerProtectedRoute>
              <GrowthPlanEditWrapper />
            </SellerProtectedRoute>
          }
        />
        <Route path="/proplan/:id/all-products" element={<ProPlanAllProductsPage />} />
        <Route path="/event/:id" element={<EventsDetail />} />
        <Route path="/video-product/:id" element={<VideoProductDetail />} />
        <Route path="/video-product-page/:id" element={<VideoProductDetailsPage />} />
        <Route path="/magazine/:slug" element={<MagazineArticle />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
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
  
    </BrowserRouter>
  );
};

export default App;
