from fastapi import APIRouter
from app.api.v1.endpoints import visitors, login, users

api_router = APIRouter()

@api_router.get("/health", tags=["system"])
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(visitors.router, prefix="/visitors", tags=["visitors"])
