import api from "../../utils/api";
import { server } from "../../server";

// create event
export const createevent = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const { data: responseData } = await api.post(`/event/create-event`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch({
      type: "eventCreateSuccess",
      payload: responseData.event,
    });
  } catch (error) {
    dispatch({
      type: "eventCreateFail",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsShopRequest",
    });

    const { data } = await api.get(`/event/get-all-events/${id}`);
    dispatch({
      type: "getAlleventsShopSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "getAlleventsShopFailed",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};

// delete event of a shop
export const deleteEvent = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteeventRequest",
    });

    const { data } = await api.delete(`/event/delete-shop-event/${id}`);

    dispatch({
      type: "deleteeventSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteeventFailed",
      payload: error.response.data.message,
    });
  }
};

// get all events
export const getAllEvents = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsRequest",
    });

    const { data } = await api.get(`/event/get-all-events`);
    dispatch({
      type: "getAlleventsSuccess",
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: "getAlleventsFailed",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};
// update event
export const updateEvent = (id, eventData) => async (dispatch) => {
  try {
    dispatch({ type: "updateEventRequest" });

    const { data } = await api.put(`/event/edit-event/${id}`, eventData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch({
      type: "updateEventSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "updateEventFailed",
      payload: error.response?.data?.message || "An error occurred",
    });
  }
};
