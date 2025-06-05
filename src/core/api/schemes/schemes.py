from datetime import datetime
from typing import Annotated, Any, ForwardRef, List, Union

from google.auth.transport import requests
import google.oauth2.credentials
from google.oauth2 import service_account
from pydantic import (
    AliasChoices, AliasGenerator, AliasPath, 
    BaseModel, ConfigDict, EmailStr, Field, ValidationInfo,
    WrapSerializer, computed_field, field_validator, model_serializer
)
from pydantic.fields import FieldInfo
from pydantic.main import create_model

from core.api.schemes import fieldpaths
from core.api.schemes import validators
from core.api.schemes.load_params import Pagination
from db.models import ActivityTypes

from core.logger import setup_logger

logger = setup_logger(__name__)

scopes = [
    "https://www.googleapis.com/auth/youtube.force-ssl"
]
service_account_file = "./././last-seen-approx-465f9889212b.json"

def seek(object, field_name):
    field_path = fieldpaths.find_path(object, field_name)
    return field_path.get_path(field_name)


class ObjectList(BaseModel):
    items: List[Any]

    @model_serializer
    def seialize_list(self):
        return self.items
    
class ChannelId(BaseModel):
    channel_id: str

class ActivityList(ObjectList, ChannelId):

    @field_validator('items', mode='before')
    @classmethod
    def serialize_items(cls, value: List[Any], info: ValidationInfo):

        channel_id = info.data.get('channel_id')
        items = []
        for item in value:
            item['author_channel_id'] = channel_id
            items.append(item)
        return items
    
class CommentList(ObjectList):

    @model_serializer
    def seialize_list(self):
        items = []

        for item in self.items:
            items.extend(item.replies)
            items.append(item)
            
        return items
    

def create_item_list_model(model: BaseModel, *bases) -> BaseModel:
    type_ = List[model]
    return create_model(
        "Items",
        __base__=type(
            "ObjectList", (
                *bases, ObjectList,
            ), {}
        ),
        **{
            "items": (
                type_,
                FieldInfo(
                    annotation=type_
                )
            )
        }
    )

def create_pagination_response_model(model):
    items_type = List[model]
    total_type = Annotated[int, Field(0, ge=0)]
    return create_model(
        "Items",
        __base__=Pagination,
        **{
            "items": (
                items_type,
                FieldInfo(
                    annotation=items_type
                )
            ),
            "total": (
                total_type,
                FieldInfo(
                    annotation=total_type,
                )
            )
        }
    )
    
def extract_id_value(data: Any, handler: callable, info: Union[dict, None]) -> Union[int, str, None]:
    partial_result: dict = handler(data, info)
    return partial_result.get("id")


class ForceSSLAuth(BaseModel):

    class Meta:
        @classmethod
        def get_creds(cls):
            creds = service_account.Credentials.from_service_account_file(
                service_account_file, scopes=scopes
            )
            creds.refresh(requests.Request())
            return creds

    creds: Any = Field(default_factory=Meta.get_creds, exclude=True)

    @computed_field(return_type=str)
    @property
    def token(self):
        return self.creds.token

class Channel(BaseModel):

    id: str
    title: str
    description: str
    custom_url: str
    published_at: datetime
    country: Union[str, None] = None

    model_config = ConfigDict(alias_generator=AliasGenerator(
        validation_alias=lambda field_name: seek("channel", field_name))
    )

Comment = ForwardRef('Comment')
class Comment(BaseModel):

    id: str
    author_channel_id: str
    video_id: Union[str, None] = None
    text_display: str
    text_original: str
    published_at: datetime
    updated_at: datetime
    top_level_comment: Union[str, None] = None
    replies: List[Comment] = Field(default_factory=list, exclude=True)


    model_config = ConfigDict(alias_generator=AliasGenerator(
        validation_alias=lambda field_name: seek("comment", field_name))
    )
Comment.model_rebuild()

class Activity(BaseModel):

    id: str
    channel_id: str
    author_channel_id: str
    video_id: Union[str, None] = None
    published_at: datetime
    type: str
    deleted: bool = False

    @field_validator("type")
    @validators.validate_accepted_type(choices=ActivityTypes)
    def type_validator(self, value, **kwargs):
        pass

    @field_validator("channel_id", mode="before")
    @classmethod
    def channel_id_validator(cls, value, info: ValidationInfo):
        return validators.validate_channel_id(value, info)

    model_config = ConfigDict(alias_generator=AliasGenerator(
        validation_alias=lambda field_name: seek("activity", field_name))
    )

class VideoId(BaseModel):
    id: str = Field(validation_alias=AliasChoices("id", AliasPath("id", "videoId")))

VideoIdItem = Annotated[VideoId, WrapSerializer(extract_id_value)]

class VideosId(BaseModel):
    items: List[VideoIdItem]

class Profile(BaseModel):
    email: EmailStr
    last_check: datetime = datetime.fromisoformat("1970-01-01T00:00:00")