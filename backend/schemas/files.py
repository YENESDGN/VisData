# app/schemas/files.py
from pydantic import BaseModel
import datetime

class File(BaseModel):
    id: int
    filename: str
    upload_date: datetime.datetime
    owner_id: int

    class Config:
        orm_mode = True