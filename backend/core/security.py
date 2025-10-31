# app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.config import settings
from database import connection, models
from schemas import token as token_schema

# Şifreleme bağlamı (artık argon2 kullan)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
# Token'ın alınacağı URL (auth.py'daki login endpoint'i)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password, hashed_password):
    """Düz metin şifre ile hash'lenmiş şifreyi doğrular."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Düz metin şifreyi hash'ler."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Yeni bir JWT erişim token'ı oluşturur."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_user_by_email(db: Session, email: str):
    """Veritabanından e-postaya göre kullanıcıyı bulur."""
    return db.query(models.UserDB).filter(models.UserDB.email == email).first()


def get_current_user(
        db: Session = Depends(connection.get_db),
        token: str = Depends(oauth2_scheme)
):
    """
    Token'ı çözer ve mevcut kullanıcıyı döndürür.
    Bu, korumalı endpoint'ler için bir 'Depends' (Bağımlılık) olacak.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = token_schema.TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user