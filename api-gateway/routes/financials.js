const express = require('express');
const router = express.Router();
const axios = require('axios');

// Note: Mongoose models are removed entirely here since we are not using MongoDB

// The LIVE URL where our Python ML service is running
const PYTHON_ML_URL = 'https://finguard-ai-platform.onrender.com';

// ==========================================
// POST ROUTES (Stateless Real-Time Prediction)
// ==========================================

// 1. Route to handle a new credit card transaction (No Database Save)
router.post('/transaction', async (req, res) => {
    try {
        const { userId, amount, location, merchantType, hour } = req.body;

        // Passed data directly to the Python Machine Learning Engine
        const mlResponse = await axios.post(`${PYTHON_ML_URL}/predict-transaction`, {
            amount,
            location,
            merchantType,
            hour 
        });

        const { fraudScore, isFlagged } = mlResponse.data;

        // Construct the output data object on-the-fly without saving to MongoDB
        const evaluationResult = {
            userId,
            amount,
            location,
            merchantType,
            hour,
            fraudScore,
            isFlagged,
            timestamp: new Date()
        };

        // Instantly return the result to the React Frontend
        res.status(201).json({ message: "Transaction processed statelessly", data: evaluationResult });

    } catch (error) {
        console.error("Error in transaction bridge:", error.message);
        res.status(500).json({ error: "Failed to communicate with AI Engine" });
    }
});

// 2. Route to handle a new loan application (No Database Save)
router.post('/loan', async (req, res) => {
    try {
        const { applicantName, annualIncome, creditScore, loanAmount, debtToIncomeRatio } = req.body;

        const mlResponse = await axios.post(`${PYTHON_ML_URL}/predict-loan`, {
            annualIncome,
            creditScore,
            loanAmount,
            debtToIncomeRatio
        });

        const { riskScore, status } = mlResponse.data;

        // Construct the output payload dynamically
        const loanResult = {
            applicantName,
            annualIncome,
            creditScore,
            loanAmount,
            debtToIncomeRatio,
            riskScore,
            status,
            timestamp: new Date()
        };

        // Instantly return the calculation back to React
        res.status(201).json({ message: "Loan application evaluated statelessly", data: loanResult });

    } catch (error) {
        console.error("Error in loan bridge:", error.message);
        res.status(500).json({ error: "Failed to communicate with AI Engine" });
    }
});

// ==========================================
// GET ROUTES (Stateless Hardcoded Fallbacks)
// ==========================================

// 3. Return an empty array so the React chart doesn't crash trying to read missing data
router.get('/transactions', async (req, res) => {
    try {
        res.status(200).json({ data: [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// 4. Return an empty array for loans
router.get('/loans', async (req, res) => {
    try {
        res.status(200).json({ data: [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch loans" });
    }
});

module.exports = router;