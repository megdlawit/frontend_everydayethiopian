import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  deliveries: [],
  deliveryUser: null,
  isDelivery: false,
  assignedOrders: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const deliveryReducer = createReducer(initialState, {
  GetAllDeliveriesRequest: (state) => {
    state.loading = true;
  },
  GetAllDeliveriesSuccess: (state, action) => {
    state.loading = false;
    state.deliveries = action.payload;
    state.error = null;
  },
  GetAllDeliveriesFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  CreateDeliveryRequest: (state) => {
    state.loading = true;
  },
  CreateDeliverySuccess: (state, action) => {
    state.loading = false;
    state.deliveries.push(action.payload);
    state.successMessage = "Delivery created successfully";
    state.error = null;
  },
  CreateDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  DeleteDeliveryRequest: (state) => {
    state.loading = true;
  },
  DeleteDeliverySuccess: (state, action) => {
    state.loading = false;
    state.deliveries = state.deliveries.filter((delivery) => delivery._id !== action.payload.id);
    state.successMessage = action.payload;
    state.error = null;
  },
  DeleteDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  ActivateDeliveryRequest: (state) => {
    state.loading = true;
  },
  ActivateDeliverySuccess: (state, action) => {
    state.loading = false;
    state.successMessage = action.payload;
    state.error = null;
  },
  ActivateDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  SignupDeliveryRequest: (state) => {
    state.loading = true;
  },
  SignupDeliverySuccess: (state, action) => {
    state.loading = false;
    state.successMessage = action.payload;
    state.error = null;
  },
  SignupDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  LoadDeliveryUserRequest: (state) => {
    state.loading = true;
  },
  LoadDeliveryUserSuccess: (state, action) => {
    state.isDelivery = true;
    state.loading = false;
    state.deliveryUser = action.payload;
    state.error = null;
  },
  LoadDeliveryUserFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.isDelivery = false;
  },

  LoadMessagesRequest: (state) => {
    state.loading = true;
  },
  LoadMessagesSuccess: (state, action) => {
    state.loading = false;
    state.messages = action.payload;
    state.error = null;
  },
  LoadMessagesFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },
  UpdateDeliveryRequest: (state) => {
    state.loading = true;
  },
  UpdateDeliverySuccess: (state, action) => {
    state.loading = false;
    state.successMessage = action.payload.message;
    state.assignedOrders = state.assignedOrders.map((order) =>
      order.orderId._id === action.payload.id ? { ...order, status: action.payload.status } : order
    );
    state.error = null;
  },
  UpdateDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  CompleteDeliveryRequest: (state) => {
    state.loading = true;
  },
  CompleteDeliverySuccess: (state, action) => {
    state.loading = false;
    state.successMessage = action.payload.message;
    state.assignedOrders = state.assignedOrders.map((order) =>
      order.orderId._id === action.payload.id ? { ...order, status: "completed" } : order
    );
    state.deliveryUser = action.payload.delivery;
    state.error = null;
  },
  CompleteDeliveryFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  LoadAssignedOrdersRequest: (state) => {
    state.loading = true;
  },
  LoadAssignedOrdersSuccess: (state, action) => {
    state.loading = false;
    state.assignedOrders = action.payload;
    state.error = null;
  },
  LoadAssignedOrdersFail: (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  clearMessages: (state) => {
    state.successMessage = null;
  },
});