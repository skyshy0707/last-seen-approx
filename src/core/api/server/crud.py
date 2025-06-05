import json

from typing import List, Union
from pydantic import BaseModel

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.decl_api import DeclarativeMeta

from core.api import loaders
from core.api.common import responses
from core.api.common.paginator import paginate_qs
from core.api.schemes import schemes
from core.logger import setup_logger
from core.api.loaders import find_activity
from db import dao
from db.engine import async_session_maker
from db.models import Activity, Comment

from config import InternalApi

logger = setup_logger(__name__)
service = InternalApi()


def is_match(data: dict, what_match: dict):
    middle_condition = True

    for param, value in what_match.items():
        data_value = data.get(param)
        if type(data_value) == dict:
            middle_condition = is_match(data_value, value)
        elif type(data_value) == list:
            if type(value) != dict:
                value = dict()
            for item in data_value:
                middle_condition = is_match(item, value)
                if middle_condition:
                    break
        elif data_value != value or not middle_condition:
            return False
    return True

async def load_api_data_from_list(
    data: BaseModel, 
    db_model: DeclarativeMeta, 
    match_load_params: dict=dict(), 
    not_early_by_datetime_field: str=None
):
    success_loaded_instances = 0

    if match_load_params:
        match_load_params = json.loads(match_load_params)

    logger.info(f"MATCH LOAD PARAMS AFTER LOAD PERFORM: {match_load_params}")
    compared_instance = await dao.get_last_object_by_params(
        db_model=db_model, 
        match_load_params=match_load_params, 
        order_by=not_early_by_datetime_field
    )

    for item in data.model_dump():

        logger.info(f"Item {db_model.__tablename__} with data: {item}")
        instance: DeclarativeMeta = db_model(**item)
        
        async with async_session_maker() as session:
            async with session.begin():
                try: 
                    session.add(instance)
                except Exception as e:
                    logger.warning(f"//ADD// OPERATION IN LOOP CAUSE TO ERROR: {e}")

                if not match_load_params:
                    if not_early_by_datetime_field:
                        if compared_instance and item[not_early_by_datetime_field] < getattr(
                            compared_instance, not_early_by_datetime_field
                        ):
                            break
                
                if is_match(item, match_load_params):
                    if not compared_instance or item[not_early_by_datetime_field] >= getattr(
                        compared_instance, not_early_by_datetime_field
                    ) or not match_load_params:
                        
                        try:
                            await session.commit()
                        except SQLAlchemyError as e:
                            message = e._message()
                            if responses.UNIQUE_CONSTRAINT_FAILED in message:
                                return responses.SEVERAL_NEW_OBJECTS_ARE_ADDED(success_loaded_instances) if success_loaded_instances \
                                else responses.EARLIER_OBJECT_THE_EXISTING_ONE
                            raise responses.DATA_ERROR(db_model, message)
                        except Exception as e:
                            logger.warning(f"COMMIT OPERATION IN LOOP CAUSE TO ERROR: {e}")
                        if match_load_params:
                            return responses.LAST_OBJECT_WAS_ADDED(item)
                        else:
                            logger.info(f"Item {item} was successful added")
                            success_loaded_instances += 1
                    else:
                        session.expunge(instance)
                else:
                    session.expunge(instance)

    return responses.SEVERAL_NEW_OBJECTS_ARE_ADDED(success_loaded_instances) if success_loaded_instances \
    else responses.WITHOUT_ERRORS_BUT_OBJECTS_NOT_MATCH
    

async def search_user_activities(params) -> dict:
    instances = await dao.search_activities(params)
    return paginate_qs(instances, params.pagination)


def load_user_activity_data(username: str):
    logger.info("BEGIN LOAD COMMENTS...")
    channel_id = loaders.get_channel_id(username)
    logger.info(f"CHANNEL_ID VALUE {channel_id} GOT...")
    loaders.load_comments(channel_id=channel_id)
    loaders.load_activities(channel_id)

    offset = 0
    params = { 
        "channel_id": channel_id,
        "deleted": False,
        "type": ["subscription", "upload"]
    }

    while True:
        activities_data, status_code = loaders.mk_request(
            f"{service.API_BASE_URL}{service.ENDPOINTS.get_activities}",
            params=params
        )
        logger.info(f"status_code: {status_code}, Activities DATA: {activities_data}")
        activities: List[dict] = activities_data.get("items", [])

        for activity in activities:

            channel_id_related_to_videos = activity.get("channel_id")
            activity_type = activity.get("type")
            user_activity = find_activity(activity)

            if user_activity and not user_activity.is_exist():
                continue

            if activity_type == "subscription":

                loaders.load_user_comments_from_videos(
                    channel_id_related_to_videos, channel_id
                )

            elif activity_type == "upload":
                loaders.load_comments(
                    channel_id=channel_id, 
                    video_id=activity.get("video_id")
                )

        if not activities:
            break 
        offset += activities_data.get("offset")
        params["pagination"] = json.dumps({ "offset": offset })


def load_user_activity(get_last_activity: callable):
    logger.info("BEGIN GET ACTIVITY DATA...")
    async def _wrapper(username: str):
        load_user_activity_data(username)
        channel_id = loaders.get_channel_id(username, load_channel=False)
        return await get_last_activity(channel_id)
    
    return _wrapper
    
@load_user_activity
async def get_last_user_activity(channel_id: str) -> Union[Activity, Comment]:
    last_activity = await dao.get_last_activity(match_load_params={
        "author_channel_id": channel_id
    })

    return last_activity

async def get_user_profile(email: str):
    profile = await dao.get_user_profile(email)
    return profile if profile else responses.OBJECT_NOT_FOUND(email)

async def update_user_profile(profile: schemes.Profile):
    updated = await dao.update_user_profile(profile)
    return updated if updated else responses.OBJECT_NOT_FOUND(profile.email)