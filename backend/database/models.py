from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
import datetime

Base = declarative_base()


class UserDB(Base):
    """Kullanıcıları temsil eden veritabanı modeli."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # İlişki: Bu kullanıcının yüklediği dosyalar
    files = relationship("FileDB", back_populates="owner")


class FileDB(Base):
    """Yüklenen dosyaların bilgilerini (metadata) tutan model."""
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String)  # Dosyanın sunucuda saklandığı yol

    # İlişki: Bu dosyayı yükleyen kullanıcı
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("UserDB", back_populates="files")