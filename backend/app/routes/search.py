
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.ai_tools import search_flights
from app.db.base import SessionLocal
from app.db.models import History
from app.services.security import get_current_user_id
router = APIRouter()
class SearchPayload(BaseModel):
    origin: str; destination: str; depart_date: str; return_date: str | None = None; adults: int = 1
@router.post("/search")
def do_search(p: SearchPayload, user_id: int | None = Depends(get_current_user_id)):
    import json
    data_json = search_flights(p.origin.upper(), p.destination.upper(), p.depart_date, p.return_date, p.adults)
    try: data = json.loads(data_json)
    except Exception: raise HTTPException(500, "搜尋解析失敗")
    if user_id:
        db = SessionLocal(); h = History(user_id=user_id, origin=p.origin.upper(), destination=p.destination.upper(), depart_date=p.depart_date, return_date=p.return_date); db.add(h); db.commit(); db.close()
    return {"results": data.get("flights", []), "note": data.get("note"), "error": data.get("error")}
