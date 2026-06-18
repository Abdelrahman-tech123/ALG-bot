from fastapi import APIRouter, Depends, HTTPException, status , Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List, Dict, Any , Optional
import uuid
from app.database import get_db
from app import schemas, auth
from app.config import debug_print
from app.models import Company

router = APIRouter()

@router.get("")
def get_companies(
    place: Optional[str] = Query(None), 
    location: Optional[str] = Query(None),
    limit: Optional[int] = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    query = db.query(Company).filter(Company.user_id == current_user.id)

    # استخدام الـ ilike للبحث المرن بدلاً من التطابق التام
    if place and location and place.strip() and location.strip():
        search_keyword = f"{place.strip()} in {location.strip()}"
        query = query.filter(Company.keyword.ilike(f"%{search_keyword}%"))

    total_items = query.count()
    companies = query.order_by(Company.id.desc()).limit(limit).all()
    
    return {
        "companies": companies,
        "total_items": total_items
    }