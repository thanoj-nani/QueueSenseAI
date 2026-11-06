import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.database import engine, Base, SessionLocal
from backend.app import models, crud, schemas
from backend.app.services.websocket_manager import ws_manager
from backend.app.ml.predict import predictor
from backend.app.routers import (
    auth,
    tokens,
    counters,
    predictions,
    analytics,
    alerts,
    simulation
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("queuesense.main")

def seed_initial_data(db: Session):
    """Seeds default demo accounts and standard service counters if empty."""
    # 1. Seed Admin User
    admin = crud.get_user_by_email(db, "admin@queuesense.ai")
    if not admin:
        crud.create_user(
            db,
            schemas.UserCreate(
                email="admin@queuesense.ai",
                password="Admin@123",
                full_name="Hospital Queue Administrator",
                role="admin",
                phone="+91 98765 43210"
            )
        )
        logger.info("Created default admin user: admin@queuesense.ai")

    # 2. Seed Standard Demo User
    user = crud.get_user_by_email(db, "user@queuesense.ai")
    if not user:
        crud.create_user(
            db,
            schemas.UserCreate(
                email="user@queuesense.ai",
                password="User@123",
                full_name="Rajesh Kumar",
                role="user",
                phone="+91 98123 45678"
            )
        )
        logger.info("Created default demo user: user@queuesense.ai")

    # 3. Seed Counters
    counter_count = db.query(models.Counter).count()
    if counter_count == 0:
        default_counters = [
            models.Counter(number=1, name="Consultation Room A", service_category="General Consultation", is_active=True, staff_name="Dr. Sarah Jenkins", avg_service_time=8.5, total_served=15),
            models.Counter(number=2, name="Consultation Room B", service_category="General Consultation", is_active=True, staff_name="Dr. Alex Turner", avg_service_time=9.0, total_served=12),
            models.Counter(number=3, name="Fast-Track Billing", service_category="Billing", is_active=True, staff_name="Mark Reynolds", avg_service_time=4.5, total_served=28),
            models.Counter(number=4, name="Patient Registration", service_category="Registration", is_active=True, staff_name="Priya Patel", avg_service_time=5.0, total_served=22),
            models.Counter(number=5, name="Emergency Intake", service_category="Emergency", is_active=True, staff_name="Nurse Carter", avg_service_time=12.0, total_served=8),
            models.Counter(number=6, name="Diagnostic Lab Desk", service_category="Laboratory", is_active=True, staff_name="Tech David Lee", avg_service_time=11.0, total_served=14),
        ]
        db.add_all(default_counters)
        db.commit()
        logger.info("Seeded 6 standard operational counters.")

    # 4. Seed initial realistic active tokens if none exist
    token_count = db.query(models.Token).count()
    if token_count == 0:
        seed_tokens = [
            models.Token(token_number="GEN-101", user_name="Ananya Sharma", service_category="General Consultation", priority_level="Regular", status="Waiting", assigned_counter_id=1, queue_position=1, estimated_wait_minutes=6.0),
            models.Token(token_number="GEN-102", user_name="Ramesh Verma", service_category="General Consultation", priority_level="Senior/Disabled", status="Waiting", assigned_counter_id=2, queue_position=2, estimated_wait_minutes=9.5),
            models.Token(token_number="BIL-101", user_name="Kavita Reddy", service_category="Billing", priority_level="Regular", status="Waiting", assigned_counter_id=3, queue_position=3, estimated_wait_minutes=4.0),
            models.Token(token_number="REG-101", user_name="Vikram Singh", service_category="Registration", priority_level="Regular", status="Waiting", assigned_counter_id=4, queue_position=4, estimated_wait_minutes=7.0),
            models.Token(token_number="EMG-101", user_name="Critical Triage", service_category="Emergency", priority_level="Emergency", status="In Service", assigned_counter_id=5, queue_position=1, estimated_wait_minutes=2.0),
        ]
        db.add_all(seed_tokens)
        db.commit()
        logger.info("Seeded initial active demo queue tokens.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    
    # Reload ML model if available
    predictor.reload()
    logger.info("QueueSense AI backend initialized successfully.")
    yield
    logger.info("QueueSense AI backend shutting down.")


app = FastAPI(
    title="QueueSense AI – Intelligent Predictive Queue Management API",
    description="High-performance backend API powering real-time wait predictions, intelligent counter allocation, and automated crowd analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(tokens.router)
app.include_router(counters.router)
app.include_router(predictions.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(simulation.router)

# WebSocket Real-Time Endpoint
@app.websocket("/ws/queue")
async def websocket_queue_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
            # Respond to client ping
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "service": "QueueSense AI API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
