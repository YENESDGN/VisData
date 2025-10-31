from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
import io
from database import models
from core.security import get_current_user

router = APIRouter()


@router.post("/upload_csv/")
async def upload_csv(
        file: UploadFile = File(...),
        current_user: models.UserDB = Depends(get_current_user)
):
    # Yüklenen dosyanın içeriğini oku
    contents = await file.read()

    # İçeriği bir Pandas DataFrame'e dönüştür
    # io.BytesIO, dosyanın içeriğini bir "dosya gibi" ele alır
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        return {"error": f"Dosya okunamadı: {e}"}

    # DataFrame'in ilk 5 satırını (head) JSON olarak geri dön
    # 'records' formatı, frontend'de grafikler için en kullanışlı formatlardan biridir
    return df.head().to_json(orient="records")