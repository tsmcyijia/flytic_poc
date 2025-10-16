
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.db.models import User
from app.services.security import hash_password, verify_password, create_token
router = APIRouter()
class RegPayload(BaseModel): username: str; password: str
@router.post("/auth/register")
def register(p: RegPayload):
    db: Session = SessionLocal()
    try:
        if db.query(User).filter_by(username=p.username).first(): raise HTTPException(400, "帳號已存在")
        user = User(username=p.username, password_hash=hash_password(p.password)); db.add(user); db.commit()
        return {"ok": True, "message": "註冊成功"}
    finally: db.close()
class LoginPayload(BaseModel): username: str; password: str
@router.post("/auth/login")
def login(p: LoginPayload):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter_by(username=p.username).first()
        if not user or not verify_password(p.password, user.password_hash): raise HTTPException(401, "帳號或密碼錯誤")
        token = create_token(user.id); return {"token": token}
    finally: db.close()
