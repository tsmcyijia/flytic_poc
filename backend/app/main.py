
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes import search, agent, auth, history
from app.db.base import init_db
app = FastAPI(title="Flytic API (Updated)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(agent.router, prefix="/api", tags=["agent"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(history.router, prefix="/api", tags=["history"])
if os.path.isdir("frontend/build"):
    app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
@app.on_event("startup")
def _startup():
    init_db()
