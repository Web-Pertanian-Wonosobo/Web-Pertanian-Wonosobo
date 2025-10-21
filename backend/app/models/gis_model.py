from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class GISLayer(Base):
    __tablename__ = "gis_layers"

    layer_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    layer_name = Column(String(100))
    layer_type = Column(String(50))
    file_path = Column(Text)
    created_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="gis_layers")
