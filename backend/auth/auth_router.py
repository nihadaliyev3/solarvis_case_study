from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm.session import Session
from .helpers import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from db_connection import get_db  # Adjust import path as needed
from datetime import datetime, timedelta
from logs import login_logger


router = APIRouter(prefix="/auth")

def print_some():
    print('something')
    return 'ok'

@router.post("/signin")
async def signin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = await authenticate_user(form_data.username, form_data.password, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}, expires_delta=access_token_expires
        )
        login_logger.error(f'Successful login of {user.email}')
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        login_logger.error(f'Failed login for {form_data.username}')
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Incorrect username or password" 
        )