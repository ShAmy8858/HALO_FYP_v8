import { createRoot } from "react-dom/client";
import "./auth.css";
import "./landing.css";
import App from "./App.tsx";
import "./index.css";

// Apply dark mode class BEFORE render to avoid flash
(function () {
  try {
    const stored = localStorage.getItem("halo_dark");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "true" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (_) {}
})();

createRoot(document.getElementById("root")!).render(<App />);
