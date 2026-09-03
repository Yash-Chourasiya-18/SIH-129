from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    citizen_id: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    citizen_id: Optional[str] = None
    district: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}
