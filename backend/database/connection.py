from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings

engine = create_engine(settings.database_url)
Sessionlocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()