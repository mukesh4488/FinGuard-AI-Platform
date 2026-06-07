const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import our database models to ensure MongoDB compiles them
const Transaction = require('./models/Transaction');
const Loan = require('./models/Loan');

// ==========================================
// UPDATED CORS MIDDLEWARE
// ==========================================
// This explicitly tells the cloud firewall to let your React frontend in
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Successfully connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Simple test route to ensure our gateway is live
app.get('/api/health', (req, res) => {
    res.json({ status: "Gateway is up and running!" });
});

// The Bridge Route - Links your Node.js gateway to your Python ML engine
app.use('/api/financials', require('./routes/financials'));

// Start listening for requests
app.listen(PORT, () => {
    console.log(`🚀 API Gateway server running on port ${PORT}`);
});