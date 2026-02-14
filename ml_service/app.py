from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Mock Prediction API
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    print(f"Received data for prediction: {data}")
    
    # 1. Academic Details
    attendance = data.get('attendance', 100)
    backlogs = data.get('backlogs', 0)
    cgpa = data.get('cgpa', 8.0)
    is_above_average = data.get('isAboveAverage', False)
    
    # New Multi-Semester Academic Check
    sems = [
        data.get('sem1Marks', 0), data.get('sem2Marks', 0), data.get('sem3Marks', 0),
        data.get('sem4Marks', 0), data.get('sem5Marks', 0), data.get('sem6', 0),
        data.get('sem7', 0), data.get('sem8', 0)
    ]
    
    risk_score = 0
    
    # Academic Trend Analysis
    low_sem_count = sum(1 for s in sems if 0 < s < 50)
    if low_sem_count >= 3: risk_score += 20  # Chronic low performance
    
    # 2. Socio-Economic/Engagement
    annual_income = data.get('annualIncome', 500000)
    academic_participation = data.get('academicParticipation', True)
    
    # 3. Technical/Technical Skills
    special_lab = data.get('specialLabParticipation', False)
    
    # 4. Placement/Internship
    placement_training = data.get('placementTraining', False)
    internship_status = data.get('internshipStatus', False)
    
    # 5. Mental Health
    stress_level = data.get('stressLevel', 1)
    depression_signs = data.get('depressionSigns', False)
    
    # Primary Risk Factors
    if attendance < 75: risk_score += 30
    if backlogs > 2: risk_score += 25
    if stress_level >= 4: risk_score += 15
    if depression_signs: risk_score += 20
    if annual_income < 200000: risk_score += 10
    
    # Negative Performance
    if not is_above_average and cgpa < 6.0: risk_score += 15
    if low_sem_count > 0: risk_score += (low_sem_count * 5)
    
    # Lack of Engagement
    if not academic_participation: risk_score += 10
    if not special_lab: risk_score += 5
    
    # Mitigation (Protective) Factors
    if placement_training: risk_score -= 10
    if internship_status: risk_score -= 15
    
    # Ensure score doesn't go below 0
    risk_score = max(0, risk_score)
    
    # Threshold for High Risk
    risk = 1 if risk_score >= 50 else 0
        
    return jsonify({
        'dropout_risk': risk, 
        'risk_score': risk_score,
        'criteria': {
            'risk_factors': ['Academic Performance', 'Financial Status', 'Mental Health', 'Engagement'],
            'mitigation_factors': ['Technical Participation', 'Placement Training', 'Internships']
        }
    })

if __name__ == '__main__':
    print("Mock ML Service running on port 5001")
    app.run(port=5001, debug=True)
