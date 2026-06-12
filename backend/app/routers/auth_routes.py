# endpoints for login and register
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter()

# for creating new account
@router.post("/register" , response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in : schemas.UserCreate , db : Session = Depends(get_db)):
    
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code= status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )
    
    hashed_password = auth.get_password_hash(user_in.password)

    new_user = models.User(
        name = user_in.name,
        email = user_in.email,
        hashed_password = hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user



@router.post("/login" , response_model=schemas.Token)
def login_user(user_in : schemas.UserLogin , db : Session = Depends(get_db)):
    
    user = db.query(models.User).filter(models.User.email == user_in.email).first()

    if not user or not auth.verify_password(user_in.password , str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate" : "Bearer"},
        )
    
    token_payload = {"sub": user.email} # adding email to the payload

    # creating the token with the function
    access_token = auth.create_access_token(data=token_payload)

    return{
        "access_token": access_token,
        "token_type" : "bearer",
        "user":user
    }