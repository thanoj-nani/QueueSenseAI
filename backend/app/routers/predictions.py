from fastapi import APIRouter, HTTPException
from backend.app import schemas
from backend.app.ml.predict import predictor

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.post("/waiting-time", response_model=schemas.PredictionResponse)
def predict_waiting_time(req: schemas.PredictionRequest):
    """
    Predicts estimated waiting time in minutes using the trained Machine Learning pipeline.
    Returns model type, 95% uncertainty interval derived from ensemble tree variance, and disclaimer.
    """
    res = predictor.predict(
        people_waiting=req.people_waiting,
        active_counters=req.active_counters,
        average_service_time=req.average_service_time,
        service_category=req.service_category,
        priority_level=req.priority_level,
        arrival_hour=req.arrival_hour,
        day_of_week=req.day_of_week
    )
    return res


@router.get("/model-performance", response_model=schemas.ModelMetricsResponse)
def get_model_performance():
    """Returns actual model evaluation metrics (MAE, MSE, RMSE, R²) and multi-model benchmark comparisons."""
    metrics = predictor.get_metrics()
    return metrics
