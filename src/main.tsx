import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPi } from "@/lib/pi";

// Initialize the Pi Network SDK before any other Pi SDK call (auth or payment).
void initPi().catch((error) => {
  console.warn("[pi] SDK initialization deferred:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
