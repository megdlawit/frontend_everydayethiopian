import axios from "axios";
import { server } from "../../server";

// create category
export const createCategory = (data) => async (dispatch) => {
  try {
    dispatch({
      type: "categoryCreateRequest",
    });

    const { data: responseData } = await axios.post(`${server}/category/create-category`, data);
    dispatch({
      type: "categoryCreateSuccess",
      payload: responseData.category,
    });
  } catch (error) {
    dispatch({
      type: "categoryCreateFail",
      payload: error.response.data.message,
    });
  }
};

// get all categories
// In actions/category.js
export const getAllCategories = () => async (dispatch, getState) => {
  try {
    const { category } = getState();
    if (category.categories.length > 0) {
      console.log("Categories already loaded, skipping fetch");
      return;
    }
    console.log("getAllCategories dispatched");
    dispatch({ type: "getAllCategoriesRequest" });
    const { data } = await axios.get(`${server}/category/get-all-categories`);
    dispatch({
      type: "getAllCategoriesSuccess",
      payload: data.categories,
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

    const { data } = await axios.delete(
      `${server}/category/delete-category/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteCategorySuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteCategoryFailed",
      payload: error.response.data.message,
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

    const { data } = await axios.put(
      `${server}/category/update-category/${id}`,
      categoryData,
      config
    );

    console.log('Received response:', data);

    dispatch({
      type: "updateCategorySuccess",
      payload: data.category,
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

    const { data } = await axios.get(`${server}/category/get-category/${id}`);
    dispatch({
      type: "getCategoryByIdSuccess",
      payload: data.category,
    });
  } catch (error) {
    dispatch({
      type: "getCategoryByIdFailed",
      payload: error.response.data.message,
    });
  }
};