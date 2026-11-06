import random
import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import models, schemas, crud
from backend.app.services.queue_engine import (
    update_queue_positions_and_estimates,
    compute_what_if_scenarios
)
from backend.app.services.allocation_engine import recommend_counter_for_token
from backend.app.services.prediction_service import predict_waiting_time_for_queue
from backend.app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

FIRST_NAMES = ["Aarav", "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Karan", "Pooja", "Rohan", "Meera", "Arjun", "Neha", "Sanjay", "Kavita", "Aditya", "Riya", "Varun", "Divya"]
LAST_NAMES = ["Sharma", "Verma", "Patel", "Reddy", "Singh", "Nair", "Iyer", "Choudhury", "Gupta", "Kumar", "Deshmukh", "Joshi"]

CATEGORIES = [
    "General Consultation",
    "Emergency",
    "Billing",
    "Registration",
    "Laboratory",
    "Other Services"
]

@router.post("/arrivals")
async def simulate_arrivals(req: schemas.SimulationArrivalsRequest, db: Session = Depends(get_db)):
    """Simulates realistic batch arrivals (10, 25, 50 users) with automated ML wait estimation and assignment."""
    created_tokens = []
    
    for _ in range(req.count):
        # Pick category
        if req.service_category and req.service_category != "Random":
            cat = req.service_category
        else:
            cat = random.choices(CATEGORIES, weights=[0.40, 0.08, 0.22, 0.15, 0.10, 0.05])[0]

        # Pick priority
        if req.priority_level and req.priority_level != "Random":
            prio = req.priority_level
        elif cat == "Emergency":
            prio = "Emergency"
        else:
            prio = random.choices(["Regular", "Senior/Disabled", "VIP"], weights=[0.75, 0.18, 0.07])[0]

        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        phone = f"+91 {random.randint(90000, 99999)} {random.randint(10000, 99999)}"

        pred = predict_waiting_time_for_queue(db, cat, prio)
        rec = recommend_counter_for_token(db, cat, prio)

        tkn = crud.create_token(
            db,
            token_in=schemas.TokenCreate(
                service_category=cat,
                priority_level=prio,
                user_name=name,
                user_phone=phone
            ),
            user_id=None,
            estimated_wait=pred.get("predicted_wait_minutes", 10.0),
            assigned_counter_id=rec.get("recommended_counter_id")
        )
        created_tokens.append(tkn.token_number)

    # Rebalance queue and recalculate positions
    await update_queue_positions_and_estimates(db, broadcast=True)

    await ws_manager.broadcast({
        "event": "SIMULATION_ARRIVALS",
        "count": req.count,
        "sample_tokens": created_tokens[:5],
        "message": f"Successfully injected {req.count} simulated arrivals into the queue."
    })

    return {
        "status": "success",
        "injected_count": req.count,
        "sample_tokens": created_tokens[:5],
        "message": f"Successfully generated {req.count} simulated tokens and recalculated queue positions."
    }


@router.post("/delay")
async def simulate_delay(req: schemas.SimulationDelayRequest, db: Session = Depends(get_db)):
    """Simulates an unexpected delay at a counter and updates wait times."""
    if req.counter_id:
        counter = db.query(models.Counter).filter(models.Counter.id == req.counter_id).first()
    else:
        counter = db.query(models.Counter).filter(models.Counter.is_active == True).first()

    if not counter:
        raise HTTPException(status_code=404, detail="No active counter found to apply delay.")

    counter.avg_service_time = round(counter.avg_service_time + req.delay_minutes, 1)
    db.commit()

    # Trigger Alert
    alert = models.Alert(
        severity="High",
        title=f"Service Delay at Counter {counter.number}",
        message=f"Counter {counter.number} ({counter.name}) experiencing severe operational delay (+{req.delay_minutes} min). Reason: {req.reason}",
        counter_id=counter.id,
        recommended_action="Reassign waiting tokens to adjacent active counters or dispatch supervisor."
    )
    db.add(alert)
    db.commit()

    await update_queue_positions_and_estimates(db, broadcast=True)

    await ws_manager.broadcast({
        "event": "SIMULATION_DELAY",
        "counter_id": counter.id,
        "counter_number": counter.number,
        "delay_minutes": req.delay_minutes
    })

    return {
        "status": "success",
        "counter_id": counter.id,
        "counter_number": counter.number,
        "new_avg_service_time": counter.avg_service_time,
        "message": f"Applied {req.delay_minutes} min operational delay to Counter {counter.number}."
    }


