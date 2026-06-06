import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Navigation State: transactions, loans, or analytics
  const [activeTab, setActiveTab] = useState('transactions');

  // Transaction Form State
  const [txForm, setTxForm] = useState({
    userId: 'USER_1029',
    amount: '',
    location: 'Mumbai, India',
    merchantType: 'Online'
  });
  const [txResult, setTxResult] = useState(null);

  // Loan Form State
  const [loanForm, setLoanForm] = useState({
    applicantName: '',
    annualIncome: '',
    creditScore: '',
    loanAmount: '',
    debtToIncomeRatio: ''
  });
  const [loanResult, setLoanResult] = useState(null);

  // Analytics State (Fetched from Database)
  const [allTransactions, setAllTransactions] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/financials';

  // Fetch data for the Analytics tab from MongoDB
  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const txRes = await axios.get(`${API_BASE_URL}/transactions`);
      const loanRes = await axios.get(`${API_BASE_URL}/loans`);
      setAllTransactions(txRes.data.data || []);
      setAllLoans(loanRes.data.data || []);
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Trigger data fetch whenever the user switches to the Analytics tab
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  // Handle Transaction Submission
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/transaction`, {
        userId: txForm.userId,
        amount: parseFloat(txForm.amount),
        location: txForm.location,
        merchantType: txForm.merchantType
      });
      setTxResult(response.data.data);
      // Reset input form amount after success
      setTxForm({ ...txForm, amount: '' });
    } catch (error) {
      alert('Error connecting to backend gateway');
    }
  };

  // Handle Loan Submission
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/loan`, {
        applicantName: loanForm.applicantName,
        annualIncome: parseFloat(loanForm.annualIncome),
        creditScore: parseFloat(loanForm.creditScore),
        loanAmount: parseFloat(loanForm.loanAmount),
        debtToIncomeRatio: parseFloat(loanForm.debtToIncomeRatio)
      });
      setLoanResult(response.data.data);
      // Reset loan form input fields after success
      setLoanForm({ applicantName: '', annualIncome: '', creditScore: '', loanAmount: '', debtToIncomeRatio: '' });
    } catch (error) {
      alert('Error connecting to backend gateway');
    }
  };

  // Compute Aggregates for the Analytics Dashboard
  const totalTxCount = allTransactions.length;
  const flaggedTxCount = allTransactions.filter(t => t.isFlagged).length;
  const fraudRate = totalTxCount > 0 ? (flaggedTxCount / totalTxCount) * 100 : 0;

  const totalLoanCount = allLoans.length;
  const approvedLoans = allLoans.filter(l => l.status === 'Approved').length;
  const rejectedLoans = allLoans.filter(l => l.status === 'Rejected').length;
  const pendingLoans = allLoans.filter(l => l.status === 'Pending Review').length;
  const loanApprovalRate = totalLoanCount > 0 ? (approvedLoans / totalLoanCount) * 100 : 0;

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', padding: '30px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>FinGuard AI Platform</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Enterprise Risk Analytics & Fraud Detection Workspace</p>
      </header>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '12px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            backgroundColor: activeTab === 'transactions' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'transactions' ? '#fff' : '#334155', border: 'none', borderRadius: '6px'
          }}
        >
          💳 Credit Card Fraud Terminal
        </button>
        <button 
          onClick={() => setActiveTab('loans')}
          style={{
            padding: '12px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            backgroundColor: activeTab === 'loans' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'loans' ? '#fff' : '#334155', border: 'none', borderRadius: '6px'
          }}
        >
          📊 Credit Risk Evaluation
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            backgroundColor: activeTab === 'analytics' ? '#0f172a' : '#e2e8f0',
            color: activeTab === 'analytics' ? '#fff' : '#334155', border: 'none', borderRadius: '6px'
          }}
        >
          📈 Executive Risk Analytics
        </button>
      </div>

      {/* 1. Transaction View */}
      {activeTab === 'transactions' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2>Simulate Real-Time Transaction</h2>
          <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            <label style={{ fontWeight: '500' }}>Amount (INR):
              <input type="number" required placeholder="e.g. 15000" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
            </label>
            <label style={{ fontWeight: '500' }}>Merchant Type:
              <select style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={txForm.merchantType} onChange={e => setTxForm({...txForm, merchantType: e.target.value})}>
                <option value="Online">Online / E-Commerce</option>
                <option value="Retail">In-Store Retail</option>
                <option value="Food">Dining & Food</option>
              </select>
            </label>
            <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Process Transaction</button>
          </form>

          {txResult && (
            <div style={{ marginTop: '25px', padding: '15px', borderRadius: '5px', backgroundColor: txResult.isFlagged ? '#fee2e2' : '#dcfce7', border: `1px solid ${txResult.isFlagged ? '#ef4444' : '#22c55e'}` }}>
              <h3>AI Assessment Verdict:</h3>
              <p><strong>Fraud Probability Score:</strong> {(txResult.fraudScore * 100).toFixed(0)}%</p>
              <p><strong>Security Status:</strong> {txResult.isFlagged ? '❌ FLAGGED AS FRAUD / SUSPICIOUS ANOMALY' : '✅ SECURE TRANSACTION'}</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Loan View */}
      {activeTab === 'loans' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2>Evaluate New Loan Application</h2>
          <form onSubmit={handleLoanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            <label style={{ fontWeight: '500' }}>Applicant Full Name:
              <input type="text" required placeholder="e.g. John Doe" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={loanForm.applicantName} onChange={e => setLoanForm({...loanForm, applicantName: e.target.value})} />
            </label>
            <label style={{ fontWeight: '500' }}>Annual Income (INR):
              <input type="number" required placeholder="e.g. 800000" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={loanForm.annualIncome} onChange={e => setLoanForm({...loanForm, annualIncome: e.target.value})} />
            </label>
            <label style={{ fontWeight: '500' }}>Credit Score (CIBIL):
              <input type="number" required placeholder="300 - 900" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={loanForm.creditScore} onChange={e => setLoanForm({...loanForm, creditScore: e.target.value})} />
            </label>
            <label style={{ fontWeight: '500' }}>Requested Loan Amount:
              <input type="number" required placeholder="e.g. 250000" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={loanForm.loanAmount} onChange={e => setLoanForm({...loanForm, loanAmount: e.target.value})} />
            </label>
            <label style={{ fontWeight: '500' }}>Debt-to-Income Ratio (0.0 to 1.0):
              <input type="number" step="0.01" required placeholder="e.g. 0.35" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} value={loanForm.debtToIncomeRatio} onChange={e => setLoanForm({...loanForm, debtToIncomeRatio: e.target.value})} />
            </label>
            <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Analyze Underwriting Risk</button>
          </form>

          {loanResult && (
            <div style={{ 
              marginTop: '25px', padding: '15px', borderRadius: '5px', 
              backgroundColor: loanResult.status === 'Approved' ? '#dcfce7' : loanResult.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
              border: `1px solid ${loanResult.status === 'Approved' ? '#22c55e' : loanResult.status === 'Rejected' ? '#ef4444' : '#eab308'}`
            }}>
              <h3>Risk Underwriting Assessment:</h3>
              <p><strong>Calculated Risk Coefficient:</strong> {(loanResult.riskScore * 100).toFixed(0)}%</p>
              <p><strong>System Status:</strong> <strong>{loanResult.status.toUpperCase()}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* 3. Executive Analytics View */}
      {activeTab === 'analytics' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>System-Wide Risk Intelligence</h2>
            <button onClick={fetchAnalyticsData} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px' }}>
              🔄 Refresh Logs
            </button>
          </div>

          {isLoadingAnalytics ? (
            <p>Loading historical records from MongoDB server...</p>
          ) : (
            <div>
              {/* Metric Card Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>TOTAL TRANSACTIONS</span>
                  <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#1e293b' }}>{totalTxCount}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '6px', borderLeft: `4px solid ${fraudRate > 0 ? '#ef4444' : '#10b981'}` }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>FRAUD INTERCEPTION RATE</span>
                  <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#ef4444' }}>{fraudRate.toFixed(1)}%</h3>
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${fraudRate}%`, backgroundColor: '#ef4444', height: '100%' }}></div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '6px', borderLeft: '4px solid #8b5cf6' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>LOAN APPLICATIONS</span>
                  <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#1e293b' }}>{totalLoanCount}</h3>
                </div>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>AI APPROVAL RATE</span>
                  <h3 style={{ margin: '10px 0 0 0', fontSize: '28px', color: '#10b981' }}>{loanApprovalRate.toFixed(1)}%</h3>
                  <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${loanApprovalRate}%`, backgroundColor: '#10b981', height: '100%' }}></div>
                  </div>
                </div>
              </div>

              {/* Data Tables Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                {/* Recent Transactions */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Recent Fraud Logs (MongoDB)</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ padding: '10px' }}>User ID</th>
                          <th style={{ padding: '10px' }}>Amount</th>
                          <th style={{ padding: '10px' }}>Channel</th>
                          <th style={{ padding: '10px' }}>AI Risk Score</th>
                          <th style={{ padding: '10px' }}>Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTransactions.length === 0 ? (
                          <tr><td colSpan="5" style={{ padding: '15px', color: '#94a3b8' }}>No transactions recorded yet. Submit one in the terminal!</td></tr>
                        ) : (
                          allTransactions.map((tx, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px' }}>{tx.userId}</td>
                              <td style={{ padding: '10px' }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '10px' }}>{tx.merchantType}</td>
                              <td style={{ padding: '10px' }}>{(tx.fraudScore * 100).toFixed(0)}%</td>
                              <td style={{ padding: '10px', color: tx.isFlagged ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                {tx.isFlagged ? '❌ FLAGGED' : '✅ SECURE'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Loan Evaluations */}
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Recent Underwriting Logs (MongoDB)</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ padding: '10px' }}>Applicant</th>
                          <th style={{ padding: '10px' }}>Loan Requested</th>
                          <th style={{ padding: '10px' }}>CIBIL</th>
                          <th style={{ padding: '10px' }}>Risk Coefficient</th>
                          <th style={{ padding: '10px' }}>Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLoans.length === 0 ? (
                          <tr><td colSpan="5" style={{ padding: '15px', color: '#94a3b8' }}>No applications evaluated yet. Submit one in the terminal!</td></tr>
                        ) : (
                          allLoans.map((loan, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px' }}>{loan.applicantName}</td>
                              <td style={{ padding: '10px' }}>₹{loan.loanAmount.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '10px' }}>{loan.creditScore}</td>
                              <td style={{ padding: '10px' }}>{(loan.riskScore * 100).toFixed(0)}%</td>
                              <td style={{ padding: '10px', fontWeight: 'bold', color: loan.status === 'Approved' ? '#10b981' : loan.status === 'Rejected' ? '#ef4444' : '#eab308' }}>
                                {loan.status.toUpperCase()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;