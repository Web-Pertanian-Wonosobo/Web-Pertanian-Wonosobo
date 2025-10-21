from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class LogActivity(Base):
    __tablename__ = "log_activity"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    activity = Column(String(255))
    timestamp = Column(TIMESTAMP)

    user = relationship("User", back_populates="logs")
