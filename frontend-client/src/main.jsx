// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from "./theme/ThemeContext";
import "./i18n/i18n";  // Khởi tạo i18next (đa ngôn ngữ VI/EN)


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="1012513516239-5pgqmm7k3okhk32rj8jbo5i6ikou48r3.apps.googleusercontent.com">
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </GoogleOAuthProvider>
);
