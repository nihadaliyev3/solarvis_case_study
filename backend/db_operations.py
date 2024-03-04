from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models import User, Item, UserAdminSuspension, UserCreate
from sqlalchemy.exc import IntegrityError
import logs

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
    
def get_all_items(db:Session):
    query = db.query(Item, User.email).join(User, User.id == Item.user_id)
    results = query.all()
    return results

def get_items_of_user(db:Session, current_user:User):
    query = db.query(Item, User.email).join(User, User.id == Item.user_id).filter(Item.user_id == current_user.id)
    results = query.all()
    return results

def remove_item(db:Session, item_id:int, user:User):
    item_to_delete = db.query(Item).filter(Item.id == item_id).first()
    if not item_to_delete:
        return False
    
    if user.role == 'BasicUser' and item_to_delete.user_id != user.id:
        logs.update_logger.error(f'Basic User {user.email} failed to delete item {item_to_delete.id} of another user')
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Item does not belong to User",
            )
    db.delete(item_to_delete)
    db.commit()
    return True

def create_new_item(db:Session, item:dict):
    try:
        new_item = Item(
            name=item['name'],
            description=item['description'],
            create_date=item['create_date'],
            user_id=item['user_id']
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item  
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database failed"
        )