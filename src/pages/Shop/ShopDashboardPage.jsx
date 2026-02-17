import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import DashboardHero from "../../components/Shop/DashboardHero";
import SellerApprovalPending from "../../components/Shop/SellerApprovalPending";

const ShopDashboardPage = () => {
  const { seller } = useSelector((state) => state.seller);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  // Check if seller is not approved by admin (dashboard access requires admin approval)
  if (seller && !seller.isActive) {
    return <SellerApprovalPending />;
  }

  return (
    <div className="bg-gray-100">
      <DashboardHeader onSidebarToggle={handleSidebarToggle} />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={1} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="w-full justify-center flex">
          <main className="flex-1 overflow-y-auto">
            <DashboardHero />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboardPage;