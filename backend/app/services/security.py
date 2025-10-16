
import os, time, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_SUPER_SECRET")
JWT_ALG = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", "604800"))
def hash_password(pw: str) -> str: return pwd_context.hash(pw)
def verify_password(pw: str, hashed: str) -> bool: return pwd_context.verify(pw, hashed)
def create_token(user_id: int) -> str:
    payload = {"user_id": user_id, "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
bearer = HTTPBearer(auto_error=False)
def get_current_user_id(token: HTTPAuthorizationCredentials = Depends(bearer)) -> int | None:
    if not token: return None
    try:
        data = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        return int(data.get("user_id"))
    except Exception:
        raise HTTPException(status_code=401, detail="無效或逾期的登入憑證")
