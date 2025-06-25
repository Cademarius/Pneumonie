from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.auth.schemas import UserCreate, Token, UserUpdate, PasswordChange, UserLogin
from app.auth import crud
from app.auth.security import create_access_token, SECRET_KEY, ALGORITHM
from app.auth.models import User
from app.database import get_db

router = APIRouter(prefix="/auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Data reçue dans /register : {user.dict()}")
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = crud.create_user(
        db,
        username=user.username,
        password=user.password,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email
    )
    access_token = create_access_token({"sub": new_user.username})
    return Token(
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    auth_user = crud.authenticate_user(db, user.username, user.password)
    if not auth_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": auth_user.username})
    return Token(access_token=access_token, token_type="bearer")

@router.put("/update-profile")
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_user = crud.update_user_profile(
        db, current_user, data.first_name, data.last_name, data.email
    )
    return {
        "message": "Profile updated successfully",
        "user": {
            "first_name": updated_user.first_name,
            "last_name": updated_user.last_name,
            "email": updated_user.email,
        },
    }

@router.put("/change-password")
def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = crud.update_user_password(
        db, current_user, data.current_password, data.new_password
    )
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    return {"message": "Password updated successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "username": current_user.username,
    }

