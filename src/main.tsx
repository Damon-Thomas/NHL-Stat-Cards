import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StatProvider } from "./contexts/statContext.tsx";
import { GraphProvider } from "./contexts/graphContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatProvider>
      <GraphProvider>
        <App />
      </GraphProvider>
    </StatProvider>
  </StrictMode>
);
