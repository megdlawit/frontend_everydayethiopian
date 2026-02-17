import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const SellerProtectedRoute = ({ children }) => {
  const { isLoading, isSeller, seller } = useSelector((state) => state.seller);
  const location = useLocation();

  if (isLoading === true) {
    return <Loader />;
  } else {
    if (!isSeller) {
      return <Navigate to={`/login`} replace />;
    }

    // Define routes that are accessible to pending sellers (before admin approval)
    const allowedRoutesForPending = [
      '/plan',
      '/shop/edit/',
      '/shop/growthplan/edit/',
      '/shop/proplan/edit/',
      '/shop-create',
      '/settings',
      '/shop/',
      '/shop-settings'
    ];

    // Check if current route is allowed for pending sellers
    const isAllowedForPending = allowedRoutesForPending.some(route =>
      location.pathname.startsWith(route)
    );

    // Check if seller is approved by admin
    if (seller && !seller.isActive) {
      // If it's a dashboard route or other restricted route, redirect to approval pending
      if (!isAllowedForPending) {
        return <Navigate to="/SellerApprovalPending" replace />;
      }
      // Otherwise, allow access to plan selection and shop editing
    }

    return children;
  }
};

export default SellerProtectedRoute;
