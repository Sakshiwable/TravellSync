// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";  // ✅ ADD THIS IMPORT

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" reverseOrder={false} />  
    </BrowserRouter>
  </StrictMode>
);
