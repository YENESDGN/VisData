# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import connection, models
from schemas import users as user_schemas
from core.security import get_password_hash, get_user_by_email, get_current_user

router = APIRouter()

@router.post("/", response_model=user_schemas.User)
def create_user(user: user_schemas.UserCreate, db: Session = Depends(connection.get_db)):
    """Yeni kullanıcı oluşturma (Kayıt Ol / Register)."""
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten kayıtlı.",
        )
    hashed_password = get_password_hash(user.password)
    db_user = models.UserDB(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=user_schemas.User)
def read_users_me(current_user: models.UserDB = Depends(get_current_user)):
    """Token'ı gönderen kullanıcının kendi bilgilerini döndürür."""
    return current_user