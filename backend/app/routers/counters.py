from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas, crud
from backend.app.services.allocation_engine import recommend_counter_for_token
from backend.app.services.queue_engine import call_next_token
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/counters", tags=["Counters"])

def map_counter_response(db: Session, counter: models.Counter) -> schemas.CounterResponse:
    res = schemas.CounterResponse.model_validate(counter)
    # Count waiting tokens
    count = db.query(models.Token).filter(
        models.Token.status == "Waiting",
        models.Token.assigned_counter_id == counter.id
    ).count()
    res.waiting_count = count
    return res


@router.get("", response_model=List[schemas.CounterResponse])
def get_all_counters(db: Session = Depends(get_db)):
    counters = crud.get_counters(db)
    return [map_counter_response(db, c) for c in counters]


@router.post("", response_model=schemas.CounterResponse, status_code=status.HTTP_201_CREATED)
async def create_counter(counter_in: schemas.CounterCreate, db: Session = Depends(get_db)):
    existing = crud.get_counter_by_number(db, counter_in.number)
    if existing:
        raise HTTPException(status_code=400, detail=f"Counter with number {counter_in.number} already exists.")

    counter = crud.create_counter(db, counter_in)
    await ws_manager.broadcast({
        "event": "COUNTER_UPDATED",
        "counter_id": counter.id,
        "is_active": counter.is_active
    })
    return map_counter_response(db, counter)


@router.patch("/{counter_id}", response_model=schemas.CounterResponse)
async def update_counter(counter_id: int, counter_update: schemas.CounterUpdate, db: Session = Depends(get_db)):
    counter = crud.get_counter_by_id(db, counter_id)
    if not counter:
        raise HTTPException(status_code=404, detail="Counter not found.")

    updated = crud.update_counter(db, counter, counter_update)
    await ws_manager.broadcast({
        "event": "COUNTER_UPDATED",
        "counter_id": updated.id,
        "is_active": updated.is_active,
        "is_busy": updated.is_busy
    })
    return map_counter_response(db, updated)


@router.post("/recommend", response_model=schemas.CounterRecommendationResponse)
def get_recommendation(req: schemas.CounterRecommendationRequest, db: Session = Depends(get_db)):
    """Recommends the best counter for a given service category and priority with clear rationale."""
    res = recommend_counter_for_token(db, req.service_category, req.priority_level)
    return res


@router.post("/{counter_id}/call-next", response_model=schemas.TokenResponse)
async def call_next_token_endpoint(counter_id: int, db: Session = Depends(get_db)):
    """Staff calls the next priority waiting token for their counter."""
    token = await call_next_token(db, counter_id)
    if not token:
        raise HTTPException(status_code=404, detail="No eligible waiting tokens found for this counter.")
    
    res = schemas.TokenResponse.model_validate(token)
    if token.assigned_counter:
        res.assigned_counter_name = f"Counter {token.assigned_counter.number} - {token.assigned_counter.name}"
    return res
