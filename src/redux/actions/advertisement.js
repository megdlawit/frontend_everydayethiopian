import axios from "axios";
import { server } from "../../server";
import {
  GET_ALL_ADVERTISEMENTS_REQUEST,
  GET_ALL_ADVERTISEMENTS_SUCCESS,
  GET_ALL_ADVERTISEMENTS_FAIL,
  DELETE_ADVERTISEMENT_REQUEST,
  DELETE_ADVERTISEMENT_SUCCESS,
  DELETE_ADVERTISEMENT_FAIL,
  CREATE_ADVERTISEMENT_REQUEST,
  CREATE_ADVERTISEMENT_SUCCESS,
  CREATE_ADVERTISEMENT_FAIL,
  UPDATE_ADVERTISEMENT_REQUEST,
  UPDATE_ADVERTISEMENT_SUCCESS,
  UPDATE_ADVERTISEMENT_FAIL,
} from "../constants/advertisementConstants";

export const getAllAdvertisements = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_ADVERTISEMENTS_REQUEST });

    const { data } = await axios.get(`${server}/shop/all-advertisements`);

    dispatch({
      type: GET_ALL_ADVERTISEMENTS_SUCCESS,
      payload: data.advertisements,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_ADVERTISEMENTS_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const deleteAdvertisement = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_ADVERTISEMENT_REQUEST });

    await axios.delete(`${server}/shop/delete-advertisement/${id}`);

    dispatch({
      type: DELETE_ADVERTISEMENT_SUCCESS,
      payload: id,
    });

    dispatch(getAllAdvertisements());
  } catch (error) {
    dispatch({
      type: DELETE_ADVERTISEMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const createAdvertisement = (formData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_ADVERTISEMENT_REQUEST });

    const { data } = await axios.post(`${server}/shop/create-advertisement`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: CREATE_ADVERTISEMENT_SUCCESS,
      payload: data.advertisement,
    });

    dispatch(getAllAdvertisements());
  } catch (error) {
    console.error("Error creating advertisement:", error.response.data.message); // Log error for debugging
    dispatch({
      type: CREATE_ADVERTISEMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const updateAdvertisement = (id, formData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_ADVERTISEMENT_REQUEST });

    const { data } = await axios.put(`${server}/shop/update-advertisement/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({
      type: UPDATE_ADVERTISEMENT_SUCCESS,
      payload: data.advertisement,
    });

    dispatch(getAllAdvertisements());
  } catch (error) {
    dispatch({
      type: UPDATE_ADVERTISEMENT_FAIL,
      payload: error.response.data.message,
    });
  }
};
