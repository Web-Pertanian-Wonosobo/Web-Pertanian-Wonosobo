from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum

class UserRole(str, enum.Enum):
    PUBLIC = "public"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)  
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(Text, nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), default=UserRole.PUBLIC, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    last_login = Column(TIMESTAMP(timezone=True), nullable=True)

    # RELATIONSHIPS 
    market_prices = relationship(
        "MarketPrice", back_populates="user",lazy="selectin"
    )
    gis_layers = relationship(
        "GISLayer", back_populates="user", lazy="selectin"
    )
    notifications = relationship(
        "Notification", back_populates="user", lazy="selectin"
    )
    weather_data = relationship(
        "WeatherData", back_populates="user", lazy="selectin"
    )
    logs = relationship(
        "LogActivity", back_populates="user", 
        lazy="selectin"
    )

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"