from sqlalchemy import Column, Integer, MetaData, String, Text, Enum, ForeignKey, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum
from pydantic import BaseModel


Base = declarative_base(metadata=MetaData())


class Role(enum.Enum):
    SuperAdmin = "SuperAdmin"
    Admin = "Admin"
    BasicUser = "BasicUser"

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True)
    is_suspended = Column(Boolean)
    

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True)
    password = Column(String(124))
    role = Column(Enum(Role))
    is_suspended = Column(Boolean, default=False, nullable=True)
    items = relationship('Item', backref='owner', cascade='all, delete')

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text, nullable=True)
    create_date = Column(DateTime, default=datetime.utcnow, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

class UserAdminSuspension(Base):
    __tablename__ = "user_admin_suspensions"
    id = Column(Integer, primary_key=True, index=True)
    suspended_user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    suspending_admin_id = Column(Integer, ForeignKey("users.id"))
    suspension_date = Column(DateTime, default=datetime.utcnow)
    suspending_admin = relationship("User", foreign_keys=[suspending_admin_id])
    suspended_user = relationship("User", foreign_keys=[suspended_user_id]) 


class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    role: str

class ItemCreate(BaseModel):
    name: str
    description: str| None
    
class UserSuspend(BaseModel):
    is_suspended: bool