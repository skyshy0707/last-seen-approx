from fastapi import status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse


CONTINUE_LOAD = "Continue"
UNIQUE_CONSTRAINT_FAILED = "violates unique constraint"

WITHOUT_ERRORS_BUT_NOT_NEW_OBJECTS = JSONResponse(
    status_code=status.HTTP_200_OK,
    content=jsonable_encoder(
        { 
            "message": "Among set of objects no one of them is new. "\
                       "Try to load later"
        }
    )
)

WITHOUT_ERRORS_BUT_OBJECTS_NOT_MATCH = JSONResponse(
    status_code=status.HTTP_200_OK,
    content=jsonable_encoder(
        { 
            "message": CONTINUE_LOAD
        }
    )
)

SEVERAL_NEW_OBJECTS_ARE_ADDED = lambda num: JSONResponse(
    status_code=status.HTTP_201_CREATED,
    content=jsonable_encoder(
        { 
            "message": f"{num} new instances were added "\
        }
    )
)

LAST_OBJECT_WAS_ADDED = lambda object_data: JSONResponse(
    status_code=status.HTTP_201_CREATED,
    content=jsonable_encoder(
        {
            "message": "Last object was added",
            "detail": object_data
        }
    )
)

DATA_ERROR = lambda model, detail: HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail=f"Fail to add a new instance {model.__class__.__name__}. Detail: {detail}"
)

OBJECT_NOT_FOUND = lambda key: JSONResponse(
    status_code=status.HTTP_404_NOT_FOUND,
    content=jsonable_encoder(
        {
            "message": f"Object with unique key value={key} is not found"
        }
    )
)

EARLIER_OBJECT_THE_EXISTING_ONE = JSONResponse(
    status_code=status.HTTP_409_CONFLICT,
    content=jsonable_encoder(
        { 
            "message": "Object was found, but it is earlier "\
                       "than existing one at the server"
        }
    )
)