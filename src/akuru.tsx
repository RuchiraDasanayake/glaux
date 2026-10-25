import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/marcellus/latin-400.css";
import "@fontsource/schibsted-grotesk/latin-400.css";
import "@fontsource/schibsted-grotesk/latin-500.css";
import "@fontsource/schibsted-grotesk/latin-700.css";
import "@fontsource/spline-sans-mono/latin-400.css";
import "@fontsource/spline-sans-mono/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/app.css";
import "./styles/akuru.css";
import AkuruApp from "./akuru/AkuruApp";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root was not found.");

createRoot(container).render(
  <StrictMode>
    <AkuruApp />
  </StrictMode>,
);
