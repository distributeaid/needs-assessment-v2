import jwt
from datetime import datetime, timedelta
from flask import request, current_app
from backend.models import User


def generate_jwt_payload(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(seconds=current_app.config["JWT_EXP_DELTA_SECONDS"]),
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm=current_app.config["JWT_ALGORITHM"])
    return token


class JWTError(Exception):
    pass

def get_jwt_payload():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise JWTError("Missing authorization header")
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise JWTError("Invalid authorization header format")
    token = parts[1]
    try:
        payload = jwt.decode(token, current_app.config.get("JWT_SECRET"),
                             algorithms=[current_app.config.get("JWT_ALGORITHM")])
    except jwt.ExpiredSignatureError:
        raise JWTError("Token has expired")
    except jwt.InvalidTokenError:
        raise JWTError("Invalid token")
    return payload

def get_current_user():
    payload = get_jwt_payload()
    user_id = payload.get("user_id")

    if not user_id:
        raise JWTError("Invalid token payload: missing user_id")

    user = User.query.get(user_id)
    if not user:
        raise JWTError("User not found")
    return user