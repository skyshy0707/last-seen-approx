import asyncio
import time

from asyncpg.exceptions import CannotConnectNowError
from sqlalchemy.exc import OperationalError

from core.logger import setup_logger
from db.engine import engine
from db.models import Base

logger = setup_logger(__name__)

async def create_db():

    while True:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

        except ConnectionRefusedError as e:
            logger.warning(f"CONNECTION ERROR: {e}")
            time.sleep(2)
            continue
        except CannotConnectNowError as e:
            logger.warning(f"CANNOT CONNECT: {e}")
            time.sleep(2)
            continue
        except RuntimeError as e:
            logger.warning(f"CONNECTION ERROR. DETAILS: {e}. TRY TO RE-CONNECT AGAIN...")
            time.sleep(2)
            continue
        except OperationalError as e:
            logger.critical(f"OPERATION WAS ENDED WITH AN ERROR: {e}")
            break
        else:
            logger.info("CONNECTION SUCCESS")
            break

if __name__ == "__main__":
    asyncio.run(create_db())