import re
import sys

from pydantic import AliasChoices, AliasPath

class base_fieldpath:

    @staticmethod
    def get_snake_case(field_name, **kwargs):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', field_name).lower()
    
    def get_camel_case(field_name: str, **kwargs):
        while True:
            pos = field_name.find("_")
            if pos == -1:
                return field_name
            field_name = field_name.replace(field_name[pos: pos+2], field_name[pos+1].upper())
        
    
    def get_path(self, field_name: str) -> AliasChoices:
        pass

class channel:

    class default(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("items", 0, "snippet", field_name),
                AliasPath("items", 0, "snippet", camel_case),
                AliasPath("snippet", field_name), 
                AliasPath("snippet", camel_case)
            )
        
    class id(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("items", 0, field_name),
                AliasPath("items", 0, camel_case)
            )

class comment:

    class default(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("snippet", "topLevelComment", "snippet", field_name),
                AliasPath("snippet", "topLevelComment", "snippet", camel_case),
                AliasPath("snippet", field_name),
                AliasPath("snippet", camel_case)
            )

    class id(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("snippet", "topLevelComment", field_name),
                AliasPath("snippet", "topLevelComment", camel_case)
            )
    
    class replies(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                AliasPath("replies", "comments"),
            )

    class video_id(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name, 
                camel_case, 
                AliasPath("snippet", field_name), 
                AliasPath("snippet", camel_case)
            )
    
    class top_level_comment(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            return AliasChoices(
                field_name,
                AliasPath("snippet", "parentId")
            )
        
    class author_channel_id(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("snippet", "topLevelComment", "snippet", field_name, "value"),
                AliasPath("snippet", "topLevelComment", "snippet", camel_case, "value"),
                AliasPath("snippet", field_name, "value"),
                AliasPath("snippet", camel_case, "value")
            )
        
class activity:

    class default(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name,
                camel_case,
                AliasPath("snippet", field_name),
                AliasPath("snippet", camel_case)
            )
        
    class video_id(base_fieldpath):

        @classmethod
        def get_path(self, field_name):
            camel_case = self.get_camel_case(field_name)
            return AliasChoices(
                field_name, 
                camel_case, 
                AliasPath("contentDetails", "upload", field_name), 
                AliasPath("contentDetails", "upload", camel_case)
            )
            

def find_path(object_name: str, field_name: str) -> base_fieldpath:
    try:
        object_path = getattr(sys.modules[__name__], object_name)
    except AttributeError:
        raise AttributeError("Path class converter couldn't be found") 
    try:
        field_path =  getattr(object_path, field_name)
    except AttributeError:
        try:
            field_path = getattr(object_path, "default")
        except AttributeError:
            raise AttributeError("Path class converter couldn't be found")
    return field_path