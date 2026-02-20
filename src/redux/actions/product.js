import api from "../../utils/api";
import { server } from "../../server";

export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "productCreateRequest",
    });

    const { data } = await api.post(`/product/create-product`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch({
      type: "productCreateSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "productCreateFail",
      payload: error.response?.data?.message || "An error occurred while creating the product.",
    });
  }
};

// get All Products of a shop
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const { data } = await api.get(`/product/get-all-products-shop/${id}`);
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete product of a shop
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const { data } = await api.delete(`/product/delete-shop-product/${id}`);

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response.data.message,
    });
  }
};

// get all products
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllProductsRequest" });

    const { data } = await api.get(`/product/get-all-products`);

    dispatch({
      type: "getAllProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsFail",
      payload: error.response?.data?.message || "Failed to fetch products",
    });
  }
};

// update product
export const updateProduct = (id, productData) => async (dispatch) => {
  try {
    dispatch({ type: "updateProductRequest" });

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    const { data } = await api.put(`/product/edit-product/${id}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch({
      type: "updateProductSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "updateProductFailed",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// get all video products for seller (by shop ID)
export const getAllVideoProducts = (shopId) => async (dispatch) => {
  try {
    dispatch({ type: "getAllVideoProductsRequest" });
    const { data } = await api.get(`/product/get-all-video-products/${shopId}`);
    dispatch({
      type: "getAllVideoProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllVideoProductsFailed",
      payload: error.response?.data?.message || "An error occurred while fetching video products.",
    });
  }
};

// get all video products for admin (all shops)
export const getAllAdminVideoProducts = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllVideoProductsRequest" });
    const { data } = await api.get(`/product/admin-get-all-video-products`);
    dispatch({
      type: "getAllVideoProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllVideoProductsFailed",
      payload: error.response?.data?.message || "An error occurred while fetching video products.",
    });
  }
};