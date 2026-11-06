from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas, crud
from backend.app.routers.auth import get_current_user, require_current_user
from backend.app.services.queue_engine import (
    transition_token_status,
    update_queue_positions_and_estimates
)
from backend.app.services.allocation_engine import recommend_counter_for_token
from backend.app.services.prediction_service import predict_waiting_time_for_queue
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/tokens", tags=["Tokens"])

def map_token_response(token: models.Token) -> schemas.TokenResponse:
    res = schemas.TokenResponse.model_validate(token)
    if token.assigned_counter:
        res.assigned_counter_name = f"Counter {token.assigned_counter.number} - {token.assigned_counter.name}"
    return res


@router.post("", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token(
    token_in: schemas.TokenCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    """Generates a new digital token with AI waiting-time prediction and optimal counter allocation."""
    user_id = current_user.id if current_user else None
    user_name = token_in.user_name or (current_user.full_name if current_user else "Walk-in Guest")
    user_phone = token_in.user_phone or (current_user.phone if current_user else None)

    # 1. AI Waiting Time Prediction
    pred = predict_waiting_time_for_queue(db, token_in.service_category, token_in.priority_level)
    estimated_wait = pred.get("predicted_wait_minutes", 10.0)

    # 2. Intelligent Counter Recommendation
    rec = recommend_counter_for_token(db, token_in.service_category, token_in.priority_level)
    assigned_counter_id = rec.get("recommended_counter_id")

    # 3. Create Token
    token_data = schemas.TokenCreate(
        service_category=token_in.service_category,
        priority_level=token_in.priority_level,
        user_name=user_name,
        user_phone=user_phone
    )
    token = crud.create_token(
        db,
        token_in=token_data,
        user_id=user_id,
        estimated_wait=estimated_wait,
        assigned_counter_id=assigned_counter_id
    )

    # 4. Update queue order according to priority policies
    await update_queue_positions_and_estimates(db, broadcast=False)
    db.refresh(token)

    # 5. Broadcast real-time creation
    await ws_manager.broadcast({
        "event": "TOKEN_CREATED",
        "token_id": token.id,
        "token_number": token.token_number,
        "service_category": token.service_category,
        "priority_level": token.priority_level,
        "queue_position": token.queue_position,
        "estimated_wait_minutes": token.estimated_wait_minutes,
        "assigned_counter_id": token.assigned_counter_id
    })

    return map_token_response(token)


@router.get("", response_model=List[schemas.TokenResponse])
def list_tokens(
    status: Optional[str] = Query(None, description="Filter by status (Waiting, Called, In Service, Completed, Cancelled, or All)"),
    service_category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    tokens = crud.get_tokens(db, status=status, service_category=service_category, limit=limit)
    return [map_token_response(t) for t in tokens]


@router.get("/user/active", response_model=List[schemas.TokenResponse])
def get_user_active_tokens(
    db: Session = Depends(get_db),
    user: models.User = Depends(require_current_user)
):
    """Retrieve currently active tokens for the logged-in user."""
    tokens = crud.get_active_tokens_for_user(db, user_id=user.id)
    return [map_token_response(t) for t in tokens]


@router.get("/{token_id}", response_model=schemas.TokenResponse)
def get_token(token_id: str, db: Session = Depends(get_db)):
    """Retrieve token details by integer ID or token number string (e.g. GEN-101)."""
    if token_id.isdigit():
        token = crud.get_token_by_id(db, int(token_id))
    else:
        token = crud.get_token_by_number(db, token_id)

    if not token:
        raise HTTPException(status_code=404, detail="Token not found.")
    return map_token_response(token)


@router.patch("/{token_id}/status", response_model=schemas.TokenResponse)
async def update_status(
    token_id: int,
    status_update: schemas.TokenStatusUpdate,
    db: Session = Depends(get_db)
):
    """Transition token status (Waiting -> Called -> In Service -> Completed / Cancelled)."""
    token = await transition_token_status(
        db,
        token_id=token_id,
        new_status=status_update.status,
        counter_id=status_update.counter_id
    )
    if not token:
        raise HTTPException(status_code=404, detail="Token not found.")
    return map_token_response(token)


@router.delete("/{token_id}", response_model=schemas.TokenResponse)
async def cancel_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user)
):
    """Cancel a token."""
    token = crud.get_token_by_id(db, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found.")

    if current_user and current_user.role != "admin" and token.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this token.")

    token = await transition_token_status(db, token_id=token_id, new_status="Cancelled")
    return map_token_response(token)
