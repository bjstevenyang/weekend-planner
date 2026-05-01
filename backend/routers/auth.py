import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from deps import create_session_token, get_current_user
from models import LoginToken, User
from schemas import SendLinkRequest, SendLinkResponse, UserOut, VerifyTokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

TOKEN_EXPIRY_MINUTES = 10
BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _send_magic_link(email: str, link: str) -> None:
    import resend
    resend.api_key = os.environ["RESEND_API_KEY"]
    resend.Emails.send({
        "from": "Weekend Planner <onboarding@resend.dev>",
        "to": email,
        "subject": "Your sign-in link for Weekend Planner",
        "html": (
            f"<p>Click the link below to sign in. It expires in {TOKEN_EXPIRY_MINUTES} minutes.</p>"
            f'<p><a href="{link}">{link}</a></p>'
        ),
    })


@router.post("/send-link", response_model=SendLinkResponse)
def send_magic_link(payload: SendLinkRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = User(email=payload.email)
        db.add(user)
        db.flush()

    plain_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(plain_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRY_MINUTES)

    login_token = LoginToken(
        user_id=user.id,
        email=payload.email,
        token_hash=token_hash,
        redirect_url=payload.redirect_url,
        expires_at=expires_at,
    )
    db.add(login_token)
    db.commit()

    redirect_param = f"&redirect={payload.redirect_url}" if payload.redirect_url else ""
    link = f"{BASE_URL}/auth/verify?token={plain_token}{redirect_param}"

    try:
        _send_magic_link(payload.email, link)
    except Exception:
        pass  # Don't expose email errors to caller; log in production

    return SendLinkResponse(message="Magic link sent. Check your email.")


@router.get("/verify", response_model=VerifyTokenResponse)
def verify_token(token: str = Query(...), db: Session = Depends(get_db)):
    token_hash = _hash_token(token)
    record = (
        db.query(LoginToken)
        .filter(LoginToken.token_hash == token_hash)
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="Invalid token")
    if record.used_at:
        raise HTTPException(status_code=400, detail="Token already used")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")

    record.used_at = datetime.now(timezone.utc)
    db.commit()

    user = db.query(User).filter(User.id == record.user_id).first()
    session_token = create_session_token(str(user.id))

    return VerifyTokenResponse(
        user_id=str(user.id),
        email=user.email,
        session_token=session_token,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
