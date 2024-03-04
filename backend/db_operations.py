from fastapi import HTTPException, status
from sqlalchemy.orm import Session, aliased, outerjoin
from models import User, Item, UserAdminSuspension, UserCreate, ItemCreate, Role
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, or_, func
import logs

def get_user_by_email(db:Session, email:str):
    user = db.query(User).filter(User.email == email).first()
    return user

def get_user_by_id(db:Session, id:int):
    user = db.query(User).filter(User.id == id).first()
    return user

def get_suspension(db:Session, suspended_id:int):
    suspension = db.query(UserAdminSuspension).filter(UserAdminSuspension.suspended_user_id==suspended_id).first()
    return suspension

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
    

def update_item(db: Session, item_id: int, item_data: ItemCreate):
    current_item = db.query(Item).filter(Item.id == item_id).first()
    if not current_item:
        return None 

    for key, value in item_data.model_dump(exclude_unset=True).items():
        setattr(current_item, key, value)

    db.add(current_item)  # Stage the changes
    db.commit()      # Save the changes to the database
    db.refresh(current_item)  # Refresh the object with updated values
    return current_item

def get_all_users(db:Session, onlyBasics=False):
    suspended_alias = aliased(User)  

    query = select(
            User,
            func.coalesce(suspended_alias.email, '')
        ) \
        .outerjoin(UserAdminSuspension, User.id == UserAdminSuspension.suspended_user_id) \
        .outerjoin(suspended_alias, UserAdminSuspension.suspending_admin_id == suspended_alias.id)
    
    if onlyBasics:
        query = query.where(User.role == Role.BasicUser)
    
    result = db.execute(query)
    users = result.fetchall() 

    return users

def suspend_user(db: Session, user_to_suspend:User, suspending_user:User):
    try:
        setattr(user_to_suspend, 'is_suspended', True)
        suspension = UserAdminSuspension(
            suspended_user_id=user_to_suspend.id,
            suspending_admin_id=suspending_user.id
        )

        db.add(user_to_suspend)
        db.add(suspension)  
        db.commit()      # Save the changes to the database
        db.refresh(user_to_suspend)  # Refresh the object with updated values
        return True
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database failed"
        )
    
def bring_back_user(db:Session, user_to_bring:User, suspension: UserAdminSuspension):
    try:
        setattr(user_to_bring, 'is_suspended', False)
        db.delete(suspension)
        db.commit()
        db.refresh(user_to_bring)
        return True
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database failed"
        )