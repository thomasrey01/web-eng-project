import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import $ from "jquery";
import axios from "axios";

function AddProperty() {
  const [id, setID] = useState("");

  let printForm = () => {
    let formData = ($("#addForm").serializeArray());
    let newRoom = {}
    for (let data of formData) {
      if (data.value !== "")
        newRoom[`${data.name}`] = `${data.value}`
    }

    console.log(newRoom)
    axios
      .post(`http://localhost:8000/api/property/id/${id}`, newRoom)
      .then((res) => window.open(`http://localhost:3000/property/${id}`));
      
  };

  return (
    <div className="AddProperty">
      <Link to="/" style={{ textDecoration: "none" }}>Home</Link>
      <div class="d-flex justify-content-center">
        <form
          action={`http://localhost:8000/api/property/id/${id}`}
          method="POST"
          id="addForm"
          name="addForm"
        >
          <label for="externalId">External ID*</label>
          <input
            type="text"
            id="externalId"
            name="externalId"
            required
            onChange={(event) => setID(event.target.value)}
          />

          <label for="size">Size m<span>&#178;</span>*</label>
          <input type="number" id="size" required name="areaSqm" />

          <label for="city">City*</label>
          <input type="text" id="city" required name="city" />

          <label for="furnish">Furnished*</label>
          <input type="text" id="furnish" name="furnish" required />

          <label for="postal">Postal Code*</label>
          <input type="text" id="postal" name="postalCode" required />

          <label for="type">Property Type*</label>
          <input type="text" id="type" name="propertyType" required />

          <label for="availability">Availability*</label>
          <input type="text" id="availability" name="rawAvailability" required />

          <label for="price">Price*</label>
          <input type="number" id="price" name="rent" required />

          <label for="rentdetail">Rent Detail*</label>
          <input type="text" id="rentdetail" name="rentDetail" required />

          <label for="source">Source*</label>
          <input type="text" id="source" name="source" required />

          <label for="title">Street name*</label>
          <input type="text" id="title" name="street" required />

          <label for="image">Image URL</label>
          <input type="text" id="image" name="coverImageUrl" />

          <label for="url">URL</label>
          <input type="text" id="url" name="url" />

          <label for="additional">Additional Costs</label>
          <input type="number" step="0.01" id="additional" name="additionalCosts" />

          <label for="deposit">Deposit</label>
          <input type="number" step="0.01" id="deposit" name="deposit" />

          <label for="desctranslated">Description Translated</label>
          <input type="text" id="desctranslated" name="descriptionTranslated" />

          <label for="energy">Energy Label</label>
          <input type="text" id="energy" name="energyLabel" />

          <label for="gender">Gender</label>
          <input type="text" id="gender" name="gender" />

          <label for="internet">Internet</label>
          <input type="text" id="internet" name="internet" />

          <label for="isroomactive">Is Room Active</label>
          <input type="text" id="isroomactive" name="isRoomActive" />

          <label for="kitchen">Kitchen</label>
          <input type="text" id="kitchen" name="kitchen" />

          <label for="living">Living</label>
          <input type="text" id="living" name="living" />

          <label for="matchage">Match Age</label>
          <input type="text" id="matchage" name="matchAge" />

          <label for="matchcapacity">Match Capacity</label>
          <input type="text" id="matchcapacity" name="matchCapacity" />

          <label for="matchgender">Match Gender</label>
          <input type="text" id="matchgender" name="matchGender" />

          <label for="matchlanguages">Match Languages</label>
          <input type="text" id="matchlanguages" name="matchLanguages" />

          <label for="matchstatus">Match Status</label>
          <input type="text" id="matchstatus" name="matchStatus" />

          <label for="pagedescription">Page Description</label>
          <input type="text" id="pagedescription" name="pageDescription" />

          <label for="pagetitle">Page Title</label>
          <input type="text" id="pagetitle" name="pagetitle" />

          <label for="pets">Pets</label>
          <input type="text" id="pets" name="pets" />

          <label for="regcost">Registration Cost</label>
          <input type="text" id="regcost" name="registrationCost" />

          <label for="roommates">Roommates</label>
          <input type="text" id="roommates" name="roommates" />

          <label for="shower">Shower</label>
          <input type="text" id="shower" name="shower" />

          <label for="smokingin">Smoking inside</label>
          <input type="text" id="smokingin" name="smokingInside" />

          <label for="toilet">Toilet</label>
          <input type="text" id="toilet" name="toilet" />

          <label for="addcostdescr">Additional Cost Description</label>
          <input type="text" id="addcostdescr" name="additionalCostsDescription" />

        </form>
        <div>

        </div>
      </div>
      <div>
        <button class="btn btn-primary mt-3 mb-3" onClick={printForm}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default AddProperty;
