import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const orderReducer = createReducer(initialState, {
  // get all orders of user
  getAllOrdersUserRequest: (state) => {
    state.isLoading = true;
  },
  getAllOrdersUserSuccess: (state, action) => {
    state.isLoading = false;
    state.orders = action.payload;
  },
  getAllOrdersUserFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  
  // get all orders of shop
  getAllOrdersShopRequest: (state) => {
    state.isLoading = true;
  },
  getAllOrdersShopSuccess: (state, action) => {
    state.isLoading = false;
    state.orders = action.payload;
  },
  getAllOrdersShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all orders for admin
  adminAllOrdersRequest: (state) => {
    state.adminOrderLoading = true;
  },
  adminAllOrdersSuccess: (state, action) => {
    state.adminOrderLoading = false;
    state.adminOrders = action.payload.orders;
    state.totalPages = action.payload.totalPages;
    state.currentPage = action.payload.currentPage;
  },
  adminAllOrdersFailed: (state, action) => {
    state.adminOrderLoading = false;
    state.error = action.payload;
  },

  updateOrderStatusRequest: (state) => {
    state.loading = true;
  },
  
  updateOrderStatusSuccess: (state, action) => {
    state.loading = false;
    // Update the specific order in adminOrders
    const index = state.adminOrders?.findIndex(order => order._id === action.payload._id);
    if (index !== -1 && state.adminOrders) {
      state.adminOrders[index] = action.payload;
    }
  },
  updateOrderStatusFailed: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  // Refund actions
  submitRefundRequest: (state) => {
    state.refundLoading = true;
  },
  submitRefundSuccess: (state, action) => {
    state.refundLoading = false;
    const index = state.orders?.findIndex(order => order._id === action.payload._id);
    if (index !== -1 && state.orders) {
      state.orders[index] = action.payload;
    }
  },
  submitRefundFailed: (state, action) => {
    state.refundLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});