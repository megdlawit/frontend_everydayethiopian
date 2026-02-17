import axios from "axios";
import { server } from "../../server";

// create event
export const createevent = (formData) => async (dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    const { data: responseData } = await axios.post(`${server}/event/create-event`, formData, config);
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

    const { data } = await axios.get(`${server}/event/get-all-events/${id}`);
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

    const { data } = await axios.delete(
      `${server}/event/delete-shop-event/${id}`,
      {
        withCredentials: true,
      }
    );

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

    const { data } = await axios.get(`${server}/event/get-all-events`);
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

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    };

    const { data } = await axios.put(
      `${server}/event/edit-event/${id}`,
      eventData,
      config
    );

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
