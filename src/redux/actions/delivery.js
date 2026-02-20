import api from "../../utils/api";
import { server } from "../../server";
import { toast } from "react-toastify";

// Get all deliveries
export const getAllDeliveries = () => async (dispatch) => {
  try {
    dispatch({ type: "GetAllDeliveriesRequest" });
    const { data } = await api.get(`/delivery/all`);
    dispatch({
      type: "GetAllDeliveriesSuccess",
      payload: data.deliveries,
    });
  } catch (error) {
    dispatch({
      type: "GetAllDeliveriesFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};
// actions/delivery.js
export const loadMessages = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadMessagesRequest" });
    const token = localStorage.getItem("authToken");
    const { data } = await api.get(`/delivery/messages`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    dispatch({
      type: "LoadMessagesSuccess",
      payload: data.messages,
    });
  } catch (error) {
    dispatch({
      type: "LoadMessagesFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Create delivery
export const createDelivery = (deliveryData) => async (dispatch) => {
  try {
    dispatch({ type: "CreateDeliveryRequest" });
    const { data } = await api.post(`/delivery/create`, deliveryData);
    dispatch({
      type: "CreateDeliverySuccess",
      payload: data.delivery,
    });
  } catch (error) {
    dispatch({
      type: "CreateDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete delivery
export const deleteDelivery = (id) => async (dispatch) => {
  try {
    dispatch({ type: "DeleteDeliveryRequest" });
    const { data } = await api.delete(`/delivery/${id}`);
    dispatch({
      type: "DeleteDeliverySuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "DeleteDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Signup delivery
export const signupDelivery = (deliveryData) => async (dispatch) => {
  try {
    dispatch({ type: "SignupDeliveryRequest" });
    const { data } = await api.post(`/delivery/signup`, deliveryData);
    dispatch({
      type: "SignupDeliverySuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "SignupDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Activate delivery
export const activateDelivery = (activationToken) => async (dispatch) => {
  try {
    dispatch({ type: "ActivateDeliveryRequest" });
    const { data } = await api.post(`/delivery/activation`, { activation_token: activationToken });
    dispatch({
      type: "ActivateDeliverySuccess",
      payload: data.message,
    });
    toast.success(data.message);
  } catch (error) {
    dispatch({
      type: "ActivateDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
    toast.error(
      error.response?.data?.message === "Activation token has expired"
        ? "Activation token has expired. Please register again."
        : error.response?.data?.message || error.message
    );
  }
};

// Load delivery user
export const loadDeliveryUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadDeliveryUserRequest" });
    const token = localStorage.getItem("authToken");
    const { data } = await api.get(`/delivery/getuser`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    dispatch({
      type: "LoadDeliveryUserSuccess",
      payload: data.delivery,
    });
  } catch (error) {
    if (error.response?.data?.message === "Your account is not approved by an admin") {
      dispatch({
        type: "LoadDeliveryUserSuccess",
        payload: { isApproved: false },
      });
    } else {
      dispatch({
        type: "LoadDeliveryUserFail",
        payload: error.response?.data?.message || error.message,
      });
    }
  }
};

// Load assigned orders
export const loadAssignedOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadAssignedOrdersRequest" });
    const token = localStorage.getItem("authToken");
    const { data } = await api.get(`/delivery/assigned-orders`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    dispatch({
      type: "LoadAssignedOrdersSuccess",
      payload: data.assignedOrders,
    });
  } catch (error) {
    dispatch({
      type: "LoadAssignedOrdersFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update delivery request status
export const updateDeliveryRequest = (id, status) => async (dispatch) => {
  try {
    dispatch({ type: "UpdateDeliveryRequest" });
    const token = localStorage.getItem("authToken");
    const { data } = await api.put(`/delivery/request/${id}`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    dispatch({
      type: "UpdateDeliverySuccess",
      payload: { id, status, message: data.message },
    });
    toast.success(data.message);
  } catch (error) {
    dispatch({
      type: "UpdateDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
    toast.error(error.response?.data?.message || "Failed to update delivery status");
    throw error;
  }
};

// Complete delivery
export const completeDelivery = (id) => async (dispatch) => {
  try {
    dispatch({ type: "CompleteDeliveryRequest" });
    const token = localStorage.getItem("authToken");
    const { data } = await api.put(`/delivery/complete/${id}`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
    dispatch({
      type: "CompleteDeliverySuccess",
      payload: { id, delivery: data.delivery, message: data.message },
    });
    toast.success(data.message);
  } catch (error) {
    dispatch({
      type: "CompleteDeliveryFail",
      payload: error.response?.data?.message || error.message,
    });
    toast.error(error.response?.data?.message || "Failed to complete delivery");
    throw error;
  }
};

// Clear errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: "clearErrors" });
};

// Clear messages
export const clearMessages = () => (dispatch) => {
  dispatch({ type: "clearMessages" });
};