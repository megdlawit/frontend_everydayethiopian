import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import { server } from "../server";
import { loadDeliveryUser } from "../redux/actions/delivery";

const DeliveryActivation = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const activateAccount = async () => {
        try {
          const res = await axios.get(`${server}/delivery/activation/${token}`, {
            withCredentials: true
          });

          console.log("Delivery activation successful:", res.data);

          // Check if this is auto-login case (initial activation)
          if (res.data.redirectToDashboard) {
            // User is now automatically logged in, load delivery data
            toast.success(res.data.message || "Email verified successfully!");
            console.log("Auto-login successful, loading delivery data");

            // Load delivery data to update Redux state
            dispatch(loadDeliveryUser());

            // Redirect to delivery dashboard (will show approval pending if not approved)
            setTimeout(() => {
              navigate("/delivery/dashboard");
            }, 1000);
          } else {
            // For reactivation cases, just show success and redirect to login
            toast.success(res.data.message || "Activation successful!");
            setTimeout(() => {
              navigate("/delivery/login");
            }, 2000);
          }

          setLoading(false);
        } catch (err) {
          console.error("Delivery activation error:", err);
          setError(true);
          setLoading(false);
          toast.error(err.response?.data?.message || "Activation failed");
        }
      };
      activateAccount();
    }
  }, [token, navigate, dispatch]);

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
          <p>Activating your delivery account...</p>
          <div className="spinner" style={{ margin: "20px auto" }}>⏳</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center" }}>
          <p>Your token is expired or invalid!</p>
          <button
            onClick={() => navigate("/delivery/login")}
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
          <p>Your delivery account has been activated successfully!</p>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryActivation;
