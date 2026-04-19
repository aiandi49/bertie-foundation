"""Auth module - simplified for standalone deployment."""

from typing import Annotated, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.requests import HTTPConnection
from pydantic import BaseModel


class User(BaseModel):
    sub: str
    email: Optional[str] = None
    name: Optional[str] = None


class ApiKeyClaims(BaseModel):
    key: str


def get_authorized_user(request: HTTPConnection) -> User:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def get_authorized_apikey(request: HTTPConnection) -> ApiKeyClaims:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


def get_extra_stack_auth_metadata(request: HTTPConnection) -> Optional[dict]:
    return None


AuthorizedUser = Annotated[User, Depends(get_authorized_user)]
AuthorizedApiKey = Annotated[ApiKeyClaims, Depends(get_authorized_apikey)]
StackAuthUserData = Annotated[dict[str, Any] | None, Depends(get_extra_stack_auth_metadata)]
