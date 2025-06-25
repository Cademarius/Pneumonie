from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.auth.routes import router as auth_router
from app.api.prediction import router as prediction_router
from app.api.history import router as history_router

# Initialise la base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pneumonia Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir les images statiquement depuis /uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Inclusion des routeurs
app.include_router(auth_router)
app.include_router(prediction_router, prefix="/predictions", tags=["predictions"])
app.include_router(history_router, prefix="/history", tags=["history"])

@app.get("/")
def read_root():
    return {"message": "API OK"}
