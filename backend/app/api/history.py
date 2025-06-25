# app/api/history.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.routes import get_current_user
from app.auth.models import User
from app.database import get_db
from app.auth import crud

from app.auth.schemas import AnalysisHistoryOut

router = APIRouter(tags=["history"])

@router.get("/", response_model=list[AnalysisHistoryOut])
def list_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analyses = crud.get_user_history(db, current_user)
    base_url = "http://localhost:8000/uploads/"

    result = []
    for a in analyses:
        patient_dict = {
            "id": a.patient.id,
            "nom": a.patient.nom,
            "prenom": a.patient.prenom,
            "age": a.patient.age,
            "sexe": a.patient.sexe,
        }
        result.append(
            AnalysisHistoryOut(
                id=a.id,
                file_name=a.file_name,
                verdict=a.verdict,
                probability=a.probability,
                confidence=a.confidence,
                timestamp=a.timestamp,
                patient=patient_dict,  # <-- passe un dict ici
                imageUrl=f"{base_url}{a.file_name}"
            )
        )
    return result


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