@router.post("/counter-closure")
async def simulate_counter_closure(req: schemas.SimulationCounterClosureRequest, db: Session = Depends(get_db)):
    """Simulates sudden counter shutdown / staff break and reroutes affected tokens."""
    if req.counter_id:
        counter = db.query(models.Counter).filter(models.Counter.id == req.counter_id, models.Counter.is_active == True).first()
    else:
        counter = db.query(models.Counter).filter(models.Counter.is_active == True).first()

    if not counter:
        raise HTTPException(status_code=400, detail="No active counter available to close.")

    counter.is_active = False
    counter.is_busy = False
    db.commit()

    # Reroute waiting tokens assigned to this counter
    displaced_tokens = db.query(models.Token).filter(
        models.Token.status == "Waiting",
        models.Token.assigned_counter_id == counter.id
    ).all()

    for token in displaced_tokens:
        rec = recommend_counter_for_token(db, token.service_category, token.priority_level)
        token.assigned_counter_id = rec.get("recommended_counter_id")

    # Alert
    alert = models.Alert(
        severity="Medium",
        title=f"Counter {counter.number} Closed Unscheduled",
        message=f"Counter {counter.number} has been deactivated. {len(displaced_tokens)} waiting tokens were automatically rerouted to alternative counters.",
        counter_id=counter.id,
        recommended_action="Activate a backup counter or adjust staff shifts."
    )
    db.add(alert)
    db.commit()

    await update_queue_positions_and_estimates(db, broadcast=True)

    await ws_manager.broadcast({
        "event": "COUNTER_CLOSED",
        "counter_id": counter.id,
        "counter_number": counter.number,
        "rerouted_tokens": len(displaced_tokens)
    })

    return {
        "status": "success",
        "closed_counter_id": counter.id,
        "closed_counter_number": counter.number,
        "rerouted_tokens_count": len(displaced_tokens),
        "message": f"Counter {counter.number} closed and {len(displaced_tokens)} tokens rerouted."
    }


@router.post("/reset")
async def reset_simulation(db: Session = Depends(get_db)):
    """Resets queue to a clean balanced operational state with default counters and sample queue."""
    # Clear tokens and alerts
    db.query(models.Token).delete()
    db.query(models.Alert).delete()
    
    # Reset counters to default service times
    counters = db.query(models.Counter).all()
    default_times = {1: 8.0, 2: 7.0, 3: 4.5, 4: 5.0, 5: 10.0, 6: 12.0}
    for c in counters:
        c.is_active = True
        c.is_busy = False
        c.current_token_id = None
        c.avg_service_time = default_times.get(c.number, 8.0)
        c.total_served = 12

    db.commit()

    # Seed 6 balanced waiting tokens for immediate realistic display
    sample_seed = [
        ("GEN", "General Consultation", "Regular", "Ananya Sharma"),
        ("GEN", "General Consultation", "Senior/Disabled", "Ramesh Verma"),
        ("BIL", "Billing", "Regular", "Kavita Reddy"),
        ("REG", "Registration", "Regular", "Vikram Singh"),
        ("LAB", "Laboratory", "Regular", "Priya Nair"),
        ("EMG", "Emergency", "Emergency", "Critical Patient")
    ]

    for idx, (pfx, cat, prio, name) in enumerate(sample_seed):
        token = models.Token(
            token_number=f"{pfx}-10{idx+1}",
            user_name=name,
            service_category=cat,
            priority_level=prio,
            status="Waiting",
            assigned_counter_id=(idx % max(1, len(counters))) + 1 if counters else None,
            queue_position=idx + 1,
            estimated_wait_minutes=round((idx + 1) * 3.5, 1)
        )
        db.add(token)

    db.commit()

    await update_queue_positions_and_estimates(db, broadcast=True)

    await ws_manager.broadcast({
        "event": "SIMULATION_RESET",
        "message": "Queue system reset to baseline demo state."
    })

    return {"status": "success", "message": "Simulation reset successfully to standard initial state."}


@router.get("/what-if", response_model=schemas.WhatIfComparisonResponse)
def get_what_if_analysis(db: Session = Depends(get_db)):
    """Runs What-If capacity simulation comparing baseline, +1 counter, and AI dynamic optimization."""
    return compute_what_if_scenarios(db)
