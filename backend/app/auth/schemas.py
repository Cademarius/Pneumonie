from pydantic import BaseModel, EmailStr
from datetime import datetime

class PatientCreate(BaseModel):
    nom: str
    prenom: str
    age: int
    sexe: str

class PatientOut(PatientCreate):
    id: int

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: EmailStr

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class AnalysisHistoryOut(BaseModel):
    id: int
    file_name: str
    verdict: str
    probability: float
    confidence: str
    timestamp: datetime
    patient: PatientOut
    imageUrl: str  # <- Nouveau

    class Config:
        orm_mode = True