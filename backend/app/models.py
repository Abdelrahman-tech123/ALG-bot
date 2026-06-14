import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, UniqueConstraint , JSON
from sqlalchemy.dialects.postgresql import UUID , ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    # الـ ID هنا أصبح UUID فريد ومحمي
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    name = Column(String(100), nullable=False, default="User")

    # علاقة الربط مع الشركات المستخرجة
    companies = relationship("Company", back_populates="owner", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    keyword = Column(String(255) , nullable=True)
    source = Column(String(50), nullable=False)
    company_name = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    
    email = Column(ARRAY(Text), nullable=False, server_default='{}') 
    
    website = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    maps_link = Column(Text, nullable=True)
    open_times = Column(JSON, default=[])
    first_image = Column(String, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="companies")

    __table_args__ = (
        UniqueConstraint('user_id', 'phone', name='uq_user_phone'),
    )