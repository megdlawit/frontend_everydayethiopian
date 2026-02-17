import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  allEvents: [],
  error: null,
};

export const eventReducer = createReducer(initialState, {
  eventCreateRequest: (state) => {
    state.isLoading = true;
  },
  eventCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.event = action.payload;
    state.success = true;
  },
  eventCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all events of shop
  getAlleventsShopRequest: (state) => {
    state.isLoading = true;
  },
  getAlleventsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.events = action.payload;
  },
  getAlleventsShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete event of a shop
  deleteeventRequest: (state) => {
    state.isLoading = true;
  },
  deleteeventSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteeventFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all events 
  getAlleventsRequest: (state) => {
    state.isLoading = true;
  },
  getAlleventsSuccess: (state, action) => {
    state.isLoading = false;
    state.allEvents = action.payload;
  },
  getAlleventsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
  updateEventRequest: (state) => {
    state.isLoading = true;
  },
  updateEventSuccess: (state, action) => {
    state.isLoading = false;
    state.updatedEvent = action.payload;
    state.success = true;
  },
  updateEventFailed: (state, action) => {
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

  // get event by id
  getEventByIdRequest: (state) => {
    state.isLoading = true;
  },
  getEventByIdSuccess: (state, action) => {
    state.isLoading = false;
    state.event = action.payload;
  },
  getEventByIdFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },
});
