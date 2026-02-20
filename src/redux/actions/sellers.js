import api from "../../utils/api";
import { server } from "../../server";

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });

    const { data } = await api.get(`/shop/getSeller`);
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response?.data?.message || error.message || "An error occurred",
    });
  }
};

// get all sellers --- admin
export const getAllSellers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await api.get(`/shop/admin-all-sellers`);

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error) {
    dispatch({
      type: "getAllSellerFailed",
      //   payload: error.response.data.message,
    });
  }
};

// clear errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: "clearErrors" });
};

// logout seller
export const logoutSeller = () => async (dispatch) => {
  try {
    await api.get(`/shop/logout`);
    dispatch({ type: "LogoutSeller" });
  } catch (error) {
    // Optionally handle error
  }
};
