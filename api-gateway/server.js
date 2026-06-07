const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Notice: Mongoose and MongoDB are completely removed. No database needed!

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: "Stateless Gateway is live and blazing fast!" });
});

// The Bridge Route
app.use('/api/financials', require('./routes/financials'));

app.listen(PORT, () => {
    console.log(`🚀 Stateless API Gateway running on port ${PORT}`);
});