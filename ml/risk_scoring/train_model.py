"""
Risk Scoring Engine — RainGuard AI
Model 1: Random Forest / XGBoost to compute worker risk score (0–100).

PHASE 1: Training script with synthetic data.
PHASE 2: Retrain on real IMD historical CSVs + accumulated claim data.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error
import pickle
import os

# ─── Feature Engineering ────────────────────────────────────────────────────

FEATURES = [
    "avg_rainfall_5yr_mm",       # Historical average rainfall mm/year
    "rainfall_variance",          # Std dev of monthly rainfall
    "flood_events_5yr",           # Flood events in pincode last 5 years
    "claim_density_zone",         # Claims per 100 workers in zone
    "delivery_hours_per_week",    # Proxy for income at stake
    "city_risk_tier",             # 0=low, 1=medium, 2=high
]

CITY_TIER = {
    "bangalore": 2,
    "mumbai": 2,
    "chennai": 1,
    "hyderabad": 1,
}


def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Generate synthetic worker profiles for Phase 1 model training.
    Replace with real IMD data in Phase 2.
    """
    np.random.seed(42)
    
    cities = np.random.choice(list(CITY_TIER.keys()), n_samples)
    city_tiers = np.array([CITY_TIER[c] for c in cities])
    
    data = {
        "avg_rainfall_5yr_mm":      np.random.normal(800, 200, n_samples).clip(200, 1800),
        "rainfall_variance":         np.random.exponential(50, n_samples).clip(5, 200),
        "flood_events_5yr":          np.random.poisson(1.5, n_samples),
        "claim_density_zone":        np.random.beta(2, 5, n_samples) * 30,
        "delivery_hours_per_week":   np.random.randint(20, 70, n_samples),
        "city_risk_tier":            city_tiers,
    }
    
    df = pd.DataFrame(data)
    
    # Synthetic risk score (ground truth for training)
    # Higher rainfall + variance + flood events + claim density = higher risk
    df["risk_score"] = (
        df["avg_rainfall_5yr_mm"] / 1800 * 25 +
        df["rainfall_variance"] / 200 * 20 +
        df["flood_events_5yr"] / 5 * 15 +
        df["claim_density_zone"] / 30 * 15 +
        df["delivery_hours_per_week"] / 70 * 10 +
        df["city_risk_tier"] / 2 * 15
    ).clip(0, 100).round(0).astype(int)
    
    return df


def train_model():
    """Train the Risk Scoring model and save as pickle."""
    print("Generating synthetic training data...")
    df = generate_synthetic_data(5000)
    
    X = df[FEATURES]
    y = df["risk_score"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Risk Scoring model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Model MAE: {mae:.2f} risk score points")
    
    # Save model
    os.makedirs("models", exist_ok=True)
    with open("models/risk_scoring_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Model saved to models/risk_scoring_model.pkl")
    
    return model


def predict_risk_score(
    avg_rainfall_5yr_mm: float,
    rainfall_variance: float,
    flood_events_5yr: int,
    claim_density_zone: float,
    delivery_hours_per_week: int,
    city: str,
) -> int:
    """
    Predict risk score for a worker.
    Returns integer 0–100.
    """
    try:
        with open("models/risk_scoring_model.pkl", "rb") as f:
            model = pickle.load(f)
    except FileNotFoundError:
        # Fallback: rule-based scoring if model not trained
        return _rule_based_score(city, delivery_hours_per_week)
    
    features = [[
        avg_rainfall_5yr_mm,
        rainfall_variance,
        flood_events_5yr,
        claim_density_zone,
        delivery_hours_per_week,
        CITY_TIER.get(city.lower(), 1),
    ]]
    
    score = model.predict(features)[0]
    return int(np.clip(score, 0, 100))


def _rule_based_score(city: str, hours: int) -> int:
    """Simple fallback risk score (used in Phase 1 before model is trained)."""
    base = {2: 65, 1: 50, 0: 35}.get(CITY_TIER.get(city.lower(), 1), 50)
    return min(base + int(hours / 10), 100)


if __name__ == "__main__":
    train_model()
