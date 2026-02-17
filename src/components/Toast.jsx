import React from "react";
import PropTypes from "prop-types";
import {
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";

const Toast = ({ type, title, message, onClose }) => {
  const getToastStyle = () => {
    switch (type) {
      case "success":
        return {
          icon: AiOutlineCheckCircle,
          bgColor: "rgba(222, 252, 235, 0.6)",
          borderColor: "rgba(16, 185, 129, 0.2)",
          iconColor: "#16a34a",
        };
      case "info":
        return {
          icon: AiOutlineInfoCircle,
          bgColor: "rgba(219, 234, 254, 0.6)",
          borderColor: "rgba(59, 130, 246, 0.2)",
          iconColor: "#3b82f6",
        };
      case "error":
        return {
          icon: AiOutlineExclamationCircle,
          bgColor: "rgba(254, 226, 226, 0.6)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          iconColor: "#ef4444",
        };
      default:
        return {
          icon: AiOutlineInfoCircle,
          bgColor: "rgba(219, 234, 254, 0.6)",
          borderColor: "rgba(59, 130, 246, 0.2)",
          iconColor: "#3b82f6",
        };
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = getToastStyle();

  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-4 shadow-sm w-full max-w-md border transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        backdropFilter: "blur(12px)",
      }}
    >
      <Icon size={22} style={{ color: iconColor, marginTop: "2px" }} />

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <span className="text-sm text-gray-500">{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(["success", "info", "error"]),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

Toast.defaultProps = {
  type: "info",
  onClose: null,
};

export default Toast;
