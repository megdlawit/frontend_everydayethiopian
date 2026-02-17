import React from 'react'
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import Category from "../components/Category/Category";

const CategoryPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={3} />
        </div>
        <div className="w-full justify-center flex overflow-y-scroll h-[90vh]">
          <Category />
        </div>
      </div>
    </div>
  )
}

export default CategoryPage;