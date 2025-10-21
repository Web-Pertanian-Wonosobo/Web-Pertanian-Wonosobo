from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(100))
    message = Column(Text)
    is_read = Column(Integer)
    created_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="notifications")
