from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    message = Column(Text)
    notification_type = Column(String(50))
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)