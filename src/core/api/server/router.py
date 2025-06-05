from typing import Union
from fastapi import APIRouter, Depends, Query

from core.api.server import crud
from core.api.schemes import load_params, schemes
from core.logger import setup_logger
from db import models

logger = setup_logger(__name__)

class Router:

    def __init__(self):
        self.router = APIRouter()
        self.setup_routes()

    def setup_routes(self):
        pass

class ServerAPI(Router):

    def setup_routes(self):
        
        @self.router.get(
            "/last-seen",
            response_model=Union[schemes.Activity, schemes.Comment, None]
        )
        async def last_seen(username: str=Query()):
            return await crud.get_last_user_activity(username)
        
        @self.router.get(
            "/sign-up",
            response_model=schemes.Profile
        )
        async def signup(email: str=Query()):
            return await crud.get_user_profile(email)
        
        @self.router.put(
            "/update-profile",
            response_model=schemes.Profile
        )
        async def update_profile(scheme: schemes.Profile):
            return await crud.update_user_profile(scheme)
        
class ExternalAPI(Router):

    def setup_routes(self):

        @self.router.get("/oauth2", response_model=schemes.ForceSSLAuth)
        async def get_cred():
            return schemes.ForceSSLAuth

        @self.router.post("/load/channel")
        async def load_channel(
            scheme: schemes.create_item_list_model(schemes.Channel),
        ):
            logger.info(f"ENTER IN LOAD CHANNEL ENDPOINT... SCHEME DATA: {scheme}")
            return (
                await crud.load_api_data_from_list(
                    scheme,
                    models.Channel
                )
            )

        @self.router.post("/load/activities")
        async def load_activities(
            scheme: schemes.create_item_list_model(schemes.Activity, *[schemes.ActivityList]),
        ):
            return (
                await crud.load_api_data_from_list(
                    scheme,
                    models.Activity
                )
            )

        @self.router.post("/load/comments")
        async def load_comments(
            scheme: schemes.create_item_list_model(schemes.Comment, *[schemes.CommentList]),
            match_load_params = load_params.match_load_params,
            not_early_by_datetime_field: Union[str, None]=None,
        ):
            return await crud.load_api_data_from_list(
                scheme,
                models.Comment,
                match_load_params,
                not_early_by_datetime_field
            )
        
        @self.router.get(
            "/activities",
            response_model=schemes.create_pagination_response_model(schemes.Activity)
        )
        async def get_activities(
            params: load_params.SearchActivities = Depends(),
        ):
            return await crud.search_user_activities(params)

external_api = ExternalAPI()
server_api = ServerAPI()