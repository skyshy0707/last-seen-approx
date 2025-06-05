import copy
import json
import sys
from typing import Tuple, Union

from fastapi import status
import requests

from config import ExternalApi, InternalApi
from core.api.schemes import load_params, schemes
from core.logger import setup_logger
from db.dao import set_activity_delete_flag

logger = setup_logger(__name__)

external = ExternalApi()
internal = InternalApi()
EXTERNAL_API_URL = external.API_BASE_URL
INTERNAL_API_URL = internal.API_BASE_URL

def refresh_headers(oauth2: bool=False):
    if not oauth2:
        return
    
    auth_response, status_code = mk_request(
        f"{INTERNAL_API_URL}oauth2",
        "GET"
    )

    if status_code != status.HTTP_200_OK:
        return None
    
    return { "Authorization": f"Bearer {auth_response.get('token')}" }
    
def mk_request(
        endpoint: str, 
        method: str="GET",
        body: Union[dict, None]=None,
        params: dict=dict(),
        oauth2: bool=False
    ) -> Tuple[dict, int]:
    
    query_params = external.model_dump(by_alias=True)
    params = load_params.serializer(params)
    query_params.update(params)

    while True:

        try:
            logger.info(f"REQUEST BEGIN. METHOD: {method} URL: {endpoint}, PARAMS: {query_params}, DATA: {body}")
            response = requests.request(method, endpoint, params=query_params, json=body, headers=refresh_headers(oauth2))
            logger.info(f"Operation end with response: {response}. Details: Reason: {response.reason}, Text: {response.text}")
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"ConnectionError Details: : {e}")
            continue
        try:
            data = response.json()
        except json.decoder.JSONDecodeError as e:
            logger.warning(f"Incorrect JSON. Details: {e}")
            continue
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"Connection break. Details: {e}")
            continue
        except requests.exceptions.MissingSchema as e:
            logger.warning(f"Missing Schema. Details: {e}")
            continue
        except requests.exceptions.ChunkedEncodingError as e:
            logger.warning(f"All chuncks are not retrieved. Details: {e}")
            continue
        else:
            return data, response.status_code
        
def get_channel_id(username: str , load_channel: bool=True) -> str:

    channel_loader = LoadChannels(username)
    channel, _ = channel_loader.load_objects_from()
    channel_data = schemes.Channel(**channel).model_dump()
    logger.info("OBTAINED CHANNEL DATA...")
    if load_channel:
        channel_loader.load_objects_to(channel)
    return channel_data.get("id")


class Load:

    fr: str
    to: str
    _load_from_params: dict = { "pageToken": None }
    _load_to_params: dict = dict()
    load_from_params: dict
    load_to_params: dict
    oauth2: bool = False

    def __init__(self, *args, **kwargs):
        self.fr = f"{EXTERNAL_API_URL}{self.fr}"
        self.to = f"{INTERNAL_API_URL}{self.to}"
        self.load_from_params = copy.copy(self._load_from_params)
        self.load_to_params = copy.copy(self._load_to_params)

    def load_objects_from(self, page_token: Union[str, None]=None):
        self.load_from_params.update(
            { "pageToken": page_token }
        )
        return mk_request(
            self.fr,
            "GET",
            params=self.load_from_params,
            oauth2=self.oauth2
        )
    
    def load_objects_to(self, objects: dict, **kwargs):
       
        return mk_request(
            self.to,
            "POST",
            objects,
            self.load_to_params
        )
    
    def __call__(self):
        logger.info("CALLING LOADER...")
        page_token = None
        operation_name = self.__class__.__name__
        while True:
            objects, _ = self.load_objects_from(page_token)
            data, status_code = self.load_objects_to(
                objects
            )
            page_token = objects.get("nextPageToken")
            logger.info(f"//POST// Operation end with status code: {status_code}")
            logger.info(f"RESULTS OF POST OPERATION: {data}")
            if not page_token or status_code == status.HTTP_409_CONFLICT:
                logger.info(
                    f"Operation {operation_name} "\
                    "for adding objects end with success "\
                    f"// Details: page_token: {page_token}, status_code: {status_code}"
                )
                break

class LoadChannels(Load):

    fr = external.ENDPOINTS.channels
    to = internal.ENDPOINTS.load_channel

    def __init__(self, username: str):
        super().__init__(username)

        if username.startswith("@"):
            self.load_from_params.update({
                "forHandle": username
            })
        else:
            self.load_from_params.update({
                "id": username
            })

