from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User
from app.schemas import mfa as mfa_schemas
from app.schemas.token import Token
from app.core import security
from app.core.config import settings
from jose import jwt
from datetime import timedelta
from pydantic import ValidationError
import pyotp

router = APIRouter()

@router.post("/setup", response_model=mfa_schemas.MFASetupResponse)
def setup_mfa(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate MFA secret and QR code URI.
    """
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is already enabled")
    
    secret = pyotp.random_base32()
    current_user.mfa_secret = secret
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="GatedCommunity"
    )
    
    return {
        "secret": secret,
        "otpauth_url": provisioning_uri
    }

@router.post("/verify-setup")
def verify_mfa_setup(
    data: mfa_schemas.MFAVerifyRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Verify MFA setup and enable it.
    """
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is already enabled")
    
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA setup not initiated")
        
    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(data.token):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    current_user.mfa_enabled = True
    db.add(current_user)
    db.commit()
    
    return {"message": "MFA enabled successfully"}

@router.post("/disable")
def disable_mfa(
    data: mfa_schemas.MFAVerifyRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Disable MFA.
    """
    if not current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")
        
    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(data.token):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.add(current_user)
    db.commit()
    
    return {"message": "MFA disabled successfully"}

@router.post("/login", response_model=Token)
def mfa_login(
    data: mfa_schemas.MFALoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Verify MFA code and return access token.
    """
    try:
        payload = jwt.decode(
            data.temp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "mfa_pending":
             raise HTTPException(status_code=400, detail="Invalid token type")
        user_id = payload.get("sub")
    except (jwt.JWTError, ValidationError):
        raise HTTPException(status_code=403, detail="Could not validate credentials")
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(data.token):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
