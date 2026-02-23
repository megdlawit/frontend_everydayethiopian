import api from "../utils/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../components/Toast"; 
import { server } from "../server";
import { loadSeller } from "../redux/actions/sellers";

const SellerActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (activation_token) {
      const activateAccount = async () => {
        try {
          const res = await api.get(`${server}/shop/activation/${activation_token}`, {
            withCredentials: true
          });

          console.log("Activation successful:", res.data);
          console.log("Cookies after activation:", document.cookie);

          // Check if this is auto-login case (initial activation)
          if (res.data.redirectToPlans) {
            // User is now automatically logged in, load seller data and redirect to plans
            showToast("success", "Account Activated", res.data.message || "Email verified successfully!");
            console.log("Auto-login successful, loading seller data and redirecting to plans");

            // Load seller data to update Redux state
            dispatch(loadSeller());

            // Wait a bit longer to ensure cookie is set and seller data is loaded
            setTimeout(() => {
              console.log("Redirecting to plan page...");
              navigate("/plan");
            }, 2000);
          } else {
            // For reactivation cases, just show success and redirect to login
            showToast("success", "Activation Successful", res.data.message || "Activation successful!");
            setTimeout(() => {
              navigate("/shop-login");
            }, 2000);
          }

          setLoading(false);
        } catch (err) {
          console.error("Activation error:", err);
          setError(true);
          setLoading(false);
          showToast("error", "Activation Failed", err.response?.data?.message || "Activation failed");
        }
      };
      activateAccount();
    }
  }, [activation_token, navigate, dispatch]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <div>
          <p>Activating your account...</p>
          <div className="spinner" style={{ margin: "20px auto" }}>⏳</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center" }}>
          <p>Your token is expired or invalid!</p>
          <button
            onClick={() => navigate("/shop-login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>Your account has been activated successfully!</p>
          <p>Redirecting...</p>
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

export default SellerActivationPage;