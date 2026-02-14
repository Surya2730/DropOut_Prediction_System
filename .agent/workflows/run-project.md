---
description: How to run the DropOutPrediction system locally
---

To run the full system, you need to start three services: the Node.js Backend, the Vite React Frontend, and the Python ML Service.

### 1. Start the Node.js Backend
```powershell
cd server
npm install
npm start
```
*Port: http://localhost:5000*

### 2. Start the Python Flask ML Service
```powershell
cd ml_service
# Activate your virtual environment if you have one
python app.py
```
*Port: http://localhost:5001*

### 3. Start the React Frontend
```powershell
cd client
npm install
npm run dev
```
*Port: http://localhost:5173 (Note: This is the port we set for Google OAuth)*

### 🚀 Usage Tips
- **Faculty Login**: Use `suryaselvam.219@gmail.com` via Google Login to access all features.
- **Student Login**: Use any other email to see only your own data.
- **Database**: Ensure your local MongoDB is running at `mongodb://localhost:27017`.
