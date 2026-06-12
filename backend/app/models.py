import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

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
    
    source = Column(String(50), nullable=False)
    company_name = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    
    # تغيير الاسم ليطابق scraped_at الموجود في داتابيز Neon عندك
    scraped_at = Column(DateTime, default=datetime.utcnow)

    # العودة للمستخدم المالك
    owner = relationship("User", back_populates="companies")

    # تطبيق الـ Unique Constraints اللي أنت عاملها في الصورة بالظبط لمنع التكرار
    __table_args__ = (
        UniqueConstraint('user_id', 'email', name='uq_user_email'),
        UniqueConstraint('user_id', 'phone', name='uq_user_phone'),
    )