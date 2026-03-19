from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

# ✅ Step 1: Create app FIRST
app = Flask(__name__)
CORS(app)

# ✅ Step 2: Load model
model = joblib.load("robust_dropout_model.pkl")

# ✅ Step 3: Routes
@app.route("/")
def home():
    return "ML Service Running 🚀"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    try:
        features = np.array([[
            float(data.get("semesters_completed", 0)),
            float(data.get("sem1_marks", 0)),
            float(data.get("sem2_marks", 0)),
            float(data.get("sem3_marks", 0)),
            float(data.get("sem4_marks", 0)),
            float(data.get("sem5_marks", 0)),
            float(data.get("sem6_marks", 0)),
            float(data.get("sem7_marks", 0)),
            float(data.get("sem8_marks", 0)),
            float(data.get("cgpa", 0)),
            float(data.get("above_average_student", 0)),
            float(data.get("attendance", 0)),
            float(data.get("backlogs", 0)),
            float(data.get("family_income", 0)),
            float(data.get("pwd", 0)),
            float(data.get("participates_academics", 0)),
            float(data.get("sports_person", 0)),
            float(data.get("college_team", 0)),
            float(data.get("extracurricular_talent", 0)),
            float(data.get("special_lab_participation", 0)),
            float(data.get("event_participation", 0)),
            float(data.get("event_winner", 0)),
            float(data.get("placement_training_attended", 0)),
            float(data.get("placement_training_attendance", 0)),
            float(data.get("placement_interest", 1)),
            float(data.get("internship_attended", 0)),
            float(data.get("internship_type", 0)),
            float(data.get("internship_stipend_amount", 0)),
            float(data.get("stress_level", 1)),
            float(data.get("depression_flag", 0))
        ]])
    except Exception as e:
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400

    prediction = model.predict(features)[0]

    return jsonify({
        "dropout_risk": int(prediction),
        "message": "High Risk" if prediction == 1 else "Low Risk"
    })

# ✅ Step 4: Run app (Render compatible)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
