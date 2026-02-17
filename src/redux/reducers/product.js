import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  allProducts: [], // Initialize allProducts to an empty array
};

export const productReducer = createReducer(initialState, {
  productCreateRequest: (state) => {
    state.isLoading = true;
  },
  productCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.product = action.payload;
    state.success = true;
  },
  productCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all products of shop
  getAllProductsShopRequest: (state) => {
    state.isLoading = true;
  },
  getAllProductsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.products = action.payload;
  },
  getAllProductsShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete product of a shop
  deleteProductRequest: (state) => {
    state.isLoading = true;
  },
  deleteProductSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteProductFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all products
  getAllProductsRequest: (state) => {
    state.isLoading = true;
  },
  getAllProductsSuccess: (state, action) => {
    state.isLoading = false;
    state.allProducts = action.payload;
  },
  getAllProductsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all video products
  getAllVideoProductsRequest: (state) => {
    state.isLoading = true;
  },
  getAllVideoProductsSuccess: (state, action) => {
    state.isLoading = false;
    state.allVideoProducts = action.payload;
  },
  getAllVideoProductsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  updateProductRequest: (state) => {
    state.isLoading = true;
  },
  updateProductSuccess: (state, action) => {
    state.isLoading = false;
    state.updatedProduct = action.payload;
    state.success = true;
  },
  updateProductFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  
  clearErrors: (state) => {
    state.error = null;
  },
  clearSuccess: (state) => {
    state.success = false;
  },
});
