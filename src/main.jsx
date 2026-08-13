import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { captureAndSaveUtms } from "./utm";

captureAndSaveUtms();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
