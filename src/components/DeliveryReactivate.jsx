import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import { server } from "../server";
import Footer from "../components/Layout/Footer";

const DeliveryReactivate = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${server}/delivery/reactivate/${token}`);
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Unable to reactivate account.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative min-h-screen w-full flex flex-col items-center font-[Avenir LT Std] text-sm overflow-hidden">
        {/* Spotlight Background */}
        <div className="absolute inset-0 z-0" />

        {/* Reactivation Form */}
        <div className="px-10 py-10 w-full max-w-xl border border-1 rounded-[50px] z-10 text-center relative mt-16 mb-10 bg-white/80 backdrop-blur-md shadow-lg">
          <h2 className="text-4xl mb-8 font-normal font-[Quesha]">Reactivate Account</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to reactivate your delivery account. You will need to log in after reactivation.
          </p>
          <button
            onClick={handleReactivate}
            disabled={isLoading}
            className={`bg-[#FFC300] text-white px-6 py-2 rounded-full hover:bg-yellow-400 transition w-[180px] text-sm ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Reactivating..." : "Reactivate Account"}
          </button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DeliveryReactivate;