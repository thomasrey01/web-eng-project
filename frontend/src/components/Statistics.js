import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Statistics() {
  /**
   * Calls the get statistics API endpoint.
   */
  const getStats = () => {
    let url = `http://localhost:8000/api/city/${city}/statistics`;
    axios
      .get(
        url
      )
      .then((res) => {
        setCity(res.data);
      });
  };
  const [city, setCity] = useState({});
  return (
    <div className="App">
      <Link to="/" style={{ textDecoration: 'none' }}>Home</Link>
      <h1>City Statistics</h1>
      <div class="d-flex justify-content-center">
        <input
          className="mb-2 form -control titleIn"
          onChange={(event) => setCity(event.target.value)}
          placeholder="City"
        />
      </div>
      <button
        className="btn btn-primary mx-2 mb-3"
        onClick={getStats}
        style={{ borderRadius: "50px", "font-weight": "bold" }}
      >
        Search
      </button>
      <div id="results">
        <p>Mean price: {city.meanPrice} <span>&#8364;</span></p>
        <p>Median price: {city.medianPrice} <span>&#8364;</span></p>
        <p>Price standard deviation: {city.sdPrice} <span>&#8364;</span></p>
        <p>Mean deposit: {city.meanDeposit} <span>&#8364;</span></p>
        <p>Median deposit: {city.medianDeposit} <span>&#8364;</span></p>
        <p>Deposit standard deviation: {city.sdDeposit} <span>&#8364;</span></p>
      </div>
    </div>
  );
}

export default Statistics;
