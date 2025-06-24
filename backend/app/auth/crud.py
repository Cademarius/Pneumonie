from sqlalchemy.orm import Session
from app.auth.models import User
from app.auth.security import get_password_hash, verify_password
from app.auth.models import AnalysisHistory

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, password: str):
    user = User(username=username, hashed_password=get_password_hash(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_profile(db: Session, user: User, first_name: str, last_name: str, email: str) -> User:
    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    db.commit()
    db.refresh(user)
    return user

def update_user_password(db: Session, user: User, current_password: str, new_password: str) -> bool:
    print("User hashed_password from DB:", user.hashed_password)
    print("Current password provided:", current_password)
    print("Verify password result:", verify_password(current_password, user.hashed_password))
    if not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    print("Password updated in DB")
    return True

def add_analysis(
    db: Session, user: User, file_name: str, verdict: str, probability: float, confidence: str
) -> AnalysisHistory:
    history = AnalysisHistory(
        user_id=user.id,
        file_name=file_name,
        verdict=verdict,
        probability=probability,
        confidence=confidence,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

def get_user_history(db: Session, user: User):
    return (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == user.id)
        .order_by(AnalysisHistory.timestamp.desc())
        .all()
    )

