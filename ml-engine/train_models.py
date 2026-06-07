import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Ensure the model directory exists
os.makedirs("models", exist_ok=True)

print("🔬 Phase 1: Synthesizing High-Complexity Real-World Data Distributions...")
n_samples = 50000  # Scaling up data density

# =====================================================================
# 1. ADVANCED FRAUD INTERACTION ENGINE (Extreme Imbalance & Anomaly)
# =====================================================================
np.random.seed(101)

# Generate a log-normal distribution for amounts (mimics real retail banking)
amounts = np.random.lognormal(mean=3.5, sigma=1.2, size=n_samples) 

# Categorical mapping: Locations (0: Local, 1: Domestic Out-of-State, 2: High-Risk International)
locations = np.random.choice([0, 1, 2], size=n_samples, p=[0.85, 0.12, 0.03])

# Merchant Types (0: Grocery/Utilities, 1: Retail, 2: Online Electronics, 3: Crypto/Gambling exchanges)
merchant_types = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.50, 0.30, 0.15, 0.05])

# Time-of-day simulation (0 to 23 hours)
hours = np.random.randint(0, 24, size=n_samples)

# Building a complex, non-linear transaction risk score signature
base_risk = np.zeros(n_samples)
base_risk += (amounts > 800) * 0.35  # High velocity transactions
base_risk += (locations == 2) * 0.40  # International vector
base_risk += (merchant_types == 3) * 0.30  # Crypto/Gambling vector
base_risk += ((hours >= 1) & (hours <= 4)) * 0.25  # Dead-of-night anomalies

# Injecting heavy Gaussian noise to simulate chaotic real-world consumer behavior
corrupted_risk = base_risk + np.random.normal(0, 0.25, n_samples)

# Enforcing a strict ~1.5% fraud rate threshold (Realistic Imbalance)
fraud_threshold = np.percentile(corrupted_risk, 98.5)
is_fraud = (corrupted_risk >= fraud_threshold).astype(int)

df_fraud = pd.DataFrame({
    'amount': amounts,
    'location': locations,
    'merchantType': merchant_types,
    'hour': hours,
    'isFraud': is_fraud
})

# =====================================================================
# 2. ADVANCED LOAN RISK PIPELINE
# =====================================================================
income = np.random.lognormal(mean=10.8, sigma=0.5, size=n_samples).clip(15000, 300000)
credit_score = np.random.randint(300, 851, size=n_samples)

# Loan requests are correlated to income, but with high variance variance
loan_amount = income * np.random.uniform(0.1, 0.7, size=n_samples) + np.random.normal(0, 5000, size=n_samples)
loan_amount = loan_amount.clip(5000, 150000)

debt_ratio = np.random.uniform(0.05, 0.65, size=n_samples)
# Unfavorable correlation injection: lower credit scores tend to yield worse debt-to-income overhead
debt_ratio[credit_score < 580] += np.random.uniform(0.05, 0.25, size=len(debt_ratio[credit_score < 580]))

# Loan Underwriting Multi-Factor Risk Matrix
loan_risk = (
    0.45 * (credit_score < 620) + 
    0.35 * (debt_ratio > 0.48) + 
    0.20 * (loan_amount > (income * 0.5))
)
# Add statistical white noise
loan_risk += np.random.normal(0, 0.15, n_samples)

# Mark the bottom ~25% risk tier as defaults/rejections
loan_threshold = np.percentile(loan_risk, 75)
is_rejected = (loan_risk >= loan_threshold).astype(int)

df_loan = pd.DataFrame({
    'annualIncome': income,
    'creditScore': credit_score,
    'loanAmount': loan_amount,
    'debtToIncomeRatio': debt_ratio,
    'isRejected': is_rejected
})

print("🤖 Data compilation complete. Initiating advanced training loops...")

# =====================================================================
# 3. TRAINING & STANDARDIZATION PIPELINE WITH CLASS BALANCING
# =====================================================================

# --- Train Fraud Model ---
X_f = df_fraud[['amount', 'location', 'merchantType', 'hour']]
y_f = df_fraud['isFraud']

# Using stratify to ensure the 1.5% fraud distribution matches perfectly across splits
X_train_f, X_test_f, y_train_f, y_test_f = train_test_split(X_f, y_f, test_size=0.2, random_state=42, stratify=y_f)

# Scaling numerical ranges to prevent magnitude bias
scaler_f = StandardScaler()
X_train_f_scaled = scaler_f.fit_transform(X_train_f)
X_test_f_scaled = scaler_f.transform(X_test_f)

# Using class_weight='balanced' to penalize misclassifying rare fraud anomalies
fraud_model = RandomForestClassifier(n_estimators=150, max_depth=12, class_weight='balanced', random_state=42, n_jobs=-1)
fraud_model.fit(X_train_f_scaled, y_train_f)

print("\n📊 --- FRAUD MODEL PRODUCTION EVALUATION ---")
y_pred_f = fraud_model.predict(X_test_f_scaled)
print(classification_report(y_test_f, y_pred_f))

# --- Train Loan Model ---
X_l = df_loan[['annualIncome', 'creditScore', 'loanAmount', 'debtToIncomeRatio']]
y_l = df_loan['isRejected']

X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(X_l, y_l, test_size=0.2, random_state=42, stratify=y_l)

scaler_l = StandardScaler()
X_train_l_scaled = scaler_l.fit_transform(X_train_l)
X_test_l_scaled = scaler_l.transform(X_test_l)

loan_model = RandomForestClassifier(n_estimators=120, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1)
loan_model.fit(X_train_l_scaled, y_train_l)

print("\n📊 --- LOAN MODEL PRODUCTION EVALUATION ---")
y_pred_l = loan_model.predict(X_test_l_scaled)
print(classification_report(y_test_l, y_pred_l))

# =====================================================================
# 4. SERIALIZING OBJECTS AND SCALERS FOR THE GATEWAY API
# =====================================================================
print("\n📦 Serializing pipeline states into production model files...")

artifacts = {
    'models/fraud_model.pkl': fraud_model,
    'models/fraud_scaler.pkl': scaler_f,
    'models/loan_model.pkl': loan_model,
    'models/loan_scaler.pkl': scaler_l
}

for path, obj in artifacts.items():
    with open(path, 'wb') as file:
        pickle.dump(obj, file)

print("🥇 Deep training pipeline successfully saved to disk. Ready for production execution.")