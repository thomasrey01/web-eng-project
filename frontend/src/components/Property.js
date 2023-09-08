import axios from "axios";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, Navigate } from "react-router-dom"
import '../App.css'

function PropertyItem(props) {
  /**
   * Displays a property page and allows for deletion/updating of property.
   */

  let params = useParams()
  const [prop, setProp] = React.useState(null)
  const [title, setTitle] = useState('')
  const [lat, setLat] = useState('')
  const [long, setLong] = useState('')
  const [size, setSize] = useState(0)
  const [price, setPrice] = useState(0)
  const [street, setStreet] = useState('')

  let url = `http://localhost:8000/api/property/id/${params.externalId}`;

  const deleteProp = () => {
    axios.delete(url).then(res => console.log(res.data))
    setDeleted(true)
  }

  const updateProp = () => {
    if (title !== '') 
      prop['pageTitle'] = title
    
    if (lat !== '') 
      prop['latitude'] = lat
    
    if (long !== '') 
      prop['longitude'] = long
    
    if (size != 0) 
      prop['areaSqm'] = size
    
    if (price != 0) 
      prop['rent'] = price
    
    if (street !== '') 
      prop['street'] = street
    

    axios.put(
      url,
      prop
    ).then((res) => {
      console.log(res)
      window.location.reload()
    })
  }

  React.useEffect(() => {
    axios.get(url).then((response) => {
      setProp(response.data);
    });
  }, []);

  const [deleted, setDeleted] = useState(false)


  if (!prop) return null;

  if(deleted)
    return (<Navigate to="/" />)

  return (
    
    <div className="Property" style={{ color: 'white' }}>
     <Link class="m-2" to="/" style={{ textDecoration: 'none' }}>Home</Link>
      <h1
        className="card text-white bg-primary mb-1"
        styleName="max-width: 20rem;"
      >
        {prop.pageTitle}
      </h1>
      <img src={`${prop.coverImageUrl}`} alt="" />
      <div>
        <p>Price: {prop.rent} <span>&#8364;</span></p>
        <p>City:  {prop.city}</p>
        <p>Area m<span>&#178;</span>: {prop.areaSqm}</p>
        <p>Furnished: {prop.furnish}</p>
        <p>Deposit: {prop.deposit}</p>
        <p>Street: {prop.street}</p>
        <p>Postal code: {prop.postalCode}</p>
        <p>Energy label: {prop.energyLabel}</p>
        <p>Description: {prop.descriptionTranslated}</p>
        <p>Latitude: {prop.latitude}</p>
        <p>Longitude: {prop.longitude}</p>
      </div>
      <div class="d-flex justify-content-center">
        <input className="mb-2 form -control titleIn"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
        />
        <input className="mb-2 form -control titleIn"
          onChange={(event) => setLat(event.target.value)}
          placeholder="Latitude"
        />
        <input className="mb-2 form -control titleIn"
          onChange={(event) => setLong(event.target.value)}
          placeholder="Longitude"
        />
        <input className="mb-2 form -control titleIn"
          type="number"
          onChange={(event) => setSize(event.target.value)}
          placeholder="Size"
        />
        <button
          className="btn btn-primary my-2 mx-2"
          onClick={updateProp}
          style={{ borderRadius: "50px", "font-weight": "bold" }}
        >
          Update
        </button>
        <button
          className="btn btn-danger my-2 mx-2"
          onClick={deleteProp}
          style={{ borderRadius: "50px", "font-weight": "bold" }}
        >
          Delete
        </button>
      </div>
      <div class="d-flex justify-content-center">
      <input className="mb-2 form -control titleIn"
          type="number"
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Price"
        />
        <input className="mb-2 form -control titleIn"
          onChange={(event) => setStreet(event.target.value)}
          placeholder="Street"
        />
      </div>
    </div>

  );
}


export default PropertyItem;