class LoadActivities(Load):

    fr = external.ENDPOINTS.activities
    to = internal.ENDPOINTS.load_activities

    _load_from_params = {
        "part": "contentDetails,id,snippet"
    }
    
    def __init__(self, channel_id):
        super().__init__(channel_id)

        self.load_from_params.update({
            "channelId": channel_id
        })

    def load_objects_from(self, page_token: Union[str, None]=None):
        objects, status_code = super().load_objects_from(page_token)
        if status_code == status.HTTP_200_OK:
            objects["channel_id"] = self.load_from_params.get("channelId")
        return objects, status_code
    
class LoadComments():

    def __new__(cls, *args, **kwargs):
        for param in kwargs.keys():
            if param != "channel_id":
                break
        class_name = "Load" + "".join(
            (type_word.title() for type_word in param.split("_")[:-1])
        ) + "Comments"

        try:
            loader: Load = getattr(sys.modules[__name__], class_name)
        except AttributeError as e:
            raise AttributeError(f"Loader class {class_name} are not exist. Details: {e}")
        return loader

class LoadCommentsBase(Load):
    fr = external.ENDPOINTS.commentThreads
    to = internal.ENDPOINTS.load_comments

    oauth2 = True

    _load_from_params = {
        "part": "snippet,replies"
    }

    _load_to_params = {
         "not_early_by_datetime_field": "published_at"
    }

    def __init__(self, channel_id, *args, **kwargs):
        super().__init__(channel_id, *args, **kwargs)

        self.load_to_params.update({
            "match_load_params": { "author_channel_id": channel_id }
        })
        self.load_from_params.update({
            "videoId": kwargs.get("video_id")
        })

class LoadChannelComments(LoadCommentsBase):

    def __init__(self, channel_id, **kwargs):
        super().__init__(channel_id, **kwargs)

        self.load_from_params.update({
            "allThreadsRelatedToChannelId": channel_id,
        })

class LoadVideoComments(LoadCommentsBase):

    def __init__(self, channel_id, video_id, **kwargs):
        super().__init__(channel_id, video_id=video_id, **kwargs)

        self.load_from_params.update({
            "videoId": video_id,
        })

class LoadChannelVideos(Load):
    fr = external.ENDPOINTS.search
    to = None
    oauth2 =True

    _load_from_params = {
        "type": "video"
    }

    def __init__(self, channel_id):
        super().__init__(channel_id)
        
        self.load_from_params.update({
            "channelId": channel_id
        })

    def load_related_comments(self, **kwargs):
        page_token = None
        while True:
            data, status_code = self.load_objects_from(page_token)
            page_token = data.get("nextPageToken")

            video_ids = schemes.VideosId(
                **data
            ).model_dump()

            for video_id in video_ids:
                load_comments(
                    video_id=video_id,
                    **kwargs
                )

            if not page_token:
                break

def load_activities(channel_id: str):

    load = LoadActivities(channel_id)
    load()

def load_comments(**kwargs):
    assert len(kwargs) != 0, "No one parameter to load comments was specified"
    assert len(kwargs) <= 2, "Incopatible parameters:" + "".join(
        ((param, ',') for param in tuple(kwargs.keys())[2:]) 
    )

    loader = LoadComments(**kwargs)
    load = loader(**kwargs)
    load()

def load_user_comments_from_videos(channel_id_related_to_videos: str, user_channel_id: str):
    video_loader = LoadChannelVideos(channel_id_related_to_videos)
    video_loader.load_related_comments(channel_id=user_channel_id)


class find_activity:

    def __new__(cls, activity_data, *args, **kwargs):

        activity_type = activity_data.get("type")
        
        try:
            finder: FindActivity = type(
                "setted_finder", (getattr(sys.modules[__name__], "Find" + activity_type.title()),), {}
            )
        except AttributeError as e:
            return None

        finder.initial_data = activity_data
        finder.search_params = finder.search_params(**activity_data).model_dump()
        return finder
    
class FindActivity():

    url: str
    search_params: schemes.BaseModel
    initial_data: dict
    oauth2 = True

    @classmethod
    def __call__(self, *args, **kwargs):

        return mk_request(
            self.url,
            "GET",
            params=self.search_params,
            oauth2=self.oauth2
        )
    
    @classmethod
    def is_exist(self):
        data, _ = self.__call__()
        exist = data.get("items")

        if not exist:
            set_activity_delete_flag(self.initial_data.get("id"))
        
        return exist

class FindSubscription(FindActivity):

    url: str = f"{EXTERNAL_API_URL}{external.ENDPOINTS.subscriptions}"
    search_params: schemes.BaseModel = load_params.FindSubscription

class FindUpload(FindActivity):

    url: str = f"{EXTERNAL_API_URL}{external.ENDPOINTS.videos}"
    search_params: schemes.BaseModel = load_params.FindUpload