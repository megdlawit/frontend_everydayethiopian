import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  categories: [],
};

export const categoryReducer = createReducer(initialState, {
  categoryCreateRequest: (state) => {
    state.isLoading = true;
  },
  categoryCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.category = action.payload;
    state.success = true;
  },
  categoryCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all categories
  getAllCategoriesRequest: (state) => {
    state.isLoading = true;
    // DO NOT reset state.categories = [];
  },
  getAllCategoriesSuccess: (state, action) => {
    state.isLoading = false;
    state.categories = action.payload;
  },
  getAllCategoriesFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete category
  deleteCategoryRequest: (state) => {
    state.isLoading = true;
  },
  deleteCategorySuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteCategoryFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // update category
  updateCategoryRequest: (state) => {
    state.isLoading = true;
  },
  updateCategorySuccess: (state, action) => {
    state.isLoading = false;
    state.updatedCategory = action.payload;
    state.success = true;
  },
  updateCategoryFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get category by id
  getCategoryByIdRequest: (state) => {
    state.isLoading = true;
  },
  getCategoryByIdSuccess: (state, action) => {
    state.isLoading = false;
    state.category = action.payload;
  },
  getCategoryByIdFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
});