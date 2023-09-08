import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PropertyItem from "./components/Property";
import reactDom from "react-dom";
import { Link } from "react-router-dom";
import './App.css'

function App() {
    const [propList, setData] = useState({});
    const [city, setCity] = useState("");
    const [postalCode, setPostal] = useState("");
    const [propertyType, setType] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [rentMin, setRentMin] = useState("");
    const [rentMax, setRentMax] = useState("");
    const [squareMin, setSquareMin] = useState("");
    const [squareMax, setSquareMax] = useState("");
    const [sortBy, setSort] = useState("");
    const [order, setOrder] = useState("");
    const [amount, setAmount] = useState(10);
    const [isActive, setIsActive] = useState("");
    const [street, setStreet] = useState("");

    /**
     * getCities method. Gets called from the search button and sends the get request to the API
     */
    const getCities = () => { 
        let url = "http://localhost:8000/api/search?";
        if (city !== "") url += `city=${city}&`;

        if (postalCode !== "") url += `postalCode=${postalCode}&`;

        if (propertyType !== "") url += `propertyType=${propertyType}&`;

        if (latitude !== "" && longitude !== "")
            url += `location=${latitude}-${longitude}&`;

        if (squareMin !== "" && !squareMin !== "")
            url += `areaSqm=${squareMin}-${squareMax}&`;

        if (rentMin !== "" && rentMax !== "") url += `rent=${rentMin}-${rentMax}&`;

        if (street !== "") url += `street=${street}&`;

        if (sortBy !== "") url += `sortBy=${sortBy}&`;

        if (order !== "") url += `isAscending=${order}&`;

        if (isActive === "true" || isActive === "false") url += `isRoomActive=${isActive}&`;

        url += `ignoreCase=true&allowDiskUse=true`;
        console.log(url);
        axios.get(url).then((res) => {
            setData(res.data);
            console.log(propList);
        });
    };
    /**
     * Returns main page
     */
    return (
        <div className="App">
            <Link class="m-2" to="/add" style={{ textDecoration: "none" }}>
                Add property
            </Link>
            <Link class="m-2" to="/map" style={{ textDecoration: "none" }}>
                View map
            </Link>
            <Link class="m-2" to="/statistics" style={{ textDecoration: "none" }}>
                Statistics
            </Link>
            <Link class="m-2" to="/details" style={{ textDecoration: "none" }}>
                Coordinates updates
            </Link>
            
            <h1
                className="card text-white bg-primary mb-1"
                styleName="max-width: 20rem;"
            >
                Properties
            </h1>
            <h5 className="card text-white bg-dark mb-3">Search properties</h5>
            <div class="d-flex justify-content-center">
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setRentMin(event.target.value)}
                    placeholder="Minimum rent"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setRentMax(event.target.value)}
                    placeholder="Maximum rent"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setSquareMin(event.target.value)}
                    placeholder="Minimum space rent"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setSquareMax(event.target.value)}
                    placeholder="Maximum space rent"
                />
            </div>
            <div class="d-flex justify-content-center">
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setPostal(event.target.value)}
                    placeholder="Postal code"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="Latitude"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="Longitude"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setType(event.target.value)}
                    placeholder="Property Type"
                />
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setStreet(event.target.value)}
                    placeholder="Street name"
                />
            </div>
            <div class="m-2">
                <label for="sort"> Choose sort by: </label>
                <select name="sort" onChange={(event) => setSort(event.target.value)}>
                    <option value=""> -- select an option -- </option>
                    <option value="rent">Rent</option>
                    <option value="areaSqm">Size</option>
                    <option value="rentSqm">Cost per m^2 </option>
                </select>
            </div>
            <div class="m-2">
                <label for="sort" id="order"> Choose order: </label>
                <select onChange={(event) => setOrder(event.target.value)}>
                    <option value=""> -- select an option -- </option>
                    <option value="true">Ascending</option>
                    <option value="false">Descending</option>
                </select>
            </div>
            <div>
                <label for="sort">Choose active rooms only:</label>
                <select onChange={(event) => setIsActive(event.target.value)}>
                    <option value=""> -- select an option -- </option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div class="m-2 d-flex justify-content-center">
                <label for="amount"> Choose amount: </label>
                <input
                    id="amount"
                    type="number"
                    onChange={(event) => setAmount(event.target.value)}
                ></input>
            </div>
            <button
                className="btn btn-primary mx-2 mb-3"
                onClick={getCities}
                style={{ borderRadius: "50px", "font-weight": "bold" }}
            >
                Search
            </button>
            <h5 className="card text-white bg-dark mb-3">Results</h5>
            <div>
                {Object.values(propList)
                    .slice(0, amount)
                    .map((prop) => (
                        <div class="results">
                            <Link
                                to={`/property/${prop.externalId}`}
                                key={prop.externalId}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={prop.coverImageUrl} alt="No picture" />
                            </Link>
                            <p>
                                Price: {prop.rent} <span>&#8364;</span> | Size: {prop.areaSqm} m
                                <span>&#178;</span>
                            </p>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default App;
