import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { BRAND_NAME } from "@shared/constants";

document.title = `AI Creative Studio - ${BRAND_NAME}`;

createRoot(document.getElementById("root")!).render(<App />);
