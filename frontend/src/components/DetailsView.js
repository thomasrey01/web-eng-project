import PropertyItem from "./Property";
import React, { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
// import '../Ap'

function DetailsView() {
    /**
     * Allows for the update and deletion of of properties by coordinates.
     */

    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [propertyType, setType] = useState("");
    const [rent, setRent] = useState(0);
    const [size, setSize] = useState(0);
    const [desc, setDesc] = useState("");
    const [propList, setProps] = useState("");
    const [deleted, setDeleted] = useState(false)

    const deleteProperty = () => {
        let url = `http://localhost:8000/api/property/coords/${latitude}-${longitude}`
        axios.delete(url).then(res => console.log(res.data))
        setDeleted(true)
    }

    const updateProperty = () => {
        let req = {}
        if (propertyType !== "")
            req['propertyType'] = propertyType

        if (rent != 0)
            req['rent'] = rent

        if (size != 0) {
            req['areaSqm'] = size
        }
        if (desc !== "") {
            req['descriptionTranslated'] = desc
        }
        let url = `http://localhost:8000/api/property/coords/${latitude}-${longitude}`
        axios.patch(
            url,
            req
        )
        axios.get(
            `http://localhost:8000/api/search?location=${latitude}-${longitude}&allowDiskUse=false&ignoreCase=true`
        ).then((res) => {
            console.log(res.data)
            setProps(res.data)
        })
    }

    if (deleted)
        return (<Navigate to="/" />)

    return (
        <div className="App">
            <Link class="m-2" to="/" style={{ textDecoration: 'none' }}>Home</Link>

            <h1
                className="card text-white bg-primary mb-1"
                styleName="max-width: 20rem;"
            >
                Update Properties by coordinates
            </h1>

            <h5 className="card text-white bg-dark mb-3">Search properties</h5>
            <div class="d-flex justify-content-center">
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
            </div>
            <h5 className="card text-white bg-dark mb-3">Updates</h5>

            <div class="d-flex justify-content-center">
                <input
                    className="m-2 form -control titleIn"
                    onChange={(event) => setType(event.target.value)}
                    placeholder="Property Type"
                />
                <input
                    type="number"
                    className="m-2 form -control titleIn"
                    onChange={(event) => setRent(event.target.value)}
                    placeholder="Rent"
                />
                <input
                    type="number"
                    className="m-2 form -control titleIn"
                    onChange={(event) => setSize(event.target.value)}
                    placeholder="Size"
                />
            </div>
            <div>
                <textarea id="w3review" name="w3review" rows="4" cols="50" placeholder="Type in details"
                    onChange={(event) => setDesc(event.target.value)}>

                </textarea>
            </div>
            <h5 className="card text-white bg-dark mb-3">Actions</h5>
            <div class="d-flex justify-content-center">
                <button
                    className="btn btn-primary my-2 mx-2"
                    onClick={updateProperty}
                    style={{ borderRadius: "50px", "font-weight": "bold" }}
                >
                    Update
                </button>
                <button
                    className="btn btn-danger my-2 mx-2"
                    onClick={deleteProperty}
                    style={{ borderRadius: "50px", "font-weight": "bold" }}
                >
                    Delete
                </button>
            </div>
            <h5 className="card text-white bg-dark mb-3">Results</h5>
            <div id="results">
                {Object.values(propList)
                    .slice(0, 100)
                    .map(
                        (prop) => (
                            (
                                <Link to={`/property/${prop.externalId}`} key={prop.externalId}>
                                    <img src={prop.coverImageUrl} alt="No picture" />
                                </Link>
                            )
                        )
                    )}
            </div>
        </div>
    )
}

export default DetailsView
