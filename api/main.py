from lib2to3.pgen2.parse import ParseError
import logging
import statistics
from typing import Optional

import numpy as np
import pymongo.errors
from fastapi import FastAPI, Header, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.param_functions import Query
from pymongo import MongoClient
from starlette.responses import JSONResponse, Response
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware


from helper_functions import *

import coordinates as coordinates

_LOGGER = logging.getLogger("uvicorn.error") 
_LOGGER.setLevel(logging.INFO)


app = FastAPI()
app.add_middleware(
        CORSMiddleware,
        allow_origins="*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)

try:
        client = MongoClient("webeng-mongo:27017")
        housesDB = client.properties.properties
except Exception as e:
        _LOGGER.critical(e)

default_response_ret = {
        "content": {
                "text/csv": {"example": "a,b,c\n1,2,3"},
                "application/json": {"key": "value"},
        }
}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors()}
    )

@app.get(
        "/api/search",
        summary="Search endpoint",
        responses={
                200: default_response_ret,
                400: {"description": "Bad request"},
                504: {"description": "Gateway timeout"},
                507: {"description": "Insufficient storage"}
        }
)
async def search(city: Optional[str] = None, 
                 street: Optional[str] = None,
                 postalCode: Optional[str] = None,
                 propertyType: Optional[str] = None,  
                 areaSqm: Optional[str] = Query(None, regex="^\d+-\d+$"), 
                 rent: Optional[str] = Query(None, regex="^\d+-\d+$"),
                 isRoomActive: Optional[bool] = None,
                 location: Optional[str] = Query(None, regex="\d+(\.\d+)?-\d+(\.\d+)?"),
                 sortBy: Optional[str] = "externalId", 
                 isAscending: Optional[bool] = True,
                 allowDiskUse: Optional[bool] = False,
                 ignoreCase: Optional[bool] = False,
                 accept: Optional[str] = Header("application/json")): 
        """
        Search for a property in the database. 
        
        You can match regular expressions for certain fields. Expression flags are not supported. The + operator also is not supported due to encoding issues and must be replaced with %2B\n
        The following fields are supported with an example:
        
        - **city**: Amsterdam|Groningen (find all properties where city matches Amsterdam or Groningen)
        - **street**: Hoofd[^laan].* (find all properties where street matches Hoofd... for instance Hoofd, Hoofdweg or Hoofdstraat. But not Hoofdlaan)
        - **postalCode**: 1234[A-Z]{2} (find all properties where postalCode starts with 1234 and ends with any two capital letters)
        - **propertyType**: Room|Apartment (find all properties where propertyType is either room or apartment)

        Ranges are required for the following fields. Ranges are inclusive:
        - **areaSqm**: 100-200 (find all properties where areaSqm is between 100 and 200)
        - **rent**: 100-200 (find all properties where rent is between 100 and 200)
        """

        params = list(locals().items())

        req = {
                **{x[0]: {"$regex": "^" + x[1] + "$", "$options": "i" if ignoreCase else ""} for x in params[0:4] if x[1] is not None},
                **{x[0]: {"$gte": int(x[1].split("-")[0]), "$lte": int(x[1].split("-")[1])} for x in params[4:6] if x[1] is not None}
        }
        
        if isRoomActive is not None:
                req["isRoomActive"] = isRoomActive
        if location is not None:
                req['latitude'] = float(location.split("-")[0])
                req['longitude'] = float(location.split("-")[1])

        if len(req) == 0:
                raise HTTPException(status_code=400, detail="Bad request")

        _LOGGER.debug("request: %s", req)

        try:
                res = housesDB.find(req, allow_disk_use=allowDiskUse).sort(sortBy, 1 if isAscending else -1)
        except (TypeError, pymongo.errors.InvalidOperation) as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=500, detail="Internal server error")

        d = {}
        try:
                for x in res:
                        parse_property(x)
                        d[x['externalId']] = x
        except pymongo.errors.OperationFailure as e:
                _LOGGER.error(e)
                if e.code == 292:
                        raise HTTPException(status_code=507, detail="Insufficient storage")
                elif e.code == 507:
                        raise HTTPException(status_code=504, detail="Gateway timeout")
                elif e.code == 51091:
                        raise HTTPException(status_code=400, detail="Bad request")
                else:
                        raise HTTPException(status_code=500, detail="Internal server error")
        except Exception as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=500, detail="Internal server error")

        if accept == "text/csv":
                return Response(content=dict_to_csv(d, single = False), media_type="text/csv")
        return JSONResponse(content=d)
 

