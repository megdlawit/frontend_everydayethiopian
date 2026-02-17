import React from "react";

const CheckoutSteps = ({ active }) => {
  return (
    <div className="flex flex-col items-center mt-10">
      <div className="w-[90%] 800px:w-[50%] flex justify-between items-center relative">
        {/* Step 1: Shipping */}
        <div className="flex items-center">
          <div
            className={`${
              active === 1
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            1
          </div>
          <span className="ml-2 text-lg font-medium">Shipping</span>
        </div>

        {/* Step 2: Payment */}
        <div className="flex items-center">
          <div
            className={`${
              active === 2
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            2
          </div>
          <span className="ml-2 text-lg font-medium">Payment</span>
        </div>

        {/* Step 3: Success */}
        <div className="flex items-center">
          <div
            className={`${
              active === 3
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            } w-[40px] h-[40px] rounded-full flex items-center justify-center font-semibold`}
          >
            3
          </div>
          <span className="ml-2 text-lg font-medium">Success</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-[800px] mt-2">
        <div className="h-[2px] bg-gray-300 relative">
          <div
            className={`h-full bg-black transition-all duration-300 absolute top-0 left-0`}
            style={{
              width: `${(active / 3) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;