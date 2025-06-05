import json

from typing import Annotated, List, Union

from fastapi import Query
from pydantic import AliasPath, BaseModel, Field, JsonValue, field_validator

from core.logger import setup_logger

logger = setup_logger(__name__)

    
def serializer(data: dict, deep=False):

    complex_types = [dict, list]
    is_complex_data = lambda data: any(map(lambda v: v in complex_types, map(type, data)))

    if type(data) not in complex_types:
        return data
    if type(data) == dict:
        if is_complex_data(data.values()):
            for param, value in data.items():
                data.update({
                    param: serializer(value, deep=True)
                })

    elif type(data) == list:
        if is_complex_data(data):
            return [
                serializer(v, deep=True) if type(v) in complex_types else v for v in data
            ]
        
    return json.dumps(data) if deep and type(data) == dict else data


class MatchLoadParams(BaseModel):
    author_channel_id: str

class MatchLoadParamsData(BaseModel):
    match_load_params: MatchLoadParams = Field(default_factory=dict)

class Pagination(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)

class CommonQueryParams(BaseModel):
    pagination: JsonValue = Field(Query(default_factory=Pagination().model_dump_json))

    @field_validator('pagination')
    @classmethod
    def validate_pagination(cls, value):
        return Pagination(**json.loads(value))

class SearchActivities(CommonQueryParams):
    channel_id: Union[str, None] = Field(Query(None))
    type: List[str] = Field(Query([]))
    deleted: Union[bool, None] = Field(Query(None))

class FindSubscription(BaseModel):
    channelId: str = Field(validation_alias=AliasPath("author_channel_id"))
    forChannelId: str = Field(validation_alias=AliasPath("channel_id"))

class FindUpload(BaseModel):
    id: str = Field(validation_alias=AliasPath("video_id"))

match_load_params = Annotated[MatchLoadParamsData, Query()]