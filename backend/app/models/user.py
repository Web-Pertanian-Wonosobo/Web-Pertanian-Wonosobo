from sqlalchemy import Column, Integer, String, DateTime, Boolean, func, Enum
from app.db import Base
import enum
from app.core.database import Base
class UserRole(str.Enum):
    petani = "petani"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.petani, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    land_data = relationship("LandData", back_populates="user", lazy="dynamic")
    def __repr__(self):
        return f"<User(username={self.username}, email={self.email}, role={self.role})>"
