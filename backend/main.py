from fastapi import Depends, FastAPI, status, HTTPException
import models, db_connection, db_operations, logs, items, users
from auth.auth_router import router
from auth.helpers import hash_password
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm.session import Session


app = FastAPI()
app.include_router(router)
app.include_router(items.items_router)
app.include_router(users.users_router)

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
