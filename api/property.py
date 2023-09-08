from typing import Optional
from pydantic import BaseModel

class Property(BaseModel):
	externalId: str
	areaSqm: int
	city: str
	furnish: str
	latitude: float = None
	longitude: float = None
	postalCode: str
	propertyType: str
	rawAvailability: str
	rent: int
	rentDetail: str = None
	source: str
	street: str
	coverImageUrl: Optional[str] = None
	url: Optional[str] = None
	additionalCosts: Optional[float] = None
	deposit: Optional[float] = None
	descriptionTranslated: Optional[str] = None
	energyLabel: Optional[str] = None
	gender: Optional[str] = None
	internet: Optional[str] = None
	isRoomActive: Optional[str] = None
	kitchen: Optional[str] = None
	living: Optional[str] = None
	matchAge: Optional[str] = None
	matchCapacity: Optional[str] = None
	matchGender: Optional[str] = None
	matchLanguages: Optional[str] = None
	matchStatus: Optional[str] = None
	pageDescription: Optional[str] = None
	pageTitle: Optional[str] = None
	pets: Optional[str] = None
	registrationCost: Optional[str] = None
	roommates: Optional[str] = None
	shower: Optional[str] = None
	smokingInside: Optional[str] = None
	toilet: Optional[str] = None
	additionalCostsDescription: Optional[str] = None
