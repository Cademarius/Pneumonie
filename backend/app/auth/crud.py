# app/auth/crud.py
from sqlalchemy.orm import Session, joinedload
from app.auth.models import User, Patient, AnalysisHistory
from app.auth.security import get_password_hash, verify_password
from app.auth.schemas import PatientCreate


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(
    db: Session,
    username: str,
    password: str,
    first_name: str,
    last_name: str,
    email: str
) -> User:
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        first_name=first_name,
        last_name=last_name,
        email=email
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_profile(
    db: Session, user: User, first_name: str, last_name: str, email: str
) -> User:
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    db.commit()
    db.refresh(user)
    return user

def update_user_password(
    db: Session, user: User, current_password: str, new_password: str
) -> bool:
    if not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return True

def create_patient(db: Session, patient_data: PatientCreate) -> Patient:
    patient = Patient(
        nom=patient_data.nom,
        prenom=patient_data.prenom,
        age=patient_data.age,
        sexe=patient_data.sexe
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def add_analysis(
    db: Session,
    current_user: User,
    file_name: str,
    verdict: str,
    probability: float,
    confidence: str,
    patient_id: int
) -> AnalysisHistory:
    history = AnalysisHistory(
        user_id=current_user.id,
        patient_id=patient_id,
        file_name=file_name,
        verdict=verdict,
        probability=probability,
        confidence=confidence
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

def get_user_history(db: Session, user: User):
    return (
        db.query(AnalysisHistory)
        .options(joinedload(AnalysisHistory.patient))  # <-- important !
        .filter(AnalysisHistory.user_id == user.id)
        .order_by(AnalysisHistory.timestamp.desc())
        .all()
    )