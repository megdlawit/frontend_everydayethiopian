import React from 'react';
import AdminHeader from '../components/Layout/AdminHeader';
import AdminSideBar from '../components/Admin/Layout/AdminSideBar';
import UnapprovedDeliveries from "../components/Admin/UnapprovedDeliveries";

const AdminUnapprovedDeliveries = () => {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <div className="flex w-full">
        <div className="w-[80px] 800px:w-[250px]">
          <AdminSideBar active={9} />
        </div>
        <div className="flex-1">
          <UnapprovedDeliveries />
        </div>
      </div>
    </div>
  );
};

export default AdminUnapprovedDeliveries;