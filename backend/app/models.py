import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "admin" or "user"
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan")


class Counter(Base):
    __tablename__ = "counters"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)  # e.g. "Counter 1 - Fast Track"
    service_category = Column(String(100), nullable=False)  # e.g. "General Consultation", "All"
    is_active = Column(Boolean, default=True)
    is_busy = Column(Boolean, default=False)
    staff_name = Column(String(100), default="Staff Member")
    current_token_id = Column(Integer, nullable=True)
    avg_service_time = Column(Float, default=8.0)  # Average service time in minutes
    total_served = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    tokens = relationship("Token", back_populates="assigned_counter")


class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    token_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "GEN-101"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=False, default="Guest")
    user_phone = Column(String(50), nullable=True)
    service_category = Column(String(100), nullable=False)  # "General Consultation", "Emergency", "Billing", "Registration", "Laboratory", "Other Services"
    priority_level = Column(String(50), default="Regular", nullable=False)  # "Regular", "Senior/Disabled", "Emergency", "VIP"
    status = Column(String(50), default="Waiting", nullable=False)  # "Waiting", "Called", "In Service", "Completed", "Cancelled"
    assigned_counter_id = Column(Integer, ForeignKey("counters.id", ondelete="SET NULL"), nullable=True)
    queue_position = Column(Integer, default=1)
    estimated_wait_minutes = Column(Float, default=10.0)
    actual_wait_minutes = Column(Float, nullable=True)
    service_time_minutes = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    called_at = Column(DateTime, nullable=True)
    served_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tokens")
    assigned_counter = relationship("Counter", back_populates="tokens")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(50), default="Medium", nullable=False)  # "Low", "Medium", "High", "Critical"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    counter_id = Column(Integer, ForeignKey("counters.id", ondelete="CASCADE"), nullable=True)
    is_resolved = Column(Boolean, default=False)
    recommended_action = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
