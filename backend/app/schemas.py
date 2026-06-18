# pydantic models validation for data
from pydantic import BaseModel, EmailStr
from typing import Optional , List
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
    source: Optional[str] = "Google Maps" 
    max_results : int

class GetCompanies(BaseModel):
    place : Optional[str] = None
    location : Optional[str] = None

class CompanyResponse(BaseModel):
    id: uuid.UUID # 👈 حتى الشركات بقت UUID عشان الـ URLs في الفرونت إند تكون مشفرة وصعبة التخمين
    keyword : Optional[str] = None
    company_name: str
    phone: Optional[str] = None
    email: list[str] = []
    website: Optional[str] = None
    location: Optional[str] = None
    maps_link: Optional[str] = None
    source: str
    open_times: List[str] = []
    first_image: Optional[str] = None
    scraped_at: datetime 

    class Config:
        from_attributes = True