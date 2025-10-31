# schemas/users.py

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    # Sınırı 512 karaktere çıkarıyoruz
    password: str = Field(..., min_length=8, max_length=512)


class User(UserBase):
    id: int

    # Uyarıyı (warning) da düzeltelim:
    class Config:
        from_attributes = True  # 'orm_mode' yerine bunu kullanın