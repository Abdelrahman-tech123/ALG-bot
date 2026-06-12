# JWT and Hashing
from datetime import datetime, timedelta
from typing import Optional
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import models, schemas

# إعداد سياق تشفير كلمات المرور باستخدام خوارزمية Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# تحديد من أين يستخرج FastAPI التوكن (سيبحث عنه في هيدر الطلب تلقائياً)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# hash the incoming password from the user
def get_password_hash(password: str) -> str :
    return pwd_context.hash(password)

# check if the password is correct
def verify_password(plain_password: str, hashed_password: str) -> bool :
    return pwd_context.verify(plain_password , hashed_password)

# generate an access token
def create_access_token(data: dict) :
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp":expire}) # add the expire time to the token

    # creating the JWT token
    encoded_jwt = jwt.encode(to_encode , settings.JWT_SECRET , algorithm=settings.JWT_ALGORITHM)

    return encoded_jwt

# get the token and make sure that the user is in the db and he have access
def get_current_user(db: Session = Depends(get_db) , token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Couldn't validate credentials",
        headers={"WWW-Authenticate" : "Bearer"},
    )
    try:
        # decode the token
        payload = jwt.decode(token , settings.JWT_SECRET , algorithms=[settings.JWT_ALGORITHM])

        # استخراج إيميل المستخدم من الحقل "sub" (Subject) وهو الحقل القياسي لتعريف الهوية في JWT
        email = payload.get("sub")
        if email is None or not isinstance(email , str):
            raise credentials_exception
        
        token_data = schemas.TokenData(email=email)
    except:
        raise credentials_exception
    
    # search for the user email in db
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    
    if user is None:
        raise credentials_exception
        
    return user
