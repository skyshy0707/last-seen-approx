import os

from sqlalchemy import select
from sqlalchemy.engine import URL
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Query, registry
from sqlalchemy import AsyncAdaptedQueuePool
from typing import AsyncGenerator

from config import Config
from core.logger import setup_logger


engine_params = Config()
logger = setup_logger(__name__)
mapper = registry()

DB_URL = URL.create(
    "postgresql+asyncpg",
    username=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=os.getenv("POSTGRES_HOST"),
    database=os.getenv("POSTGRES_DB")
)

Base = mapper.generate_base()

engine = create_async_engine(
    engine_params.DB_URL,
    echo=False,
    future=True,
    pool_size=75,
    max_overflow=100,
    pool_recycle=400,
    pool_pre_ping=True,
    poolclass=AsyncAdaptedQueuePool
)

async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
        await session.close()


def connection(func, instances_expire_after_transaction=True):
    async def wrapper(*args, **kwargs):
        async with async_session_maker() as session:

            if instances_expire_after_transaction:
                async with session.begin():
                    return await func(session, *args, **kwargs)
            else: 
                return await func(session, *args, **kwargs)
    return wrapper


def get_model_by_tablename(tablename: str) -> DeclarativeBase:
    for model in Base.registry.mappers:
        model_class = model.class_
        if hasattr(model_class, "__tablename__") and model_class.__tablename__ == tablename:
            return model
        
def build_query(
    db_model: DeclarativeBase,
    match_load_params: dict, 
    q: Query=None
) -> Query:

    if q is None:
        q: Query = select(db_model)

    cases = {}
    models = []
    query_params = []
    for param, value in match_load_params.items():
        if not hasattr(value, "__len__") or isinstance(value, str):
            try:
                cases[param] = value
            except AttributeError:
                logger.warning(
                    f"Field named {param} can't be found in target model "\
                    f"named {db_model.__class__.__name__}"
                )
        elif type(value) == dict:
            models.append(
                get_model_by_tablename(param), value
            )
    query_params = cases
    if query_params:
        q = q.filter_by(**query_params)

    for model, match_load_params_ in models:
        try:
            q = build_query(model, match_load_params_, (q).join(model))
        except SQLAlchemyError as e:
            logger.warning(f"Error occur at join model: {model}. Details: {e}")
            break
    return q