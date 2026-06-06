const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    location: { type: String, required: true },
    merchantType: { type: String, required: true }, // e.g., Retail, Online, Food
    timestamp: { type: Date, default: Date.now },
    isFlagged: { type: Boolean, default: false },   // Will be updated by Python ML
    fraudScore: { type: Number, default: 0.0 }      // Probability from 0 to 1
});

module.exports = mongoose.model('Transaction', TransactionSchema);