import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Robust Model Generator with Realistic Data Ranges
# This script creates a model that is trained on data reflecting the actual application inputs.

def generate_robust_data(n_samples=5000):
    # Features count: 30
    X = np.zeros((n_samples, 30))
    
    # 0: semesters_completed (1-8)
    X[:, 0] = np.random.randint(1, 9, n_samples)
    
    # 1-8: sem_marks (0-100)
    for i in range(1, 9):
        X[:, i] = np.random.normal(65, 15, n_samples).clip(0, 100)
        
    # 9: cgpa (0-10)
    X[:, 9] = np.random.normal(7.0, 1.5, n_samples).clip(0, 10)
    
    # 10: above_average_student (0 or 1)
    X[:, 10] = (X[:, 9] > 7.5).astype(int)
    
    # 11: attendance (0-100)
    X[:, 11] = np.random.normal(75, 15, n_samples).clip(0, 100)
    
    # 12: backlogs (0-10)
    X[:, 12] = np.random.poisson(1, n_samples).clip(0, 10)
    
    # 13: family_income (20,000 to 800,000)
    X[:, 13] = np.random.exponential(150000, n_samples).clip(20000, 800000)
    
    # 14: pwd (0 or 1) - rare
    X[:, 14] = (np.random.rand(n_samples) < 0.05).astype(int)
    
    # 15: participates_academics
    X[:, 15] = (np.random.rand(n_samples) < 0.6).astype(int)
    
    # 16: sports_person
    X[:, 16] = (np.random.rand(n_samples) < 0.3).astype(int)
    
    # 17: college_team (0, 1, 2)
    X[:, 17] = np.random.choice([0, 1, 2], n_samples, p=[0.8, 0.15, 0.05])
    
    # 18: extracurricular_talent
    X[:, 18] = (np.random.rand(n_samples) < 0.4).astype(int)
    
    # 19: special_lab_participation
    X[:, 19] = (np.random.rand(n_samples) < 0.2).astype(int)
    
    # 20: event_participation
    X[:, 20] = (np.random.rand(n_samples) < 0.5).astype(int)
    
    # 21: event_winner
    X[:, 21] = (X[:, 20] * (np.random.rand(n_samples) < 0.2)).astype(int)
    
    # 22: placement_training_attended
    X[:, 22] = (np.random.rand(n_samples) < 0.7).astype(int)
    
    # 23: placement_training_attendance (0-100)
    X[:, 23] = (X[:, 22] * np.random.normal(80, 10, n_samples)).clip(0, 100)
    
    # 24: placement_interest
    X[:, 24] = (np.random.rand(n_samples) < 0.9).astype(int)
    
    # 25: internship_attended
    X[:, 25] = (np.random.rand(n_samples) < 0.4).astype(int)
    
    # 26: internship_type (0 or 1)
    X[:, 26] = (X[:, 25] * (np.random.rand(n_samples) < 0.5)).astype(int)
    
    # 27: internship_stipend_amount
    X[:, 27] = (X[:, 26] * np.random.normal(15000, 5000, n_samples)).clip(0, 50000)
    
    # 28: stress_level (1-5)
    X[:, 28] = np.random.randint(1, 6, n_samples)
    
    # 29: depression_flag
    X[:, 29] = (np.random.rand(n_samples) < 0.15).astype(int)
    
    y = []
    for i in range(n_samples):
        # Stricter Risk Logic with higher weights
        risk_score = 0
        
        # Primary Factors (High weight)
        if X[i, 9] < 4.5: risk_score += 5      # Very low CGPA
        elif X[i, 9] < 5.5: risk_score += 4    # Low CGPA
        elif X[i, 9] < 6.5: risk_score += 2    # Below average CGPA
            
        if X[i, 11] < 50: risk_score += 5      # Very low Attendance
        elif X[i, 11] < 65: risk_score += 4    # Low Attendance
        elif X[i, 11] < 75: risk_score += 2    # Below standard Attendance
            
        if X[i, 12] > 5: risk_score += 5       # Many backlogs
        elif X[i, 12] > 3: risk_score += 4     # Several backlogs
        elif X[i, 12] > 1: risk_score += 2     # Some backlogs
            
        # Social & Mental Factors
        if X[i, 29] == 1: risk_score += 3      # Depression
        if X[i, 28] > 4: risk_score += 2       # High Stress
        if X[i, 28] == 5: risk_score += 1      # Extreme Stress
            
        # Financial Factors
        if X[i, 13] < 50000: risk_score += 1   # Very low income
        if X[i, 14] == 1: risk_score += 1      # PWD status
        
        # Placement Concerns
        if X[i, 24] == 0: risk_score += 2      # Not interested in placement
        if X[i, 22] == 0: risk_score += 1      # No placement training
        
        # Protective Factors (Negative points)
        if X[i, 19] == 1: risk_score -= 2      # Lab participation
        if X[i, 25] == 1: risk_score -= 2      # Internship
        if X[i, 15] == 1: risk_score -= 1      # Academic participation
        if X[i, 21] == 1: risk_score -= 1      # Event winner
        if X[i, 26] == 1: risk_score -= 1      # Paid internship
        
        # Binary target: 1 if risk_score >= 6 else 0 (stricter threshold)
        # This creates better separation between low and high risk
        y.append(1 if risk_score >= 6 else 0)
        
    return X, np.array(y)

# 1. Generate Data
X, y = generate_robust_data()

# 2. Create Pipeline (Scaling + Model)
# This ensures that large values like income (100k) don't overpower 
# binary flags (0/1) during training or prediction.
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression(max_iter=1000))
])

# 3. Fit Model
pipeline.fit(X, y)

# 4. Save the pipeline
joblib.dump(pipeline, "robust_dropout_model.pkl")

print("Successfully generated robust_dropout_model.pkl (Stricter Criteria)")
print(f"Data balance: {np.mean(y)*100:.2f}% High Risk samples")
print(f"Risk Threshold: >= 6 points")
