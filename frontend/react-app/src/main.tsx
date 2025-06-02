import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // <-- use BrowserRouter
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);