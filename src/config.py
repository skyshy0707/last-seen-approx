import os

from pydantic import BaseModel, Field
from typing import Union

class ExternalApi(BaseModel):

    API_BASE_URL: str = "https://www.googleapis.com/youtube/v3/"
    API_KEY: Union[str, None] = Field(serialization_alias="key", default=os.getenv("API_KEY"))
    max_results: int = 100
    part: Union[str, None] = "snippet"

    class ENDPOINTS:
        activities = "activities"
        channels = "channels"
        commentThreads = "commentThreads"
        search = "search"
        subscriptions = "subscriptions"
        videos = "videos"

class InternalApi(BaseModel):

    API_BASE_URL: str = "http://proxy:80/api/"

    class ENDPOINTS:
        load_activities = "load/activities"
        load_channel = "load/channel"
        load_comments =  "load/comments"
        get_activities = "activities"

class Config(BaseModel):

    POSTGRES_DB_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_DB_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB_HOST: str = os.getenv("POSTGRES_HOST")
    POSTGRES_DB_NAME: str = os.getenv("POSTGRES_DB")
    DB_URL: str = f"postgresql+asyncpg://{POSTGRES_DB_USER}:{POSTGRES_DB_PASSWORD}@{POSTGRES_DB_HOST}/{POSTGRES_DB_NAME}"