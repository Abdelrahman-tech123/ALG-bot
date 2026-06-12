# pydantic models validation for data
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

# ============================
# 🔐 AUTH SCHEMAS (المستخدمين)
# ============================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID  # 👈 رجعناها UUID للأمان القصوى
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

        
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None


# ============================
# 🤖 SCRAPER SCHEMAS (البيانات المستخرجة)
# ============================

class ScrapeRequest(BaseModel):
    keyword: str
    location: str
    source: str 

class CompanyResponse(BaseModel):
    id: uuid.UUID # 👈 حتى الشركات بقت UUID عشان الـ URLs في الفرونت إند تكون مشفرة وصعبة التخمين
    company_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    source: str
    scraped_at: datetime 

    class Config:
        from_attributes = True