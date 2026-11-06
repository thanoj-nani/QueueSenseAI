from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas, crud
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[schemas.AlertResponse])
def list_alerts(
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    alerts = crud.get_alerts(db, resolved=resolved, limit=limit)
    return alerts


@router.post("", response_model=schemas.AlertResponse)
async def create_alert(alert_in: schemas.AlertCreate, db: Session = Depends(get_db)):
    alert = crud.create_alert(db, alert_in)
    await ws_manager.broadcast({
        "event": "ALERT_TRIGGERED",
        "alert_id": alert.id,
        "severity": alert.severity,
        "title": alert.title,
        "message": alert.message
    })
    return alert


@router.patch("/{alert_id}", response_model=schemas.AlertResponse)
async def resolve_alert_endpoint(alert_id: int, db: Session = Depends(get_db)):
    alert = crud.resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    await ws_manager.broadcast({
        "event": "ALERT_RESOLVED",
        "alert_id": alert.id
    })
    return alert
