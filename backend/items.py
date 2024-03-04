from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm.session import Session
from auth.helpers import get_current_user
from db_connection import get_db  # Adjust import path as needed
from db_operations import get_all_items, get_items_of_user, remove_item, create_new_item
from models import User, Item, ItemCreate
import logs
from datetime import datetime

items_router = APIRouter(prefix="/items")

@items_router.get("/all")
async def fetch_all_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.value in ["Admin", "SuperAdmin"]:
        results = get_all_items(db)
    else:  # Basic user
        results = get_items_of_user(db, current_user)
    response_items = []
    for item, email in results:  
        response_items.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "create_date": item.create_date,
            "user_email": email
        })

    return response_items 

@items_router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = remove_item(db, item_id=id, user=current_user)
    if not result:
        logs.update_logger.error(f'Item with id {id} not found to be deleted by user {current_user.email}')
        raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found" 
    )
    logs.update_logger.info(f'{current_user.email} deleted item {id}')

@items_router.post("/new_item", status_code=status.HTTP_201_CREATED) 
async def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == 'Admin':
        logs.create_logger.error(f'Admin {current_user.email} tried to create item.')
        raise HTTPException(status_code=401, detail="Admins cannot create item.")
    item_data = item.model_dump()
    item_data['user_id'] = current_user.id
    item_data['create_date'] = datetime.now()

    try:
        create_new_item(db, item_data)
        logs.create_logger.info(f'{current_user.email} created item {item.name}')
        return {"message": "Item created successfully."} 
    except Exception as e: 
        logs.create_logger.error(f'{current_user.email} failed to create item {str(item_data)}! Error detail: {str(e)}')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 