import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.auth import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Требуется авторизация")
    if not creds:
        raise unauthorized
    try:
        payload = decode_access_token(creds.credentials)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный или просроченный токен")
    user = db.get(User, user_id)
    if not user:
        raise unauthorized
    return user


def get_current_teacher(current_user: User = Depends(get_current_user)) -> User:
    """Дополнительная проверка роли поверх обычной авторизации."""
    if current_user.role != "teacher":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Доступно только преподавателям")
    return current_user