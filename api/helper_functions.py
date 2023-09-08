import json
import logging
from datetime import datetime
import io
import csv
import re
from typing import AsyncGenerator
from fastapi.exceptions import HTTPException
import pandas as pd
import pydantic

from property import Property

_LOGGER = logging.getLogger("uvicorn.error")

def parse_property(house_query: dict) -> None:
        try:   
                del house_query['_id']
        except KeyError:
                _LOGGER.error("No _id in house: %s", house_query)

        for key, value in house_query.items():
                if isinstance(value, datetime):
                        house_query[key] = value.isoformat()
                elif isinstance(value, str):
                        value = re.sub("\\n", "", value)
                        value = re.sub(" +", " ", value)
                        value = re.sub("", "€", value)
                        value = re.sub("^([^\w]|\\[nrtb])+$", "", value)

                        if value == "":
                                value = None
                        house_query[key] = value


def dict_to_csv(data: dict, single: bool = True) -> str:
        x = io.StringIO()
        if single:
                csv.DictWriter(x, data.keys()).writeheader()
                csv.DictWriter(x, data.keys()).writerow(data)
        else:
                f = pd.DataFrame.from_dict(data, orient='index')
                f.to_csv(x, index=False)
        
        return x.getvalue()

async def read_property(stream: AsyncGenerator[bytes, None], content_type: str = "application/json") -> Property:
        d = await read_stream(stream, content_type)
        
        if "postedAgo" not in d.keys():
                d["postedAgo"] = str(datetime.now().isoformat())

        try:
                property = Property.parse_obj(d)
        except pydantic.error_wrappers.ValidationError as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=400, detail="Bad request")
        except Exception as e:
                _LOGGER.error(e)
                raise HTTPException(status_code=500, detail="Internal server error")

        return property

async def read_stream(stream: AsyncGenerator[bytes, None], content_type: str = "application/json") -> dict:
        body = b''
        async for a in stream:
                body += a
        body = body.decode('utf-8')
        

        if content_type == "text/csv":
                df = pd.read_csv(io.StringIO(body))
                d = df.to_dict(orient='records')[0]
        elif content_type == "application/json":
                d = json.loads(body)
        else:
                _LOGGER.error("Unsupported content type: %s", content_type)
                raise HTTPException(status_code=400, detail="Bad request")
        
        return d
