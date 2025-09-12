 import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { Toaster } from "sonner"  
import { GoogleOAuthProvider } from "@react-oauth/google";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // set in .env

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
    <Toaster  richColors position="bottom-right" />
  </GoogleOAuthProvider>
);
