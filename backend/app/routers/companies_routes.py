from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db
from app import auth
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

    all_keywords_query = db.query(Company.keyword).\
        filter(Company.user_id == current_user.id).\
        distinct().\
        filter(Company.keyword.isnot(None)).\
        all()
    
    keywords_list = [k[0] for k in all_keywords_query]

    total_items = query.count()
    companies = query.order_by(Company.id.desc()).limit(limit).all()
    
    return {
        "companies": companies,
        "total_items": total_items,
        "unique_keywords" : keywords_list
    }