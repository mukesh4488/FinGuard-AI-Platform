const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');

// The LIVE URL where our Python ML service is running
const PYTHON_ML_URL = 'https://finguard-ai-platform.onrender.com';

// ==========================================
// POST ROUTES (Saving New Data)
// ==========================================

// 1. Route to handle a new credit card transaction
router.post('/transaction', async (req, res) => {
    try {
        // ADDED 'hour' to the incoming request body
        const { userId, amount, location, merchantType, hour } = req.body;

        // Passed 'hour' to the Python Machine Learning Engine
        const mlResponse = await axios.post(`${PYTHON_ML_URL}/predict-transaction`, {
            amount,
            location,
            merchantType,
            hour 
        });

        const { fraudScore, isFlagged } = mlResponse.data;

        const newTransaction = new Transaction({
            userId,
            amount,
            location,
            merchantType,
            fraudScore,
            isFlagged
        });

        await newTransaction.save();
        res.status(201).json({ message: "Transaction processed", data: newTransaction });

    } catch (error) {
        console.error("Error in transaction bridge:", error.message);
        res.status(500).json({ error: "Failed to communicate with AI Engine" });
    }
});

// 2. Route to handle a new loan application
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

        const newLoan = new Loan({
            applicantName,
            annualIncome,
            creditScore,
            loanAmount,
            debtToIncomeRatio,
            riskScore,
            status
        });

        await newLoan.save();
        res.status(201).json({ message: "Loan application evaluated", data: newLoan });

    } catch (error) {
        console.error("Error in loan bridge:", error.message);
        res.status(500).json({ error: "Failed to communicate with AI Engine" });
    }
});

// ==========================================
// GET ROUTES (Fetching Data for Charts)
// ==========================================

// 3. Fetch all transactions (latest first)
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(100);
        res.status(200).json({ data: transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});

// 4. Fetch all loan applications (latest first)
router.get('/loans', async (req, res) => {
    try {
        const loans = await Loan.find().sort({ _id: -1 }).limit(100);
        res.status(200).json({ data: loans });
    } catch (error) {
        console.error("Error fetching loans:", error.message);
        res.status(500).json({ error: "Failed to fetch loans" });
    }
});

module.exports = router;