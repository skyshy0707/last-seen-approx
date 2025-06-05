from enum import Enum

from core.api import loaders

ERROR_MESSAGE = "Unaccepted value: {value}"

def validate_accepted_type(choices: Enum):
    """
    Validate name of choice
    """
    def _validate(_validator_func):
        def wrapper(value, info, **kwargs):
            value = _validator_func(value, info, **kwargs) or value

            try:
                db_value = getattr(choices, value) 
            except AttributeError:
                raise ValueError(ERROR_MESSAGE.format(value=value))
            else: return db_value
        return wrapper
    return _validate

def validate_channel_id(value, info, **kwargs):
    
    return loaders.get_channel_id(value, load_channel=True)