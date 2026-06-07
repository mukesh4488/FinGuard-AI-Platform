from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os

app = FastAPI(title="FinGuard Enterprise AI Engine")

# =====================================================================
# CORS SECURITY BLOCK (Added to allow frontend communication)
# =====================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define global placeholders for models and scalers
fraud_model = None
fraud_scaler = None
loan_model = None
loan_scaler = None

# Base path for serialized artifacts
MODELS_DIR = "models"

@app.on_event("startup")
def load_production_artifacts():
    global fraud_model, fraud_scaler, loan_model, loan_scaler
    try:
        print("📥 Initializing AI models and feature scalers from disk...")
        
        with open(os.path.join(MODELS_DIR, 'fraud_model.pkl'), 'rb') as f:
            fraud_model = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'fraud_scaler.pkl'), 'rb') as f:
            fraud_scaler = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'loan_model.pkl'), 'rb') as f:
            loan_model = pickle.load(f)
        with open(os.path.join(MODELS_DIR, 'loan_scaler.pkl'), 'rb') as f:
            loan_scaler = pickle.load(f)
            
        print("🥇 All production models loaded successfully into memory.")
    except Exception as e:
        print(print(f"❌ CRITICAL ERROR: Failed to load models: {str(e)}"))
        print("The engine will fall back to rule-based mock logic if files are missing.")

# =====================================================================
# PYSCHEMA STRUCTURES
# =====================================================================
class TransactionPayload(BaseModel):
    amount: float
    location: int       # 0: Local, 1: Domestic Out-of-State, 2: High-Risk International
    merchantType: int   # 0: Grocery, 1: Retail, 2: Electronics, 3: Crypto/Gambling
    hour: int = 12      # Default to midday if not provided

class LoanPayload(BaseModel):
    annualIncome: float
    creditScore: float
    loanAmount: float
    debtToIncomeRatio: float

# =====================================================================
# CORE API ENDPOINTS
# =====================================================================

@app.post("/predict-transaction")
async def predict_transaction(payload: TransactionPayload):
    global fraud_model, fraud_scaler
    
    # Fallback mechanism if pipeline artifacts fail to load
    if fraud_model is None or fraud_scaler is None:
        # Mock logic
        is_flagged = 1 if payload.amount > 1000 or payload.location == 2 else 0
        return {"fraudScore": 0.85 if is_flagged else 0.05, "isFlagged": is_flagged}
        
    try:
        # 1. Structure the raw data matching train configuration
        raw_features = np.array([[
            payload.amount, 
            payload.location, 
            payload.merchantType, 
            payload.hour
        ]])
        
        # 2. Scale features to eliminate magnitude imbalances
        scaled_features = fraud_scaler.transform(raw_features)
        
        # 3. Compute predictive probabilities
        probabilities = fraud_model.predict_proba(scaled_features)[0]
        fraud_score = float(probabilities[1])  # Target index 1 represents positive class (Fraud)
        is_flagged = int(fraud_model.predict(scaled_features)[0])
        
        return {
            "fraudScore": round(fraud_score, 4),
            "isFlagged": is_flagged
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference pipeline execution failure: {str(e)}")


@app.post("/predict-loan")
async def predict_loan(payload: LoanPayload):
    global loan_model, loan_scaler
    
    if loan_model is None or loan_scaler is None:
        # Mock logic
        status = "Rejected" if payload.creditScore < 600 or payload.debtToIncomeRatio > 0.5 else "Approved"
        return {"riskScore": 0.90 if status == "Rejected" else 0.15, "status": status}
        
    try:
        # 1. Align feature inputs precisely with matrix columns
        raw_features = np.array([[
            payload.annualIncome,
            payload.creditScore,
            payload.loanAmount,
            payload.debtToIncomeRatio
        ]])
        
        # 2. Map through scaler matrix
        scaled_features = loan_scaler.transform(raw_features)
        
        # 3. Predict classification
        probabilities = loan_model.predict_proba(scaled_features)[0]
        risk_score = float(probabilities[1])  # Target index 1 represents positive class (Rejected)
        prediction = int(loan_model.predict(scaled_features)[0])
        
        status = "Rejected" if prediction == 1 else "Approved"
        
        return {
            "riskScore": round(risk_score, 4),
            "status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference pipeline execution failure: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": fraud_model is not None and loan_model is not None
    }