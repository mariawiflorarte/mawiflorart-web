import React from "react";
import ReactDOM from "react-dom/client";
import App, { CatalogPage } from "./App.jsx";

// Se o endereço acessado terminar em /catalogo, mostra só a vitrine pública
// (sem nenhuma aba de Produtos ou Matéria-Prima) — esse é o link que pode
// ser enviado para os clientes com segurança.
const isCatalog = window.location.pathname.replace(/\/+$/, "").toLowerCase().endsWith("/catalogo");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isCatalog ? <CatalogPage /> : <App />}
  </React.StrictMode>
);
