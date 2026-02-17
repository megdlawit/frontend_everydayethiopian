import React from 'react'
import AdminHeader from "../../components/Layout/AdminHeader";
import AdminSideBar from "../../components/Admin/Layout/AdminSideBar";
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
  return (
    <div>
    <AdminHeader />
    <div className="flex items-start justify-between w-full">
      <div className="w-[80px] 800px:w-[330px]">
        <AdminSideBar active={7} />
      </div>
       <DashboardMessages />
    </div>
  </div>
  )
}

export default ShopInboxPage