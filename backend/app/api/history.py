# app/api/history.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.routes import get_current_user
from app.auth.models import User
from app.database import get_db
from app.auth import crud

from app.auth.schemas import AnalysisHistoryOut

# Ici, on retire le préfixe :
router = APIRouter(tags=["history"])

@router.get("/", response_model=list[AnalysisHistoryOut])
def list_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_user_history(db, current_user)

@router.post("/", response_model=dict)
def add_history(
    file_name: str,
    verdict: str,
    probability: float,
    confidence: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = crud.add_analysis(
        db, current_user, file_name, verdict, probability, confidence
    )
    return {
        "message": "Saved successfully",
        "history_id": history.id,
    }