@app.get(
        "/api/property/id/{property_id}",
        summary="Get property by id",
        responses={
                200: default_response_ret,
                404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
        }
)
async def get_property_by_id(property_id: str, accept: Optional[str] = Header("application/json")):

        """
        Returns the resource identified by the given id.
        """

        try:
                house = housesDB.find_one({'externalId': property_id})
        except pymongo.errors.OperationFailure as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=504, detail="Gateway timeout")

        if house is None:
                raise HTTPException(status_code=404, detail="Property not found")

        parse_property(house)

        if accept == "text/csv":
                return Response(content=dict_to_csv(house), media_type="text/csv")
        return JSONResponse(content=house)


@app.post(
        "/api/property/id/{property_id}",
        summary="Add property by id",
        responses={
                201: {"description": "Created"},
                400: {"description": "Bad request"},
                409: {"description": "ID conflict"},
                504: {"description": "Gateway timeout"}
        }
)

async def add_property_by_id(property_id: str, request: Request,
                             Content_Type: Optional[str] = Header("application/json")):

        """
        Adds a property with the given id as the identifier.
        """
        
        if housesDB.find_one({'externalId': property_id}) is not None:
                _LOGGER.debug("ID conflict: %s", property_id)
                raise HTTPException(status_code=409, detail="ID conflict")
        

        await update_property_by_id(property_id, request, Content_Type)
        
        return JSONResponse(status_code=201, content={"message": "Property added"})

@app.put(
        "/api/property/id/{property_id}",
        summary="Update property by id.",
        responses={
                200: {"description": "Updated"},
                404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
        }
)
async def update_property_by_id(property_id: str, request: Request, 
                                Content_Type: Optional[str] = Header("application/json")):

        """
        Updates the property identified by the given id.
        """

        property: Property = await read_property(request.stream(), Content_Type)

        if property_id != property.externalId:
                _LOGGER.info("ID mismatch: %s != %s", property_id, property.externalId)
                raise HTTPException(status_code=400, detail="Bad request")

        if property.latitude is None or property.longitude is None:
                req = {
                        "country": "Netherlands", 
                        "city": property.city, 
                        "street": property.street, 
                        "zipcode": property.postalCode
                }
                try:
                        property.latitude, property.longitude = coordinates.getCoordinates(req)
                except ParseError as e:
                        _LOGGER.debug(e)
                        raise HTTPException(status_code=400, detail="Bad request")

        property_dict = dict(property)

        try:
                housesDB.update_one({'externalId': property_id}, {"$set": property_dict}, upsert=True)
                _LOGGER.debug("Updated %s: %s", property_id, property_dict)
        except pymongo.errors.OperationFailure as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=504, detail="Gateway timeout")
        except Exception as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=500, detail="Internal server error")
        
        return JSONResponse(status_code=200, content={"message": "Property updated"})


@app.delete(
        "/api/property/id/{property_id}",
        summary="Deletes a property from id.",
	responses={
                200: {"description": "Deleted"},
		404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
	}
)
async def delete_property(property_id: str):

        """
        Deletes the property identified by the given id.
        """

        try:
                if housesDB.find_one_and_delete({'externalId': property_id}) is None:
                        raise HTTPException(status_code=404, detail="Id not found")
        except pymongo.errors.OperationFailure as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=504, detail="Gateway timeout")

        return JSONResponse(status_code=200, content={"message": "Property deleted"})

