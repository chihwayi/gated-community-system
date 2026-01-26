from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RESIDENT = "resident"
    GUARD = "guard"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True)
    role = Column(Enum(UserRole), default=UserRole.RESIDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    properties = relationship("Property", back_populates="owner")
    visitors_hosted = relationship("Visitor", back_populates="host")

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    unit_number = Column(String, unique=True, index=True, nullable=False) # e.g. "A-101"
    block_number = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="properties")

class VisitorStatus(str, enum.Enum):
    PENDING = "pending"     # Registered, not yet arrived
    APPROVED = "approved"   # Approved by resident (if required)
    CHECKED_IN = "checked_in" # Inside the premises
    CHECKED_OUT = "checked_out" # Left the premises
    DENIED = "denied"

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    phone_number = Column(String, index=True, nullable=False)
    vehicle_number = Column(String, nullable=True)
    
    # Visit Details
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    purpose = Column(String)
    access_code = Column(String, unique=True, index=True) # QR Code / OTP content
    
    status = Column(Enum(VisitorStatus), default=VisitorStatus.PENDING)
    
    expected_arrival = Column(DateTime(timezone=True))
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    host = relationship("User", back_populates="visitors_hosted")
