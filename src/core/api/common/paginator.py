from typing import List

from sqlalchemy.orm import DeclarativeBase

from core.api.schemes.load_params import Pagination

def paginate_qs(qs: List[DeclarativeBase], params: Pagination):
    limit = params.limit
    offset = params.offset
    items = list(qs)
    return {
        "limit": limit,
        "offset": offset + limit,
        "total": len(items),
        "items": items[offset : limit+offset]
    }