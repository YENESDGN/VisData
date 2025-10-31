# routers/visualize.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import connection, models
from core.security import get_current_user
import pandas as pd

# 'import numpy as np' Gerekebilir, ancak pandas'ın kendi fonksiyonlarını kullanmak daha iyidir.

router = APIRouter()


@router.get("/{file_id}/data")
def get_visualization_data(
        file_id: int,
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """
    Belirli bir dosyanın içeriğini okur, işler ve
    grafik kütüphanesinin (React, Vue vb.) anlayacağı bir JSON formatında döndürür.
    """
    # 1. Dosyayı veritabanında bul
    db_file = db.query(models.FileDB).filter(models.FileDB.id == file_id).first()

    if not db_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dosya bulunamadı.")

    # 2. Güvenlik: Dosya bu kullanıcıya mı ait?
    if db_file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu dosyaya erişim yetkiniz yok.")

    # 3. Dosyayı diskten oku (Pandas kullanarak)
    try:
        file_path = db_file.file_path
        if db_file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif db_file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya okunurken hata oluştu: {e}")

    # --- DÜZELTİLMİŞ KISIM ---
    # 4. Veriyi ve sütun isimlerini frontend'e göndermek için hazırla

    try:
        # --- YENİ SATIR: NaN DEĞERLERİNİ DÜZELTME ---
        # JSON standardı NaN (Not a Number) değerlerini desteklemez.
        # Bu yüzden Pandas'taki NaN'ları Python'un 'None' (JSON'da 'null' olur) değerine çeviriyoruz.
        # Bunu yapmanın en sağlam yolu:
        df_cleaned = df.astype(object).where(pd.notnull(df), None)
        # --- BİTTİ ---

        # Sütun isimlerini bir liste olarak al
        column_names = list(df_cleaned.columns)

        # Verinin tamamı yerine ilk 1000 satırı al (büyük dosyalar için)
        # .to_dict() kullanarak JSON listesine çevir
        json_data = df_cleaned.head(1000).to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Veri JSON'a dönüştürülürken hata oluştu: {e}")

    # Hem sütunları hem de veriyi tek bir JSON objesi olarak döndür
    return {
        "columns": column_names,
        "data": json_data
    }