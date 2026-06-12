from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth_routes, scrape_routes

# Initialize the FastAPI app
app = FastAPI(
    title="AI Market Intelligence Scraper API",
    description="Backend Python Server with FastAPI, Playwright, and Neon PostgreSQL",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # السماح للمواقع المحددة فوق فقط
    allow_credentials=True,           # السماح بإرسال الـ Cookies والـ Auth Headers
    allow_methods=["*"],              # السماح بجميع أنواع الطلبات (GET, POST, PUT, DELETE)
    allow_headers=["*"],              # السماح بجميع أنواع الـ Headers
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(scrape_routes.router, prefix="/api", tags=["Scraper & Data"])

@app.get("/", tags=["Root"])
def read_root():
    return {
        "status": "online",
        "message": "Welcome to Market Intelligence API v1.0",
        "database": "Connected to Neon PostgreSQL"
    }
