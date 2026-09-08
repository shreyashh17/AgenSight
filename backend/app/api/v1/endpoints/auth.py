from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.models import User
from app.schemas.schemas import UserRegisterRequest, UserLoginRequest, UserResponse, AuthTokenResponse, UserUpdateRequest, ChangePasswordRequest

router = APIRouter()

@router.post("/register", response_model=AuthTokenResponse)
async def register(
    request: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    email = request.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email address is required")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Check if user already exists
    stmt = select(User).where(User.email == email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    hashed = hash_password(request.password)
    user = User(
        email=email,
        name=request.name.strip() or email.split("@")[0].capitalize(),
        hashed_password=hashed,
        role="analyst",
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={request.name}&backgroundColor=6c35f7&textColor=ffffff"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthTokenResponse)
async def login(
    request: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    email = request.email.strip().lower()
    stmt = select(User).where(User.email == email)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.post("/demo-login", response_model=AuthTokenResponse)
async def demo_login(
    db: AsyncSession = Depends(get_db)
):
    """
    1-Click instant demo login for reviewers and demonstrators.
    """
    demo_email = "analyst@agentsight.ai"
    stmt = select(User).where(User.email == demo_email)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user:
        user = User(
            email=demo_email,
            name="Alex Thorne",
            hashed_password=hash_password("DemoPassword123!"),
            role="Lead Research Analyst",
            avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=AlexThorne&backgroundColor=6c35f7&textColor=ffffff"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.model_validate(user)

@router.put("/me", response_model=UserResponse)
async def update_profile(
    request: UserUpdateRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Update the current user's profile (name, avatar)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.name is not None:
        user.name = request.name.strip()
    if request.avatar_url is not None:
        user.avatar_url = request.avatar_url

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)

@router.put("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """Change the current user's password."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.get(User, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.hashed_password = hash_password(request.new_password)
    await db.commit()
    return {"success": True, "message": "Password changed successfully"}
