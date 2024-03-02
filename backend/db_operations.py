from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models import User, Item, UserAdminSuspension, UserCreate
from sqlalchemy.exc import IntegrityError

def get_user_by_email(db:Session, email:str):
    user = db.query(User).filter(User.email == email).first()
    return user

def create_new_user(db:Session, user: dict):
    if user['role'] == "SuperAdmin":
        if db.query(User).filter(User.role == 'SuperAdmin').first():
            raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="There can be only one super admin."
                )

    try:
        new_user = User(
            first_name=user['firstName'],
            last_name=user['lastName'],
            email=user['email'],
            password=user['password'],
            role=user['role'],
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user  
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already used"
        )