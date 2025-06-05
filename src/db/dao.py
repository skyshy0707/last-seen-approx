from datetime import datetime
from typing import List

from fastapi.exceptions import HTTPException
from fastapi import status
from sqlalchemy import desc, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Query, selectin_polymorphic
from sqlalchemy.orm.decl_api import DeclarativeMeta

from core.api.schemes.load_params import SearchActivities
from core.logger import setup_logger
from db.engine import build_query, connection
from db.models import Activity, ActivityTypes, Comment, Profile, YtUserActivity, AuthorRelate

logger = setup_logger(__name__)


@connection
async def get_last_object_by_params(
        session: AsyncSession,
        db_model: DeclarativeMeta, 
        match_load_params: dict=dict(), 
        order_by: tuple=None
    ) -> DeclarativeMeta:

    if not all((match_load_params, order_by)):
        return None

    query = build_query(db_model, match_load_params)

    if type(order_by) != tuple:
        order_by = order_by,
    order_by = map(desc, order_by)

    logger.info(f"SQL STATEMENT FOR REQUEST COMPARED INSTANCE: {query.order_by(*order_by)}")

    try:
        instance = (await session.scalar(query.order_by(*order_by).limit(1)))
    except SQLAlchemyError as e:
        message = f"Error occur at retrieve instance {db_model} from query. "\
                  f"Load params: {match_load_params}. Details: {e}"
        logger.critical(message)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    return instance
     

@connection
async def get_last_activity(
    session: AsyncSession,
    match_load_params: dict=dict()
):

    base_columns = select(YtUserActivity, AuthorRelate).alias("base_columns")
    subtables = selectin_polymorphic(YtUserActivity, [Activity, Comment])
    user_activities = build_query(YtUserActivity, match_load_params, select(base_columns))
    results = user_activities.order_by(desc("published_at")).options(subtables)
    activity_id = (await session.execute(results)).scalar()
    activity = await session.scalar(select(YtUserActivity).where(YtUserActivity.id == activity_id).options(subtables))

    return activity

@connection
async def search_activities(
        session: AsyncSession,
        params: SearchActivities
    ) -> List[Activity]:

    logger.info(f"SEARCH PARAMS FOR ACTIVITY {params}")
    q: Query = select(Activity)
    channel_id = params.channel_id
    deleted = params.deleted
    types = tuple(map(lambda type: getattr(ActivityTypes, type), params.type))

    if channel_id:
        q: Query = q.where(Activity.channel_id == channel_id)
    if deleted is not None:
        q: Query = q.filter(Activity.deleted == deleted)
    if types:
        
        q: Query = q.filter(Activity.type.in_(types))
    
    return (await session.execute(q)).scalars()

@connection
async def get_user_profile(session: AsyncSession, email: str) -> Profile:
    profile = (await session.scalar(select(Profile).where(Profile.email == email)))
    if not profile:
        profile = Profile(email=email)
        session.add(profile)
    return profile

@connection
async def update_user_profile(session: AsyncSession, data: Profile) -> Profile:
    email = data.email
    profile = (await session.scalar(select(Profile).where(Profile.email == email)))

    if profile:
        profile.last_check = datetime.now()
        return profile
    
@connection
async def get_activity(session: AsyncSession, id: str):
    return (await session.execute(select(Activity).where(Activity.id == id))).one_or_none()

@connection
async def set_activity_delete_flag(id: str):
    activity = await get_activity(id)
    activity.delete = True