@app.patch(
	"/api/property/coords/{latitude}-{longitude}",
	summary="Updates properties by coordinates.",
	responses={
                200: {"description": "Updated"},
                404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
        }
)
async def update_property_by_coords(longitude: float, latitude: float, request: Request,
                                    Content_Type: str = Header("application/json")):

        """
        Updates all resources present at the given coordinates.

        External ids are used to identify the properties and are not updatable.
        """
        
        d: dict = await read_stream(request.stream(), Content_Type)

        if d is None or "externalId" in d.keys():
                raise HTTPException(status_code=400, detail="Bad request")
        
        _LOGGER.debug("Updating properties by coordinates: (%lf, %lf). With %s", latitude, longitude, d)

        houses = housesDB.find({'latitude': latitude, 'longitude': longitude})
        if houses is None:
                raise HTTPException(status_code=404, detail="Properties not found")

        for house in houses:
                for key, value in d.items():
                        house[key] = value

                try:
                        property = Property(**house)
                except pydantic.error_wrappers.ValidationError as e:
                        _LOGGER.info(e)
                        raise HTTPException(status_code=400, detail="Bad request")

                property = dict(property)
                try:
                        housesDB.update_one({'externalId': property['externalId']}, {"$set": property})
                        _LOGGER.debug("Updated %s: %lf %lf", property['externalId'], latitude, longitude)
                except pymongo.errors.OperationFailure as e:
                        _LOGGER.error(e)
                        raise HTTPException(status_code=504, detail="Gateway timeout")
                except Exception as e:
                        _LOGGER.error(e)
                        raise HTTPException(status_code=500, detail="Internal server error")

        return JSONResponse(status_code=200, content={"message": "Properties updated"})


@app.delete(
        "/api/property/coords/{latitude}-{longitude}",
        summary="Deletes properties from coordinates.",
        responses={
                200: {"description": "Deleted"},
                404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
        }
)
async def delete_house_by_coords(longitude: float, latitude: float):
        """
        Deletes the properties present at the given coordinates.
        """

        req = {
                'latitude': latitude,
                'longitude': longitude
        }
        try:
                if housesDB.delete_many(req).deleted_count == 0:
                        raise HTTPException(status_code=404, detail="Properties not found")
        except pymongo.errors.OperationFailure:
                raise HTTPException(status_code=504, detail="Gateway timeout")
        return JSONResponse(status_code=200, content={"message": "Properties deleted"})

@app.get(
        "/api/city/{city}/statistics",
        summary="Get statistics on a city.",
	responses={
                200: default_response_ret,
                404: {"description": "Not found"},
                504: {"description": "Gateway timeout"}
        }
)
async def get_properties_stats(city: str, accept: Optional[str] = Header("application/json")):
        """
        Returns the statistics of the given city.
        """

        try:
                houses = housesDB.find({'city': {"$regex": "^" + city + "$", "$options": "i"}})
                if houses is None:
                        raise HTTPException(status_code=404, detail="City not found")
        except pymongo.errors.OperationFailure:
                raise HTTPException(status_code=504, detail="Gateway timeout")

        prices = np.array([])
        deposit = np.array([])
        res = {}
        for house in houses:
                if 'rent' in house and house['rent'] is not None:
                        prices = np.append(prices, house['rent'])
                if 'deposit' in house and house['deposit'] is not None:
                        deposit = np.append(deposit, house['deposit'])

        res['meanPrice'] = statistics.mean(prices)
        res['medianPrice'] = statistics.median(prices)
        res['sdPrice'] = statistics.stdev(prices)
        res['meanDeposit'] = statistics.mean(deposit)
        res['medianDeposit'] = statistics.median(deposit)
        res['sdDeposit'] = statistics.stdev(deposit)
        
        if accept == "text/csv":
                return Response(content=dict_to_csv(res), media_type="text/csv")
        return JSONResponse(content=res)
