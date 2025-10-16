
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.db.models import History
from app.services.security import get_current_user_id
router = APIRouter()
@router.get("/history")
def my_history(user_id: int | None = Depends(get_current_user_id)):
    if not user_id: raise HTTPException(401, "請先登入")
    db: Session = SessionLocal()
    try:
        rows = db.query(History).filter_by(user_id=user_id).order_by(History.created_at.desc()).limit(50).all()
        data = [{"origin":r.origin,"destination":r.destination,"depart_date":r.depart_date,"return_date":r.return_date,"created_at":r.created_at.isoformat()} for r in rows]
        return {"history": data}
    finally: db.close()
