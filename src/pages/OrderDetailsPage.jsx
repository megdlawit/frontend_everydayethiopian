import React from 'react'
import Header2 from '../components/Layout/Header2'
import Footer from '../components/Layout/Footer'
import UserOrderDetails from "../components/UserOrderDetails";

const OrderDetailsPage = () => {
  return (
    <div>
        <Header2 />
        <UserOrderDetails />
        <Footer />
    </div>
  )
}

export default OrderDetailsPage