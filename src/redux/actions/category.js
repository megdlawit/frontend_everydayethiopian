import api from "../../utils/api";
import { server } from "../../server";

// create category
export const createCategory = (data) => async (dispatch) => {
  try {
    dispatch({
      type: "categoryCreateRequest",
    });

    const { data: resData } = await api.post(`${server}/category/create-category`, data);
    if (!resData) {
      dispatch({ type: "categoryCreateFail", payload: "No response data" });
      return;
    }

    dispatch({
      type: "categoryCreateSuccess",
      payload: resData.category,
    });
  } catch (error) {
    dispatch({
      type: "categoryCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all categories
// In actions/category.js
export const getAllCategories = () => async (dispatch, getState) => {
  try {
    const { category } = getState();
    if ((category.categories || []).length > 0) {
      console.log("Categories already loaded, skipping fetch");
      return;
    }
    console.log("getAllCategories dispatched");
    dispatch({ type: "getAllCategoriesRequest" });
    const { data: resData } = await api.get(`${server}/category/get-all-categories`);
    if (!resData) {
      dispatch({ type: "getAllCategoriesFailed", payload: "No response data" });
      return;
    }

    dispatch({
      type: "getAllCategoriesSuccess",
      payload: resData.categories || [],
    });
  } catch (error) {
    dispatch({
      type: "getAllCategoriesFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};
// delete category
export const deleteCategory = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteCategoryRequest",
    });

    const { data: resData } = await api.delete(`${server}/category/delete-category/${id}`, { withCredentials: true });
    if (!resData) {
      dispatch({ type: "deleteCategoryFailed", payload: "No response data" });
      return;
    }

    dispatch({
      type: "deleteCategorySuccess",
      payload: resData.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteCategoryFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// update category
export const updateCategory = (id, categoryData) => async (dispatch) => {
  try {
    dispatch({ type: "updateCategoryRequest" });

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    console.log('Sending update request with data:', categoryData);

    const { data: resData } = await api.put(`${server}/category/update-category/${id}`, categoryData, config);
    if (!resData) {
      dispatch({ type: "updateCategoryFailed", payload: "No response data" });
      return;
    }

    dispatch({
      type: "updateCategorySuccess",
      payload: resData.category,
    });
  } catch (error) {
    console.error('Error in updateCategory action:', error);
    dispatch({
      type: "updateCategoryFailed",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// get category by id
export const getCategoryById = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getCategoryByIdRequest",
    });

    const { data: resData } = await api.get(`${server}/category/get-category/${id}`);
    if (!resData) {
      dispatch({ type: "getCategoryByIdFailed", payload: "No response data" });
      return;
    }

    dispatch({
      type: "getCategoryByIdSuccess",
      payload: resData.category,
    });
  } catch (error) {
    dispatch({
      type: "getCategoryByIdFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};