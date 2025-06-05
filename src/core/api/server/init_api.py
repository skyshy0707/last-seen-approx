import asyncio

from databases import Database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Config
from core.api.server.router import external_api, server_api
from core.logger import setup_logger

logger = setup_logger(__name__)
settings = Config()
database = Database(settings.DB_URL)

origins = [
    "chrome-extension://ennaeaolgbonmikpfeolphklfkgghnko",
    "http://localhost:9000",
    "https://www.youtube.com"
]

app = FastAPI(
    title="Youtube user last seen",
    docs_url="/docs",
    openapi_url="/api/openapi.json",
    openapi_prefix="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(external_api.router)
app.include_router(server_api.router)

@app.on_event("startup")
async def startup():
    while True:
        try:
            await database.connect()
        except Exception as e:
            logger.warning(f"Connection close. Details: {e}")
            await asyncio.sleep(1)
        else:
            break
    

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()