from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List, Dict, Any
import uuid
from app.database import get_db
from app import models, schemas, auth
from app.scraper import scrape_google_maps
from app.config import debug_print

router = APIRouter()

@router.post("/run")
async def run_scraper(
    request: schemas.ScrapeRequest,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    search_keyword = f"{request.keyword} in {request.location}"

    # جلب الكاش القديم
    existing_companies = db.query(models.Company).filter(
        models.Company.user_id == current_user.id,
        models.Company.keyword == search_keyword,
    ).all()

    # تحويل الكاش القديم إلى دكشنري فوراً لضمان عدم عودته كأقواس فارغة {}
    final_response_list = []
    for c in existing_companies:
        final_response_list.append({
            "id": str(c.id),
            "user_id": str(c.user_id),
            "keyword": c.keyword,
            "company_name": c.company_name,
            "phone": c.phone,
            # بنشيك مباشرة لو القيمة مش None لتفادي غباء Pylance
            "email": c.email if c.email is not None else [],
            "website": c.website,
            "location": c.location,
            "maps_link": c.maps_link,
            "source": c.source,
            "open_times": c.open_times if c.open_times is not None else [],
            "first_image": c.first_image,
            "scraped_at": c.scraped_at.isoformat() if (hasattr(c, 'scraped_at') and c.scraped_at is not None) else None
        })

    if len(final_response_list) >= request.max_results:
        debug_print(f"📦 Returning {len(final_response_list)} items from cached DB.")
        return {
            "data": final_response_list[:request.max_results],
            "keyword": search_keyword,
            "count": request.max_results
        }
    
    needed_results = request.max_results - len(final_response_list)
    debug_print(f"🔍 Scraping {needed_results} more items to fulfill request.")

    db_maps_links = [item["maps_link"] for item in final_response_list if item.get("maps_link")]

    try:
        raw_results = await scrape_google_maps(
            keyword=request.keyword,
            location=request.location,
            max_results=needed_results,
            db_results=db_maps_links
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Scraping crashed: {str(e)}")
    
    existing_links = {item["maps_link"].strip() for item in final_response_list if item.get("maps_link")}
    existing_phones = {item["phone"].strip() for item in final_response_list if item.get("phone")}    

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db.rollback()

    for item in raw_results:
        if len(final_response_list) >= request.max_results:
            break
        
        link_clean = item["maps_link"].strip() if item["maps_link"] else ""
        phone_clean = item["phone"].strip() if item["phone"] else None

        if link_clean in existing_links or (phone_clean and phone_clean in existing_phones):
            continue

        company_id = str(uuid.uuid4())
        db_company = models.Company(
            id=company_id,
            user_id=current_user.id,
            keyword=search_keyword,
            company_name=item["company_name"],
            phone=item["phone"],
            email=item["email"] if item["email"] else [], 
            website=item["website"],
            location=item["location"],
            maps_link=item["maps_link"],
            source=item["source"],
            open_times=item["open_times"], 
            first_image=item["first_image"]
        )
        
        try:
            db.add(db_company)
            db.commit()
            
            # بنضيف الـ Dict الصافي للـ Response فوراً لمنع الأقواس {} الممسوحة من الكاش
            item["id"] = company_id
            item["user_id"] = str(current_user.id)
            final_response_list.append(item)
            
            existing_links.add(link_clean)
            if phone_clean: existing_phones.add(phone_clean)
        except IntegrityError:
            db.rollback()
            continue
        except Exception:
            db.rollback()
            continue

    return {
        "data": final_response_list[:request.max_results],
        "keyword": search_keyword,
        "count": len(final_response_list[:request.max_results])
    }