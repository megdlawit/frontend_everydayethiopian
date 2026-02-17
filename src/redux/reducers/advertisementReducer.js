import { createReducer } from "@reduxjs/toolkit";
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

const initialState = {
  isLoading: true,
  advertisements: [],
};

export const advertisementReducer = createReducer(initialState, {
  [GET_ALL_ADVERTISEMENTS_REQUEST]: (state) => {
    state.isLoading = true;
  },
  [GET_ALL_ADVERTISEMENTS_SUCCESS]: (state, action) => {
    state.isLoading = false;
    state.advertisements = action.payload;
  },
  [GET_ALL_ADVERTISEMENTS_FAIL]: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  [DELETE_ADVERTISEMENT_REQUEST]: (state) => {
    state.isLoading = true;
  },
  [DELETE_ADVERTISEMENT_SUCCESS]: (state, action) => {
    state.isLoading = false;
    state.advertisements = state.advertisements.filter(ad => ad._id !== action.payload);
  },
  [DELETE_ADVERTISEMENT_FAIL]: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  [CREATE_ADVERTISEMENT_REQUEST]: (state) => {
    state.isLoading = true;
  },
  [CREATE_ADVERTISEMENT_SUCCESS]: (state, action) => {
    state.isLoading = false;
    state.advertisements.push(action.payload);
  },
  [CREATE_ADVERTISEMENT_FAIL]: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  [UPDATE_ADVERTISEMENT_REQUEST]: (state) => {
    state.isLoading = true;
  },
  [UPDATE_ADVERTISEMENT_SUCCESS]: (state, action) => {
    state.isLoading = false;
    const index = state.advertisements.findIndex(ad => ad._id === action.payload._id);
    if (index !== -1) {
      state.advertisements[index] = action.payload;
    }
  },
  [UPDATE_ADVERTISEMENT_FAIL]: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  clearErrors: (state) => {
    state.error = null;
  },
});
