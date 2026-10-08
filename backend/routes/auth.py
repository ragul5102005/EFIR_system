"""Authentication and User Profile routes."""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from utils.json_storage import append_json, load_json, save_json

router = APIRouter(prefix="", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=4, max_length=100)


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    contact_info: str = Field(default="", max_length=200)


@router.post("/auth/login")
@router.post("/api/auth/login")
def login(credentials: LoginRequest) -> Dict[str, Any]:
    users = load_json("users", default=[])
    user = next(
        (u for u in users if u.get("email", "").lower() == credentials.email.lower() and u.get("password") == credentials.password),
        None
    )
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    clean_user = {k: v for k, v in user.items() if k != "password"}
    return {
        "user": clean_user,
        "token": f"demo-token-{user.get('id')}",
        "message": f"Welcome back, {user.get('name')}!"
    }


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
@router.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> Dict[str, Any]:
    users = load_json("users", default=[])
    if any(u.get("email", "").lower() == payload.email.lower() for u in users):
        raise HTTPException(status_code=409, detail="This email address is already registered.")
    
    new_id = max([int(u.get("id", 0)) for u in users] or [0]) + 1
    new_user = {
        "id": new_id,
        "name": payload.name,
        "email": payload.email,
        "password": payload.password,
        "role": "citizen",
        "contact_info": payload.email
    }
    append_json("users", new_user)
    clean_user = {k: v for k, v in new_user.items() if k != "password"}
    return {
        "user": clean_user,
        "token": f"demo-token-{new_id}",
        "message": "Account registered successfully."
    }


@router.get("/auth/profile/{user_id}")
@router.get("/api/auth/profile/{user_id}")
def get_profile(user_id: int) -> Dict[str, Any]:
    users = load_json("users", default=[])
    user = next((u for u in users if u.get("id") == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    return {k: v for k, v in user.items() if k != "password"}


@router.patch("/auth/profile/{user_id}")
@router.patch("/api/auth/profile/{user_id}")
def update_profile(user_id: int, payload: ProfileUpdate) -> Dict[str, Any]:
    users = load_json("users", default=[])
    user = next((u for u in users if u.get("id") == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    user["name"] = payload.name
    user["contact_info"] = payload.contact_info
    save_json("users", users)
    return {k: v for k, v in user.items() if k != "password"}


@router.get("/auth/users")
@router.get("/api/auth/users")
def list_demo_users() -> List[Dict[str, Any]]:
    """Return public demo account identities for easy testing."""
    users = load_json("users", default=[])
    return [{k: v for k, v in u.items() if k != "password"} for u in users]
