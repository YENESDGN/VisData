from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import connection, models
from schemas import items as item_schemas

router = APIRouter()

@router.post("/", response_model=item_schemas.Item)
def create_item(item: item_schemas.ItemCreate, db: Session = Depends(connection.get_db)):
    db_item = models.ItemDB(name=item.name, description=item.description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=item_schemas.Item)
def read_item(item_id: int, db: Session = Depends(connection.get_db)):
    db_item = db.query(models.ItemDB).filter(models.ItemDB.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item