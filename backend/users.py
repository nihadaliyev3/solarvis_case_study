from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm.session import Session
from auth.helpers import get_current_user, hash_password
from db_connection import get_db  # Adjust import path as needed
from db_operations import create_new_user, get_all_users, get_user_by_id, suspend_user, get_suspension, bring_back_user
from models import User,  UserCreate, UserSuspend
import logs
from datetime import datetime

users_router = APIRouter(prefix="/users")

@users_router.post("/signup", status_code=status.HTTP_201_CREATED) 
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    user_data = user.model_dump()
    user_data['password'] = hashed_password

    try:
        new_user = create_new_user(db, user_data)
        logs.create_logger.info(f'{new_user.role} "{new_user.email}" created successfully')
        return {"message": "User created successfully."}  
    except Exception as e: 
        # Handle potential errors, considering specific exception types
        logs.create_logger.error(f'{user.role} "{user.email}" create failed! Error detail: {str(e)}')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 


@users_router.get("/all")
async def fetch_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    response_users = []
    if current_user.role.value == "SuperAdmin":
        results = get_all_users(db)
    elif current_user.role.value == "Admin":
        results = get_all_users(db, onlyBasics=True)
        response_users.append({
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "role": current_user.role,
            "is_suspended": str(current_user.is_suspended),
            "suspended_by": "",
        })
        
    else:  # Basic user
        results = [(current_user, '')]
    
    for user, email in results:  
        response_users.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "is_suspended": str(user.is_suspended),
            "suspended_by": email,
        })
    return response_users

@users_router.put("/suspend/{id}", status_code=status.HTTP_200_OK)
async def user_suspend(id: int, suspend_info: UserSuspend, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_to_suspend = get_user_by_id(db, id)

    if not user_to_suspend:
        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found" 
        )
    
    if user_to_suspend.role == 'SuperAdmin' or current_user.role=='BasicUser':
            raise HTTPException(status_code=401, detail="Unauthorized")
    
    if suspend_info.is_suspended:
        if user_to_suspend.is_suspended:
            HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The User already suspended") 

        try:
            suspend_user(db, user_to_suspend, current_user)
            logs.suspensions_logger.info(f'{current_user.email} suspended {user_to_suspend.email}!')
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 
        
    else:
        suspension = get_suspension(db, user_to_suspend.id)
        if not suspension:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suspension not found" 
                )
        
        if current_user.role == 'Admin' and suspension.suspending_admin_id != current_user.id:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        try:
            bring_back_user(db, user_to_suspend, suspension)
            logs.suspensions_logger.info(f'{current_user.email} bringed {user_to_suspend.email} back!')
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 
        
        