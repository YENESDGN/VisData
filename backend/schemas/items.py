from pydantic import BaseModel

class ItemCreate(BaseModel):
    name:str
    description:str | None = None

class Item(BaseModel):
    id: int
    name: str
    description:str | None = None

    class Config:
        orm_mode = True