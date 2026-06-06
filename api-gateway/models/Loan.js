const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
    applicantName: { type: String, required: true },
    annualIncome: { type: Number, required: true },
    creditScore: { type: Number, required: true },   // Traditional CIBIL score
    loanAmount: { type: Number, required: true },
    debtToIncomeRatio: { type: Number, required: true },
    status: { type: String, default: 'Pending' },    // Pending, Approved, Rejected
    riskScore: { type: Number, default: 0.0 }        // Calculated by Python ML
});

module.exports = mongoose.model('Loan', LoanSchema);