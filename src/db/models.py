from datetime import datetime
from enum import Enum as InEnum

from sqlalchemy import (
    Boolean, 
    CheckConstraint, 
    Column, 
    DateTime, 
    Enum, 
    ForeignKey,
    String
)
from sqlalchemy.orm import relationship

from core.logger import setup_logger
from db.engine import Base

logger = setup_logger(__name__)


def fk_comment_channel():
    return [Comment.author_channel_id]

def fk_activity_author():
    return [Activity.author_channel_id]

class ActivityTypes(str, InEnum):

    channelItem  = "channelItem"
    comment =  "comment"
    favorite = "favorite"
    like =  "like"
    playlistItem = "playlistItem"
    recomendation = "recomendation"
    social =  "social"
    subscription =  "subscription"
    upload =  "upload"
    bulletin =  "bulletin"

class YtUserActivity(Base):

    __tablename__ = "ytuser_activity"
    id = Column(String(100), primary_key=True, index=True)   
    published_at = Column(DateTime(timezone=True), nullable=False)
    identity = Column(String(100))

    __mapper_args__ = {
        "polymorphic_identity": "ytuser_activity",
        "polymorphic_on": identity
    }

class AuthorRelate(YtUserActivity):

    __tablename__ = "author_relate"
    id = Column(String(100), ForeignKey("ytuser_activity.id"), primary_key=True, index=True)
    author_channel_id = Column(String, ForeignKey("channel.id"), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "author_relate",
        "polymorphic_on": "identity"
    }

class Comment(AuthorRelate):

    __tablename__ = "comment"

    id = Column(String(100), ForeignKey("author_relate.id"), primary_key=True, index=True)
    video_id = Column(String(20))
    text_display = Column(String(10000), nullable=False)
    text_original = Column(String(10000))
    updated_at = Column(DateTime(timezone=True), nullable=False)
    top_level_comment = Column(String(100))

    channel = relationship("Channel", back_populates="comments", single_parent=True, foreign_keys=fk_comment_channel)

    __mapper_args__ = {
        "polymorphic_load": "selectin",
        "polymorphic_identity": "comment"
    }

class Activity(AuthorRelate):

    __tablename__ = "activity"
    __table_args__ = (
        CheckConstraint("(NOT(video_id IS NULL) AND type = 'upload') OR video_id IS NULL"),
    )

    id = Column(String(100), ForeignKey("author_relate.id"), primary_key=True, index=True)
    channel_id = Column(String, ForeignKey("channel.id"), nullable=False)
    video_id = Column(String(20))
    type = Column(Enum(ActivityTypes), nullable=False)
    deleted = Column(Boolean, nullable=False, default=False)
    
    channel = relationship("Channel", back_populates="related_activities", single_parent=True, foreign_keys=[channel_id])
    author = relationship("Channel", back_populates="authors_activities", single_parent=True, foreign_keys=fk_activity_author)

    __mapper_args__ = {
        "polymorphic_load": "selectin",
        "polymorphic_identity": "activity"
    }

class Channel(YtUserActivity):

    __tablename__ = "channel"
    
    id = Column(
        String(100), ForeignKey("ytuser_activity.id"), primary_key=True, index=True
    )
    title = Column(String(50), nullable=False)
    description = Column(String(1000))
    custom_url = Column(String(55), nullable=False)
    country = Column(String(60))

    comments = relationship("Comment", back_populates="channel", lazy="selectin", foreign_keys=[Comment.author_channel_id])
    authors_activities = relationship(
        "Activity", back_populates="author", lazy="selectin", foreign_keys=[Activity.author_channel_id]
    )
    related_activities = relationship(
        "Activity", back_populates="channel", lazy="selectin", foreign_keys=[Activity.channel_id]
    )
    __mapper_args__ = {
        "inherit_condition": YtUserActivity.id == id,
        "polymorphic_load": "selectin",
        "polymorphic_identity": "channel"
    }

class Profile(Base):
    
    __tablename__ = "profile"

    email = Column(String(285), primary_key=True, index=True)
    last_check = Column(DateTime, default=datetime.fromisoformat("1970-01-01T00:00:00"))