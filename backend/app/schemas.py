# pydantic models validation for data

from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

# ============================
# 🔐 AUTH SCHEMAS (المستخدمين)
# ============================

# البيانات المطلوبة عند إنشاء حساب جديد (Register)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# البيانات المطلوبة عند تسجيل الدخول (Login)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# شكل بيانات المستخدم التي سنرجعها في الـ API (بدون الباسورد طبعاً!)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# شكل التوكن اللي هيرجع بعد تسجيل الدخول الناجح
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# شكل البيانات المخزنة داخل الـ JWT token نفسه
class TokenData(BaseModel):
    email: Optional[str] = None


# ============================
# 🤖 SCRAPER SCHEMAS (البيانات المستخرجة)
# ============================

# البيانات المطلوبة لتشغيل السكرابر من شاشة الـ Dashboard
class ScrapeRequest(BaseModel):
    keyword: str
    location: str
    source: str # مثلاً: Google Maps أو LinkedIn

# شكل بيانات الشركة المستخرجة التي سنرجعها للفرونت إند لعرضها في الجدول
class CompanyResponse(BaseModel):
    id: int
    company_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True