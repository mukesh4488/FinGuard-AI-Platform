from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest

app = FastAPI(title="FinGuard True ML Engine")

# ==========================================
# 1. MODEL TRAINING (Runs on Server Startup)
# ==========================================
print("🚀 Generating synthetic data and training Random Forest models...")

np.random.seed(42) # Ensures our data is exactly the same every time we restart
n_samples = 2000

# --- Train Loan Risk Model (RandomForestClassifier) ---
# 1. Generate realistic training data
incomes = np.random.randint(300000, 2500000, n_samples)
scores = np.random.randint(300, 850, n_samples)
amounts = np.random.randint(50000, 5000000, n_samples)
dtis = np.random.uniform(0.1, 0.6, n_samples)

# 2. Create target variable (1 = Default/High Risk, 0 = Safe)
# We embed logical patterns that the Random Forest needs to 'learn'
y_loan = ((scores < 600) | (dtis > 0.45) | (amounts > incomes * 3)).astype(int)
X_loan = pd.DataFrame({
    'annualIncome': incomes, 
    'creditScore': scores, 
    'loanAmount': amounts, 
    'debtToIncomeRatio': dtis
})

# 3. Initialize and Train the Random Forest
loan_rf = RandomForestClassifier(n_estimators=100, random_state=42)
loan_rf.fit(X_loan, y_loan)


# --- Train Fraud Model (Isolation Forest) ---
# 1. Generate transaction data
tx_amounts = np.random.normal(5000, 3000, n_samples) # Most transactions are around 5000
tx_merchants = np.random.choice([0, 1, 2], n_samples) # 0: Online, 1: Retail, 2: Food

X_tx = pd.DataFrame({'amount': tx_amounts, 'merchantType': tx_merchants})

# 2. Initialize and Train the Isolation Forest (Expects ~5% of data to be anomalies)
tx_iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
tx_iso_forest.fit(X_tx)

# Helper dictionary to convert text from React into numbers for the ML model
merchant_map = {"online": 0, "retail": 1, "food": 2}

print("✅ Models trained and loaded into memory successfully!")


# ==========================================
# 2. API ENDPOINTS (The Bridge to Node.js)
# ==========================================

class LoanApplication(BaseModel):
    annualIncome: float
    creditScore: float
    loanAmount: float
    debtToIncomeRatio: float

class TransactionData(BaseModel):
    amount: float
    location: str
    merchantType: str

@app.get("/")
def home():
    return {"status": "True ML Engine is Online"}

@app.post("/predict-loan")
def predict_loan(loan: LoanApplication):
    # Convert incoming request into a DataFrame that scikit-learn can read
    df = pd.DataFrame([{
        'annualIncome': loan.annualIncome,
        'creditScore': loan.creditScore,
        'loanAmount': loan.loanAmount,
        'debtToIncomeRatio': loan.debtToIncomeRatio
    }])
    
    # Predict the probability of Class 1 (High Risk)
    risk_prob = loan_rf.predict_proba(df)[0][1]
    
    status = "Approved"
    if risk_prob > 0.7:
        status = "Rejected"
    elif risk_prob > 0.4:
        status = "Pending Review"

    return {
        "riskScore": round(risk_prob, 2),
        "status": status
    }

@app.post("/predict-transaction")
def predict_transaction(tx: TransactionData):
    # Convert text merchant to numeric ID for the ML model
    m_type = merchant_map.get(tx.merchantType.lower(), 0)
    df = pd.DataFrame([{'amount': tx.amount, 'merchantType': m_type}])
    
    # Isolation forest returns 1 for normal, -1 for anomaly
    prediction = tx_iso_forest.predict(df)[0]
    
    # Calculate a fraud score based on how "far" it is from normal data
    # The decision function returns negative numbers for anomalies, positive for normal
    anomaly_score = tx_iso_forest.decision_function(df)[0]
    
    # Convert the raw anomaly score into a readable 0.0 to 1.0 percentage
    fraud_score = max(0.0, min(1.0, 0.5 - anomaly_score))
    
    is_flagged = bool(prediction == -1)

    return {
        "fraudScore": round(fraud_score, 2),
        "isFlagged": is_flagged
    }