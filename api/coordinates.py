from lib2to3.pgen2.parse import ParseError
from geopy.geocoders import Nominatim

geolocation = Nominatim(user_agent="Housing App")

def getCoordinates(data: dict):
        location = geolocation.geocode(data)
        if location is None:
                raise ParseError("Invalid location", 1, None, "Invalid location")
        return location.latitude, location.longitude
