# app/routers/files.py
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from database import connection, models
from schemas import files as file_schemas
from core.security import get_current_user
from typing import List
import os

router = APIRouter()

# Yüklenen dosyaların saklanacağı klasör
UPLOAD_DIRECTORY = "./uploaded_files"


@router.post("/upload", response_model=file_schemas.File)
def upload_file(
        file: UploadFile = File(...),
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """CSV/Excel dosyası yükler. Korumalı endpoint."""

    # Güvenlik: Sadece belirli dosya türlerine izin ver
    if file.content_type not in ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
        raise HTTPException(status_code=400, detail="Geçersiz dosya türü. Sadece CSV veya XLSX.")

    file_path = f"{UPLOAD_DIRECTORY}/{current_user.id}_{file.filename}"

    # Dosyayı diske kaydet
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    # Dosya bilgilerini veritabanına kaydet
    db_file = models.FileDB(
        filename=file.filename,
        file_path=file_path,
        owner_id=current_user.id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


@router.get("/", response_model=List[file_schemas.File])
def list_my_files(
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """Giriş yapmış kullanıcının yüklediği tüm dosyaları listeler."""
    return db.query(models.FileDB).filter(models.FileDB.owner_id == current_user.id).all()


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
        file_id: int,
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """Kullanıcının dosyasını siler: disk ve veritabanından."""
    db_file = db.query(models.FileDB).filter(models.FileDB.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    if db_file.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu dosyayı silme yetkiniz yok")

    # Diskten sil (varsa)
    try:
        if db_file.file_path and os.path.exists(db_file.file_path):
            os.remove(db_file.file_path)
    except Exception:
        # Disk silme başarısız olsa da veritabanından kaldırmaya devam edelim
        pass

    db.delete(db_file)
    db.commit()
    return None