from fastapi import Depends, FastAPI, status, HTTPException
import models, db_connection, db_operations, logs
from auth.auth_router import router
from auth.helpers import hash_password
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm.session import Session


app = FastAPI()
app.include_router(router)

async def startup():
    models.Base.metadata.create_all(bind=db_connection.engine)

async def shutdown():
    db_connection.SessionLocal().close()

app.add_event_handler("startup", startup)
app.add_event_handler("shutdown", shutdown)

origins = [
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/signup", status_code=status.HTTP_201_CREATED) 
async def create_user(user: models.UserCreate, db: Session = Depends(db_connection.get_db)):
    hashed_password = hash_password(user.password)
    user_data = user.model_dump()
    user_data['password'] = hashed_password

    try:
        new_user = db_operations.create_new_user(db, user_data)
        logs.create_logger.info(f'{new_user.role} "{new_user.email}" created successfully')
        return {"message": "User created successfully."}  
    except Exception as e: 
        # Handle potential errors, considering specific exception types
        logs.create_logger.info(f'{user.role} "{user.email}" create failed! Error detail: {str(e)}')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) 
