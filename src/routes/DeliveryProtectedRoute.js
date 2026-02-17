import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const DeliveryProtectedRoute = ({ children }) => {
  const { loading, isDelivery, deliveryUser } = useSelector((state) => state.delivery);
  const location = useLocation();

  if (loading === true) {
    return <Loader />;
  } else {
    if (!isDelivery) {
      return <Navigate to={`/delivery/login`} replace />;
    }

    // Define routes that are accessible to pending deliveries (before admin approval)
    const allowedRoutesForPending = [
      '/delivery/orders',
      '/delivery/settings',
      '/delivery/profile',
      '/delivery/messages'
    ];

    // Check if current route is allowed for pending deliveries
    const isAllowedForPending = allowedRoutesForPending.some(route => 
      location.pathname.startsWith(route)
    );

    // Check if delivery is approved by admin
    if (deliveryUser && !deliveryUser.isApproved) {
      // If it's a dashboard route, redirect to approval pending
      if (location.pathname === '/delivery/dashboard' || location.pathname.startsWith('/delivery/dashboard')) {
        return <Navigate to="/delivery/approval-pending" replace />;
      }
      // Otherwise, allow access to other delivery features
    }

    return children;
  }
};

export default DeliveryProtectedRoute;
