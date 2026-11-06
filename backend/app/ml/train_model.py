"""
QueueSense AI - Machine Learning Model Training Pipeline
=========================================================
Trains and compares:
1. Linear Regression Baseline
2. Random Forest Regressor
3. XGBoost Regressor (if available)

Evaluates MAE, MSE, RMSE, R² scores using an 80/20 train-test split.
Saves the best-performing pipeline and evaluation metrics for deployment.
"""

import os
import json
import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Check if xgboost is installed
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False


def train_and_evaluate_models():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, "data", "queue_training_data.csv")
    models_dir = os.path.join(base_dir, "saved_models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        from backend.app.ml.generate_dataset import save_dataset
        save_dataset()

    print(f"Loading queue dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Feature definitions (NO TARGET LEAKAGE)
    categorical_features = ["service_category", "priority_level"]
    numerical_features = [
        "arrival_hour",
        "day_of_week",
        "people_waiting",
        "active_counters",
        "average_service_time",
        "counter_workload",
        "arrival_rate",
        "historical_average_wait"
    ]

    feature_cols = categorical_features + numerical_features
    target_col = "actual_waiting_time"

    X = df[feature_cols]
    y = df[target_col]

    # 80/20 train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    print(f"Dataset split: {len(X_train)} training records, {len(X_test)} testing records.")

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numerical_features)
        ]
    )

    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=100,
            max_depth=16,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
    }

    if XGBOOST_AVAILABLE:
        candidate_models["XGBoost Regressor"] = xgb.XGBRegressor(
            n_estimators=120,
            max_depth=6,
            learning_rate=0.08,
            random_state=42,
            n_jobs=-1
        )

    model_results = {}
    best_pipeline = None
    best_r2 = -float("inf")
    best_model_name = ""

    for name, model in candidate_models.items():
        print(f"\n--- Training {name} ---")
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)

        print(f"{name} Metrics:")
        print(f"  MAE  : {mae:.3f} min")
        print(f"  MSE  : {mse:.3f}")
        print(f"  RMSE : {rmse:.3f} min")
        print(f"  R²   : {r2:.4f}")

        model_results[name] = {
            "mae": round(float(mae), 3),
            "mse": round(float(mse), 3),
            "rmse": round(float(rmse), 3),
            "r2": round(float(r2), 4)
        }

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            best_pipeline = pipeline

    print(f"\n>> Selected Best Model: {best_model_name} (R² = {best_r2:.4f})")

    # Save best model pipeline
    best_model_file = os.path.join(models_dir, "queue_wait_model.joblib")
    joblib.dump(best_pipeline, best_model_file)
    print(f"Saved trained pipeline to: {best_model_file}")

    # Save metrics JSON
    metrics_summary = {
        "model_name": best_model_name,
        "mae": model_results[best_model_name]["mae"],
        "mse": model_results[best_model_name]["mse"],
        "rmse": model_results[best_model_name]["rmse"],
        "r2": model_results[best_model_name]["r2"],
        "sample_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features_used": feature_cols,
        "trained_at": datetime.datetime.utcnow().isoformat(),
        "comparison": model_results
    }

    metrics_file = os.path.join(models_dir, "metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Saved metrics summary to: {metrics_file}")

    return metrics_summary


if __name__ == "__main__":
    train_and_evaluate_models()
