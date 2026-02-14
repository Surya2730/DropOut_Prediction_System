# Student Dropout Prediction System

A comprehensive MERN (MongoDB, Express, React, Node.js) application integrated with a Python-based Machine Learning service to predict and manage student dropout risks.

## 🚀 Features

- **Faculty Dashboard**: Secure authentication and management of student records.
- **AI-Powered Predictions**: Real-time risk assessment using an external ML service.
- **Modern UI**: Fully responsive frontend built with React and custom CSS.
- **Data Export**: Support for exporting student data and reports.

## 📁 Project Structure

```text
DropOutPrediction/
├── client/          # React/Vite Frontend
├── server/          # Node.js/Express Backend
├── ml_service/      # Python/Flask ML Service
└── README.md        # Documentation
```

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **ML Service**: Python, Flask, Scikit-learn (or equivalent)
- **Authentication**: JWT / Google OAuth

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or on Atlas)
- Python 3.8+

### 2. Backend Server
```bash
cd server
npm install
# Copy .env.example to .env and configure your variables
npm start
```

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```

### 4. ML Service
```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
