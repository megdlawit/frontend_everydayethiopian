import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./redux/store";
import axios from "axios";
import { server } from "./server";

// Global axios defaults for cookie auth and base URL
axios.defaults.withCredentials = true;
axios.defaults.baseURL = server;

ReactDOM.render(
  <Provider store={Store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
