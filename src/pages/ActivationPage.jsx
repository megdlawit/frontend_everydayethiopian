import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../components/Toast"; 

const ActivationPage = () => {
  const { activation_token } = useParams();
  const navigate = useNavigate();

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
    const activateAccount = async () => {
      try {
        const res = await axios.get(`${server}/user/activation/${activation_token}`);
        showToast("success", "Account Activated", res.data.message);
        navigate("/login");
      } catch (err) {
        showToast("error", "Activation Failed", err.response?.data?.message || "Activation failed");
        navigate("/login");
      }
    };
    activateAccount();
  }, [activation_token, navigate]);

  return (
    <>
    <div>Activating your account...</div>
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
    </>
  );
};

export default ActivationPage;