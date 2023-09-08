import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import PropertyItem from "./components/Property";
import AddProperty from "./components/AddProperty";
import Statistics from "./components/Statistics";
import reportWebVitals from "./reportWebVitals";
import DetailsView from "./components/DetailsView";
import Map from "./components/Map";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

/**
 * Defines the routes of URLs
 */
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/details" element={<DetailsView/>} />
      <Route path="/add" element={<AddProperty/>} />
      <Route path="/statistics" element={<Statistics/>} />
      <Route path="/map" element={<Map/>} />
      <Route path="/property" element={<PropertyItem/>}>
        <Route path=":externalId" element={<PropertyItem/>} />
      </Route>
      ,
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
