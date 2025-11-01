# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import models, connection
from routers import users, auth, files, visualize,ai

# Veritabanı tablolarını oluştur (eğer yoksa)
# Artık UserDB ve FileDB tablolarını da oluşturacak
models.Base.metadata.create_all(bind=connection.engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Bu adreslerden gelen isteklere "İZİN VER"
    allow_credentials=True,
    allow_methods=["*"],         # Tüm metotlara (GET, POST, vb.) "İZİN VER"
    allow_headers=["*"],         # Tüm başlıklara (Authorization dahil) "İZİN VER"
)
# YENİ EKLENEN ROUTER'LAR
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)
app.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)
app.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI ChatBot"]
)
# --- BİTTİ ---
app.include_router(
    files.router,
    prefix="/files",
    tags=["Files"]
)
app.include_router(
    visualize.router,
    prefix="/visualize",
    tags=["Visualize"]
)


@app.get("/")
def read_root():
    return {"message": "VisData API'ye Hoş Geldiniz!"}