
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, FastAPI, HTTPException, status
from models import User
from db_connection import get_db, SessionLocal
from dotenv import load_dotenv 
import os
from sqlalchemy.orm import Session
from db_operations import get_user_by_email
from passlib.context import CryptContext


load_dotenv() 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/signin")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Access the variables
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email)
    if not user:
        return False
    elif user.is_suspended:
        return False
    if not verify_password(password, user.password):
        return False
    
    return user


#Role Verifications
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub") 
        role: str = payload.get("role")  # Extract the role
        # Expiration Check
        exp = payload.get("exp")
        if datetime.utcnow() > datetime.utcfromtimestamp(exp):
            #raise HTTPException(status_code=401, detail="Token expired")
            pass
        
        if email is None:
            raise credentials_exception
        user = get_user_by_email(db, email)
        if user is None:
            raise credentials_exception
        if user.is_suspended:
            raise credentials_exception
        return user  
    except JWTError:
        raise credentials_exception

async def verify_admin_role(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin": 
        raise HTTPException(status_code=403, detail="Forbidden")
    return current_user  # If they are an admin, execution continues


def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

