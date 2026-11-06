import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- AUTH & USER -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class TokenAuth(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- COUNTER -----------------
class CounterBase(BaseModel):
    number: int
    name: str
    service_category: str = "General Consultation"
    is_active: bool = True
    staff_name: str = "Staff Member"
    avg_service_time: float = 8.0

class CounterCreate(CounterBase):
    pass

class CounterUpdate(BaseModel):
    name: Optional[str] = None
    service_category: Optional[str] = None
    is_active: Optional[bool] = None
    is_busy: Optional[bool] = None
    staff_name: Optional[str] = None
    current_token_id: Optional[int] = None
    avg_service_time: Optional[float] = None

class CounterResponse(CounterBase):
    id: int
    is_busy: bool
    current_token_id: Optional[int] = None
    total_served: int
    updated_at: datetime.datetime
    waiting_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class CounterRecommendationRequest(BaseModel):
    service_category: str
    priority_level: str = "Regular"
    user_id: Optional[int] = None

class AlternativeCounter(BaseModel):
    counter_id: int
    counter_number: int
    name: str
    estimated_wait_minutes: float
    waiting_count: int

class CounterRecommendationResponse(BaseModel):
    recommended_counter_id: Optional[int]
    recommended_counter_number: Optional[int]
    counter_name: Optional[str]
    predicted_wait_minutes: float
    reason: str
    alternative_counters: List[AlternativeCounter] = []


# ----------------- TOKEN -----------------
class TokenCreate(BaseModel):
    service_category: str = "General Consultation"
    priority_level: str = "Regular"  # "Regular", "Senior/Disabled", "Emergency", "VIP"
    user_name: Optional[str] = None
    user_phone: Optional[str] = None

class TokenStatusUpdate(BaseModel):
    status: str  # "Waiting", "Called", "In Service", "Completed", "Cancelled"
    counter_id: Optional[int] = None

class TokenResponse(BaseModel):
    id: int
    token_number: str
    user_id: Optional[int]
    user_name: str
    user_phone: Optional[str]
    service_category: str
    priority_level: str
    status: str
    assigned_counter_id: Optional[int]
    queue_position: int
    estimated_wait_minutes: float
    actual_wait_minutes: Optional[float]
    service_time_minutes: Optional[float]
    created_at: datetime.datetime
    called_at: Optional[datetime.datetime]
    served_at: Optional[datetime.datetime]
    completed_at: Optional[datetime.datetime]
    assigned_counter_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ----------------- PREDICTIONS -----------------
class PredictionRequest(BaseModel):
    people_waiting: int = Field(..., ge=0, description="Current number of people waiting")
    active_counters: int = Field(..., gt=0, description="Number of currently active counters")
    average_service_time: float = Field(default=8.0, gt=0, description="Average service time in minutes")
    service_category: str = Field(default="General Consultation", description="Service Category")
    priority_level: str = Field(default="Regular", description="Priority level")
    arrival_hour: Optional[int] = Field(default=None, ge=0, le=23)
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6)

class PredictionResponse(BaseModel):
    predicted_wait_minutes: float
    model_used: str
    confidence_interval: Dict[str, float]
    estimated_range: str
    is_estimate_disclaimer: str

class ModelMetricsResponse(BaseModel):
    model_name: str
    mae: float
    mse: float
    rmse: float
    r2: float
    sample_size: int
    features_used: List[str]
    trained_at: str
    comparison: Optional[Dict[str, Any]] = None


# ----------------- ANALYTICS -----------------
class AnalyticsOverview(BaseModel):
    total_tokens_today: int
    currently_waiting: int
    currently_in_service: int
    completed_today: int
    cancelled_today: int
    active_counters_count: int
    total_counters_count: int
    avg_waiting_time_minutes: float
    avg_service_time_minutes: float
    estimated_time_saved_minutes: float
    congestion_level: str  # "Normal", "Moderate", "High", "Critical"

class HourlyTrafficPoint(BaseModel):
    hour: str
    arrived: int
    served: int
    avg_wait: float

class DepartmentMetric(BaseModel):
    category: str
    total_tokens: int
    avg_wait: float
    percentage: float

class WaitTimeBucket(BaseModel):
    range: str
    count: int

class WhatIfScenario(BaseModel):
    scenario_name: str
    description: str
    active_counters: int
    estimated_avg_wait: float
    throughput_per_hour: float
    congestion_risk: str
    wait_time_reduction_percent: float

class WhatIfComparisonResponse(BaseModel):
    baseline: WhatIfScenario
    scenario_additional_counter: WhatIfScenario
    scenario_optimized_allocation: WhatIfScenario
    recommendation: str


# ----------------- ALERTS -----------------
class AlertCreate(BaseModel):
    severity: str = "Medium"
    title: str
    message: str
    counter_id: Optional[int] = None
    recommended_action: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    severity: str
    title: str
    message: str
    counter_id: Optional[int]
    is_resolved: bool
    recommended_action: Optional[str]
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime]
    model_config = ConfigDict(from_attributes=True)


# ----------------- SIMULATION -----------------
class SimulationArrivalsRequest(BaseModel):
    count: int = Field(10, ge=1, le=100)
    service_category: Optional[str] = "Random"
    priority_level: Optional[str] = "Random"

class SimulationDelayRequest(BaseModel):
    counter_id: Optional[int] = None
    delay_minutes: float = Field(15.0, ge=1, le=120)
    reason: str = "Complex case / System delay"

class SimulationCounterClosureRequest(BaseModel):
    counter_id: Optional[int] = None
