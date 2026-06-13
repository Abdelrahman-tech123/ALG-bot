# endpoints for scraping
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from app.database import get_db
from app import models, schemas, auth
from app.scraper import scrape_google_maps

router = APIRouter()

@router.post("/run" , response_model=List[schemas.CompanyResponse])
async def run_scraper(
    request: schemas.ScrapeRequest,
    db : Session = Depends(get_db),
    current_user : models.User = Depends(auth.get_current_user)
):
    # auth the user and start the scraper and save the data to the db
    try:
        raw_results = await scrape_google_maps(
            keyword= request.keyword,
            location= request.location,
            max_results=request.max_results,
        )
    except Exception as e:
        raise HTTPException(
            status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"scraping failed :  {str(e)}"
        )
    
    saved_companies = []

    for item in raw_results:
        db_company = models.Company(
            user_id = current_user.id,
            company_name = item["company_name"],
            phone = item["phone"],
            email = item["email"],
            website = item["website"],
            location = item["location"],
            source = item["source"],
        )
        
        try:
            db.add(db_company)
            db.commit()
            db.refresh(db_company)
            saved_companies.append(db_company)
        except IntegrityError:
            # في حالة تكرار التليفون أو الإيميل لنفس المستخدم، الـ Postgres هيرمي IntegrityError
            # هنا بنعمل rollback وبنتخطى الشركة دي بذكاء وبدون ما السيرفر يقع
            db.rollback()
            continue

    return saved_companies
        

