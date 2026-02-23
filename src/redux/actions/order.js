import axios from "axios";
import { server } from "../../server";

// get all orders of user
export const getAllOrdersOfUser = (userId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersUserRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-all-orders/${userId}`
    );

    dispatch({
      type: "getAllOrdersUserSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.response.data.message,
    });
  }
};

// get all orders of seller
export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-seller-all-orders/${shopId}`
    );

    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.response.data.message,
    });
  }
};

// get all orders of Admin
export const getAllOrdersOfAdmin = (page = 1, limit = 10, status = "") => async (dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    const { data } = await axios.get(`${server}/order/admin-all-orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`, {
      withCredentials: true,
    });

    dispatch({
      type: "adminAllOrdersSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.response.data.message,
    });
  }
};

// update order status for admin
export const updateAdminOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    dispatch({
      type: "updateOrderStatusRequest",
    });

    const { data } = await axios.put(
      `${server}/order/admin-update-order-status/${orderId}`,
      { status },
      { withCredentials: true }
    );

    dispatch({
      type: "updateOrderStatusSuccess",
      payload: data.order,
    });
  } catch (error) {
    dispatch({
      type: "updateOrderStatusFailed",
      payload: error.response.data.message,
    });
  }
};

// submit refund request (updated for files)
export const submitRefundRequest = (orderId, refundedItems, files = []) => async (dispatch) => {
  try {
    dispatch({
      type: "submitRefundRequest",
    });

    const formData = new FormData();
    formData.append("refundedItems", JSON.stringify(refundedItems));  // Array: [{ _id, qty, reason }]
    files.forEach((file) => formData.append("refundImages", file));  // Match order to items

    const { data } = await axios.put(
      `${server}/order/order-refund/${orderId}`,
      formData,
      { 
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    dispatch({
      type: "submitRefundSuccess",
      payload: data.order,
    });

    // toast.success("Refund request submitted!");
  } catch (error) {
    dispatch({
      type: "submitRefundFailed",
      payload: error.response.data.message,
    });
    // toast.error(error.response.data.message);
  }
};