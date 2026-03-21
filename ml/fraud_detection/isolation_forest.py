"""
Fraud Detection — Isolation Forest (Layer 2)
RainGuard AI — ML Module

Detects anomalous claim behavior using unsupervised anomaly detection.
Works alongside Layer 1 (GPS) and Layer 3 (Platform Activity Check).
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime


# ─── Feature Set ────────────────────────────────────────────────────────────

FRAUD_FEATURES = [
    "claim_frequency_30d",       # Number of claims in last 30 days
    "avg_payout_amount",         # Average payout received historically
    "hour_of_claim",             # Hour of day claim was generated (0–23)
    "days_since_enrollment",     # How long the worker has been enrolled
    "claim_to_premium_ratio",    # Total claimed / total premium paid
    "avg_days_between_claims",   # Average gap between claims
]


# ─── Thresholds ─────────────────────────────────────────────────────────────

REVIEW_THRESHOLD = 0.7    # Score > 0.7 → Manual review
REJECT_THRESHOLD = 0.9    # Score > 0.9 → Auto-reject


def generate_training_data(n_normal: int = 4000, n_fraud: int = 200) -> pd.DataFrame:
    """
    Generate synthetic claim behavior data.
    Fraudulent profiles have: high frequency, high payout ratio, weekend timing clusters.
    """
    np.random.seed(42)
    
    # Normal worker claim behavior
    normal = pd.DataFrame({
        "claim_frequency_30d":    np.random.poisson(1.2, n_normal),
        "avg_payout_amount":      np.random.normal(250, 80, n_normal).clip(100, 500),
        "hour_of_claim":          np.random.randint(6, 22, n_normal),  # Daytime claims
        "days_since_enrollment":  np.random.randint(7, 365, n_normal),
        "claim_to_premium_ratio": np.random.beta(2, 5, n_normal) * 15,  # Healthy ratio
        "avg_days_between_claims": np.random.exponential(12, n_normal).clip(3, 60),
        "is_fraud": 0,
    })
    
    # Fraudulent claim behavior (injected)
    fraud = pd.DataFrame({
        "claim_frequency_30d":    np.random.randint(5, 15, n_fraud),     # Very high
        "avg_payout_amount":      np.random.normal(480, 20, n_fraud),    # Always max out
        "hour_of_claim":          np.random.choice([0,1,2,3,23], n_fraud), # Night claims
        "days_since_enrollment":  np.random.randint(1, 7, n_fraud),       # Brand new accounts
        "claim_to_premium_ratio": np.random.uniform(20, 50, n_fraud),    # Extremely high
        "avg_days_between_claims": np.random.uniform(0.5, 2, n_fraud),   # Claims every day
        "is_fraud": 1,
    })
    
    return pd.concat([normal, fraud], ignore_index=True).sample(frac=1, random_state=42)


def train_fraud_model():
    """Train Isolation Forest on synthetic claim data."""
    print("Generating claim behavior training data...")
    df = generate_training_data()
    
    X = df[FRAUD_FEATURES]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Training Isolation Forest fraud detection model...")
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,   # ~5% of claims expected to be anomalous
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_scaled)
    
    os.makedirs("models", exist_ok=True)
    with open("models/fraud_isolation_forest.pkl", "wb") as f:
        pickle.dump({"model": model, "scaler": scaler}, f)
    print("Fraud model saved to models/fraud_isolation_forest.pkl")
    return model, scaler


def check_claim_fraud(
    claim_frequency_30d: int,
    avg_payout_amount: float,
    hour_of_claim: int,
    days_since_enrollment: int,
    claim_to_premium_ratio: float,
    avg_days_between_claims: float,
) -> dict:
    """
    Layer 2 Fraud Check: Run Isolation Forest on claim features.
    
    Returns:
        {
            "action": "APPROVE" | "MANUAL_REVIEW" | "AUTO_REJECT",
            "anomaly_score": float (0.0–1.0),
            "flags": [...]
        }
    """
    try:
        with open("models/fraud_isolation_forest.pkl", "rb") as f:
            artifacts = pickle.load(f)
        model = artifacts["model"]
        scaler = artifacts["scaler"]
    except FileNotFoundError:
        return {"action": "APPROVE", "anomaly_score": 0.0, "flags": ["model_not_trained"]}
    
    features = np.array([[
        claim_frequency_30d,
        avg_payout_amount,
        hour_of_claim,
        days_since_enrollment,
        claim_to_premium_ratio,
        avg_days_between_claims,
    ]])
    
    features_scaled = scaler.transform(features)
    
    # Isolation Forest: -1 = anomaly, 1 = normal
    # decision_function: lower = more anomalous (negative)
    raw_score = model.decision_function(features_scaled)[0]
    
    # Normalize to 0.0–1.0 where 1.0 = most anomalous
    normalized_score = float(np.clip(1 - (raw_score + 0.5), 0, 1))
    
    flags = []
    if claim_frequency_30d > 8:
        flags.append("high_claim_frequency")
    if claim_to_premium_ratio > 15:
        flags.append("high_payout_ratio")
    if days_since_enrollment < 3:
        flags.append("new_account_claim")
    if hour_of_claim in [0, 1, 2, 3]:
        flags.append("unusual_claim_hour")
    
    if normalized_score > REJECT_THRESHOLD:
        action = "AUTO_REJECT"
    elif normalized_score > REVIEW_THRESHOLD:
        action = "MANUAL_REVIEW"
    else:
        action = "APPROVE"
    
    return {
        "action": action,
        "anomaly_score": round(normalized_score, 4),
        "flags": flags,
        "layer": "isolation_forest_layer2"
    }


if __name__ == "__main__":
    train_fraud_model()
    
    # Test with a suspicious claim
    result = check_claim_fraud(
        claim_frequency_30d=12,
        avg_payout_amount=498,
        hour_of_claim=2,
        days_since_enrollment=2,
        claim_to_premium_ratio=45,
        avg_days_between_claims=1.2
    )
    print(f"\nFraud check result (suspicious): {result}")
    
    # Test with a normal claim
    result = check_claim_fraud(
        claim_frequency_30d=2,
        avg_payout_amount=280,
        hour_of_claim=14,
        days_since_enrollment=90,
        claim_to_premium_ratio=3.5,
        avg_days_between_claims=15
    )
    print(f"Fraud check result (normal): {result}")
