require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const studentRoutes = require('./routes/studentRoutes');
const predictRoutes = require('./routes/predictRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSpec');


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/students', studentRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/auth', authRoutes);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
