import datetime
import bcrypt
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.app import models, schemas

# ----------------- PASSWORD HASHING -----------------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


# ----------------- USER CRUD -----------------
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(func.lower(models.User.email) == email.lower()).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    hashed_pw = hash_password(user_in.password)
    user = models.User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ----------------- COUNTER CRUD -----------------
def get_counters(db: Session) -> List[models.Counter]:
    return db.query(models.Counter).order_by(models.Counter.number.asc()).all()

def get_counter_by_id(db: Session, counter_id: int) -> Optional[models.Counter]:
    return db.query(models.Counter).filter(models.Counter.id == counter_id).first()

def get_counter_by_number(db: Session, number: int) -> Optional[models.Counter]:
    return db.query(models.Counter).filter(models.Counter.number == number).first()

def create_counter(db: Session, counter_in: schemas.CounterCreate) -> models.Counter:
    counter = models.Counter(
        number=counter_in.number,
        name=counter_in.name,
        service_category=counter_in.service_category,
        is_active=counter_in.is_active,
        staff_name=counter_in.staff_name,
        avg_service_time=counter_in.avg_service_time
    )
    db.add(counter)
    db.commit()
    db.refresh(counter)
    return counter

def update_counter(db: Session, counter: models.Counter, update_data: schemas.CounterUpdate) -> models.Counter:
    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(counter, field, val)
    counter.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(counter)
    return counter


# ----------------- TOKEN CRUD -----------------
def generate_token_number(db: Session, category: str) -> str:
    # Prefix based on category
    prefixes = {
        "General Consultation": "GEN",
        "Emergency": "EMG",
        "Billing": "BIL",
        "Registration": "REG",
        "Laboratory": "LAB",
        "Other Services": "OTH"
    }
    prefix = prefixes.get(category, "TKN")
    
    # Count tokens today with this prefix
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count = db.query(models.Token).filter(
        models.Token.token_number.like(f"{prefix}-%"),
        models.Token.created_at >= today_start
    ).count()

    number = count + 101
    return f"{prefix}-{number}"

def create_token(db: Session, token_in: schemas.TokenCreate, user_id: Optional[int] = None, estimated_wait: float = 10.0, assigned_counter_id: Optional[int] = None) -> models.Token:
    token_num = generate_token_number(db, token_in.service_category)
    
    # Calculate queue position
    waiting_count = db.query(models.Token).filter(
        models.Token.status == "Waiting"
    ).count()

    token = models.Token(
        token_number=token_num,
        user_id=user_id,
        user_name=token_in.user_name or "Guest Visitor",
        user_phone=token_in.user_phone,
        service_category=token_in.service_category,
        priority_level=token_in.priority_level,
        status="Waiting",
        assigned_counter_id=assigned_counter_id,
        queue_position=waiting_count + 1,
        estimated_wait_minutes=estimated_wait
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token

def get_tokens(db: Session, status: Optional[str] = None, service_category: Optional[str] = None, limit: int = 100) -> List[models.Token]:
    q = db.query(models.Token)
    if status and status != "All":
        q = q.filter(models.Token.status == status)
    if service_category and service_category != "All":
        q = q.filter(models.Token.service_category == service_category)
    return q.order_by(desc(models.Token.created_at)).limit(limit).all()

def get_token_by_id(db: Session, token_id: int) -> Optional[models.Token]:
    return db.query(models.Token).filter(models.Token.id == token_id).first()

def get_token_by_number(db: Session, token_number: str) -> Optional[models.Token]:
    return db.query(models.Token).filter(func.upper(models.Token.token_number) == token_number.upper()).first()

def get_active_tokens_for_user(db: Session, user_id: int) -> List[models.Token]:
    return db.query(models.Token).filter(
        models.Token.user_id == user_id,
        models.Token.status.in_(["Waiting", "Called", "In Service"])
    ).order_by(models.Token.created_at.desc()).all()


# ----------------- ALERT CRUD -----------------
def get_alerts(db: Session, resolved: Optional[bool] = None, limit: int = 50) -> List[models.Alert]:
    q = db.query(models.Alert)
    if resolved is not None:
        q = q.filter(models.Alert.is_resolved == resolved)
    return q.order_by(desc(models.Alert.created_at)).limit(limit).all()

def create_alert(db: Session, alert_in: schemas.AlertCreate) -> models.Alert:
    alert = models.Alert(
        severity=alert_in.severity,
        title=alert_in.title,
        message=alert_in.message,
        counter_id=alert_in.counter_id,
        recommended_action=alert_in.recommended_action
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

def resolve_alert(db: Session, alert_id: int) -> Optional[models.Alert]:
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = True
        alert.resolved_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return alert
