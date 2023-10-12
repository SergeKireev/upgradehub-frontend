import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "../styles/styles.scss";
import "../styles/react-diff-view.scss";

document.addEventListener("DOMContentLoaded", function (event) {
  const container = document.getElementById("app");
  const root = createRoot(container);
  root.render(<App />);
});
