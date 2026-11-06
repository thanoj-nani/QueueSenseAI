import datetime
from sqlalchemy.orm import Session
from backend.app import models
from backend.app.ml.predict import predictor

def predict_waiting_time_for_queue(
    db: Session,
    service_category: str,
    priority_level: str = "Regular"
) -> dict:
    """Calculates waiting time prediction based on real-time database state."""
    # Count waiting tokens in this category or overall
    people_waiting = db.query(models.Token).filter(
        models.Token.status == "Waiting"
    ).count()

    # Active counters supporting this category
    active_counters_query = db.query(models.Counter).filter(
        models.Counter.is_active == True
    )
    all_active = active_counters_query.all()
    compatible_counters = [
        c for c in all_active 
        if c.service_category in [service_category, "All", "General Consultation"]
    ]
    active_count = len(compatible_counters) if compatible_counters else max(1, len(all_active))

    # Average service time across compatible counters
    if compatible_counters:
        avg_svc = sum(c.avg_service_time for c in compatible_counters) / len(compatible_counters)
    else:
        avg_svc = 8.0

    now = datetime.datetime.now()
    res = predictor.predict(
        people_waiting=people_waiting,
        active_counters=active_count,
        average_service_time=avg_svc,
        service_category=service_category,
        priority_level=priority_level,
        arrival_hour=now.hour,
        day_of_week=now.weekday()
    )
    return res
