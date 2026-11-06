from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app import models
from backend.app.ml.predict import predictor

def recommend_counter_for_token(
    db: Session,
    service_category: str,
    priority_level: str = "Regular"
) -> Dict[str, Any]:
    """
    Intelligently recommends the best available counter considering:
    - Active status
    - Category compatibility
    - Current backlog / waiting queue assigned to counter
    - Average service time
    - Priority policy
    """
    active_counters: List[models.Counter] = db.query(models.Counter).filter(
        models.Counter.is_active == True
    ).all()

    if not active_counters:
        return {
            "recommended_counter_id": None,
            "recommended_counter_number": None,
            "counter_name": None,
            "predicted_wait_minutes": 0.0,
            "reason": "No active counters are currently open. Please activate a counter.",
            "alternative_counters": []
        }

    # Filter for compatible counters:
    # 1. Exact match on service_category
    # 2. General Consultation handles general, billing, registration if no dedicated exists
    # 3. "All" or "General Services" can handle any category
    compatible = [
        c for c in active_counters
        if c.service_category == service_category 
        or c.service_category in ["All", "General Services"]
        or (service_category not in ["Emergency", "Laboratory"] and c.service_category == "General Consultation")
    ]

    # If no specialized counter is open, fall back to any active counter (except emergency isolation)
    if not compatible:
        compatible = active_counters

    # For emergency priority, prefer counters with lowest load and fast processing
    counter_scores = []
    for counter in compatible:
        # Count currently waiting tokens assigned to or eligible for this counter
        assigned_waiting = db.query(models.Token).filter(
            models.Token.status.in_(["Waiting", "Called"]),
            models.Token.assigned_counter_id == counter.id
        ).count()

        # Is the counter currently serving someone?
        busy_penalty = 1.0 if counter.is_busy else 0.0

        # Estimated delay at this counter
        estimated_delay = (assigned_waiting + busy_penalty) * counter.avg_service_time

        # If priority is Emergency, give extreme preference to idle counter
        if priority_level == "Emergency":
            score = (assigned_waiting * 2.0) + (counter.avg_service_time * 0.5) + (10.0 if counter.is_busy else 0.0)
        else:
            score = estimated_delay

        counter_scores.append({
            "counter": counter,
            "waiting_count": assigned_waiting,
            "estimated_delay": round(max(1.0, estimated_delay), 1),
            "score": score
        })

    # Sort counters by score ascending (lowest delay / best fit first)
    counter_scores.sort(key=lambda x: x["score"])

    best = counter_scores[0]
    best_counter = best["counter"]

    # Reason generation
    reasons = []
    if best_counter.service_category == service_category:
        reasons.append(f"Dedicated specialist for {service_category}")
    if not best_counter.is_busy:
        reasons.append("currently idle and ready to serve immediately")
    else:
        reasons.append(f"lowest queue backlog ({best['waiting_count']} waiting)")

    if priority_level == "Emergency":
        reasons.append("prioritized for fast-track emergency intake")

    reason_text = f"Counter {best_counter.number} ({best_counter.name}) recommended: " + ", ".join(reasons) + "."

    alternatives = []
    for item in counter_scores[1:]:
        c = item["counter"]
        alternatives.append({
            "counter_id": c.id,
            "counter_number": c.number,
            "name": c.name,
            "estimated_wait_minutes": item["estimated_delay"],
            "waiting_count": item["waiting_count"]
        })

    return {
        "recommended_counter_id": best_counter.id,
        "recommended_counter_number": best_counter.number,
        "counter_name": best_counter.name,
        "predicted_wait_minutes": best["estimated_delay"],
        "reason": reason_text,
        "alternative_counters": alternatives
    }
