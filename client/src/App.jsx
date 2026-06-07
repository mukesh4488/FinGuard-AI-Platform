import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Update this to point to your live API Gateway URL
const API_BASE_URL = 'https://finguard-api-gateway.onrender.com';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('fraud');

  // Transaction Form State (Aligned with our new advanced ML model features)
  const [txForm, setTxForm] = useState({
    userId: 'USER-8842',
    amount: '',
    location: '0',      // 0: Local, 1: Domestic Out-of-State, 2: High-Risk International
    merchantType: '0',  // 0: Grocery, 1: Retail, 2: Electronics, 3: Crypto/Gambling
    hour: new Date().getHours().toString()
  });

  // Loan Form State
  const [loanForm, setLoanForm] = useState({
    applicantName: '',
    annualIncome: '',
    creditScore: '',
    loanAmount: '',
    debtToIncomeRatio: ''
  });

  // Response & History States
  const [txResult, setTxResult] = useState(null);
  const [loanResult, setLoanResult] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch log history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const txRes = await axios.get(`${API_BASE_URL}/transactions`);
      const loanRes = await axios.get(`${API_BASE_URL}/loans`);
      if (txRes.data?.data) setTransactions(txRes.data.data);
      if (loanRes.data?.data) setLoans(loanRes.data.data);
    } catch (err) {
      console.error("Error retrieving historical cloud logs:", err);
    }
  };

  // Submit Credit Card Transaction to AI Engine via Gateway
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTxResult(null);
    try {
      const payload = {
        userId: txForm.userId,
        amount: parseFloat(txForm.amount),
        location: parseInt(txForm.location),
        merchantType: parseInt(txForm.merchantType),
        hour: parseInt(txForm.hour)
      };
      
      const res = await axios.post(`${API_BASE_URL}/transaction`, payload);
      setTxResult(res.data.data);
      fetchHistory(); // Refresh table view
    } catch (err) {
      alert("API Gateway Communication Timeout or Failure.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Loan Application to AI Engine via Gateway
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoanResult(null);
    try {
      const payload = {
        applicantName: loanForm.applicantName,
        annualIncome: parseFloat(loanForm.annualIncome),
        creditScore: parseFloat(loanForm.creditScore),
        loanAmount: parseFloat(loanForm.loanAmount),
        debtToIncomeRatio: parseFloat(loanForm.debtToIncomeRatio)
      };

      const res = await axios.post(`${API_BASE_URL}/loan`, payload);
      setLoanResult(res.data.data);
      fetchHistory(); // Refresh table view
    } catch (err) {
      alert("API Gateway Communication Timeout or Failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ borderBottom: '1px solid #334155', padding: '20px 40px', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '1px' }}>
            🥽 FINGUARD AI PLATFORM
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Enterprise Microservices Architecture • Live Production Command Center
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('fraud')} 
            style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'fraud' ? '#0284c7' : '#1e293b', color: '#fff' }}>
            💳 Fraud Terminal
          </button>
          <button 
            onClick={() => setActiveTab('loan')} 
            style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'loan' ? '#0284c7' : '#1e293b', color: '#fff' }}>
            🏦 Underwriting Suite
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'analytics' ? '#0284c7' : '#1e293b', color: '#fff' }}>
            📊 Cloud Auditing Logs
          </button>
        </div>
      </header>

      {/* SYSTEM META INFRASTRUCTURE METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px 40px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>GATEWAY INFRASTRUCTURE</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px', color: '#22c55e' }}>● Operational [Node.js Engine]</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>PREDICTIVE AI ENGINE</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px', color: '#22c55e' }}>● Active [Random Forest Classifier]</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>DATABASE PERSISTENCE</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px', color: '#eab308' }}>MongoDB Atlas Cluster</div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>TOTAL PROCESSED LOGS</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>{transactions.length + loans.length} Actions</div>
        </div>
      </div>

      <main style={{ padding: '20px 40px' }}>
        {loading && (
          <div style={{ backgroundColor: '#0284c7', color: '#fff', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
            ⏳ Syncing distributed pipeline states... Fetching neural risk configurations...
          </div>
        )}

        {/* TAB 1: FRAUD ANALYSIS DETECTOR */}
        {activeTab === 'fraud' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h2 style={{ marginTop: 0, color: '#38bdf8' }}>Transaction Risk Profiler</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Feed transaction attributes to the live model to evaluate mathematical anomaly thresholds.</p>
              
              <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <label>
                  <span style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Transaction Volume (USD)</span>
                  <input type="number" required placeholder="e.g. 750" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Geographic Velocity Vector</span>
                  <select value={txForm.location} onChange={e => setTxForm({...txForm, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}>
                    <option value="0">Local Area (Standard Customer Radius)</option>
                    <option value="1">Domestic Out-of-State (High Velocity Shift)</option>
                    <option value="2">High-Risk International Node</option>
                  </select>
                </label>

                <label>
                  <span style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Merchant Registry Risk Level</span>
                  <select value={txForm.merchantType} onChange={e => setTxForm({...txForm, merchantType: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}>
                    <option value="0">Wholesale Groceries / Utilities (Low Risk)</option>
                    <option value="1">Standard Retail / Standard Apparel (Medium Risk)</option>
                    <option value="2">Online Electronics Retailers (Elevated Risk)</option>
                    <option value="3">Offshore Crypto Exchanges / Gambling Nodes (Severe Risk)</option>
                  </select>
                </label>

                <button type="submit" style={{ padding: '12px', marginTop: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                  Execute ML Risk Diagnosis
                </button>
              </form>
            </div>

            {/* FRAUD OUTPUT SCREEN */}
            <div style={{ backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '2px dashed #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {txResult ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: txResult.isFlagged ? '#f43f5e' : '#22c55e' }}>
                    {(txResult.fraudScore * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Statistical Fraud Probability</div>
                  
                  <div style={{ marginTop: '30px', padding: '15px', borderRadius: '8px', backgroundColor: txResult.isFlagged ? 'rgba(244,63,94,0.1)' : 'rgba(34,197,94,0.1)', border: txResult.isFlagged ? '1px solid #f43f5e' : '1px solid #22c55e', color: txResult.isFlagged ? '#f43f5e' : '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>
                    {txResult.isFlagged ? '🚨 TRANSACTION INTERCEPTED & FLAGGED' : '✅ TRANSACTION SECURELY APPROVED'}
                  </div>

                  <div style={{ marginTop: '30px', textAlign: 'left', backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                    <strong>System Vector Metadata:</strong>
                    <pre style={{ margin: '5px 0 0 0' }}>{JSON.stringify(txResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '40px' }}>⚡</div>
                  <p>Awaiting transaction stream inputs...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREDIT UNDERWRITING SUITE */}
        {activeTab === 'loan' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h2 style={{ marginTop: 0, color: '#a855f7' }}>Risk Underwriting Console</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Processes structural client indices to isolate capital risk exposure scales.</p>
              
              <form onSubmit={handleLoanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="text" required placeholder="Applicant Full Name" value={loanForm.applicantName} onChange={e => setLoanForm({...loanForm, applicantName: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
                <input type="number" required placeholder="Annual Income (USD)" value={loanForm.annualIncome} onChange={e => setLoanForm({...loanForm, annualIncome: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
                <input type="number" required placeholder="Credit Score (300 - 850)" value={loanForm.creditScore} onChange={e => setLoanForm({...loanForm, creditScore: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
                <input type="number" required placeholder="Requested Loan Face Value (USD)" value={loanForm.loanAmount} onChange={e => setLoanForm({...loanForm, loanAmount: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
                <input type="number" step="0.01" required placeholder="Debt-to-Income Ratio (0.01 - 1.00)" value={loanForm.debtToIncomeRatio} onChange={e => setLoanForm({...loanForm, debtToIncomeRatio: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />

                <button type="submit" style={{ padding: '12px', marginTop: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#a855f7', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                  Evaluate Underwriting Strategy
                </button>
              </form>
            </div>

            {/* LOAN OUTPUT SCREEN */}
            <div style={{ backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '2px dashed #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {loanResult ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: loanResult.status === 'Rejected' ? '#f43f5e' : '#22c55e' }}>
                    {(loanResult.riskScore * 100).toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Portfolio Default Risk Index</div>
                  
                  <div style={{ marginTop: '30px', padding: '15px', borderRadius: '8px', backgroundColor: loanResult.status === 'Rejected' ? 'rgba(244,63,94,0.1)' : 'rgba(34,197,94,0.1)', border: loanResult.status === 'Rejected' ? '1px solid #f43f5e' : '1px solid #22c55e', color: loanResult.status === 'Rejected' ? '#f43f5e' : '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>
                    {loanResult.status === 'Rejected' ? '❌ APPLICATION RISK OUTSIDE PARAMETERS' : '✅ FUNDING CAPABILITY APPROVED'}
                  </div>

                  <div style={{ marginTop: '30px', textAlign: 'left', backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                    <strong>Pipeline Serialization:</strong>
                    <pre style={{ margin: '5px 0 0 0' }}>{JSON.stringify(loanResult, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '40px' }}>🏛️</div>
                  <p>Awaiting structural credit metrics...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-TIME AUDITING LOG TABLES */}
        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#eab308' }}>Central Ledger Audit Logs</h2>
              <button onClick={fetchHistory} style={{ padding: '8px 16px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                🔄 Synchronize Ledger
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* TRANSACTION HISTORY */}
              <div>
                <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '8px', color: '#38bdf8' }}>Transaction Pipeline Logs</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {transactions.length === 0 ? <p style={{ color: '#64748b', fontSize: '14px' }}>No records persisted.</p> : (
                    <table style={{ width: '100%', textAligh: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                          <th style={{ padding: '8px' }}>Amount</th>
                          <th style={{ padding: '8px' }}>Risk Score</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>${t.amount}</td>
                            <td style={{ padding: '8px', fontFamily: 'monospace' }}>{(t.fraudScore * 100).toFixed(1)}%</td>
                            <td style={{ padding: '8px', color: t.isFlagged ? '#f43f5e' : '#22c55e', fontWeight: 'bold' }}>
                              {t.isFlagged ? 'FLAGGED' : 'PASSED'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* LOAN APPS HISTORY */}
              <div>
                <h3 style={{ borderBottom: '2px solid #334155', paddingBottom: '8px', color: '#a855f7' }}>Underwriting Credit Logs</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loans.length === 0 ? <p style={{ color: '#64748b', fontSize: '14px' }}>No records persisted.</p> : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                          <th style={{ padding: '8px' }}>Applicant</th>
                          <th style={{ padding: '8px' }}>Loan Value</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((l, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '8px' }}>{l.applicantName}</td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>${l.loanAmount}</td>
                            <td style={{ padding: '8px', color: l.status === 'Rejected' ? '#f43f5e' : '#22c55e', fontWeight: 'bold' }}>
                              {l.status.toUpperCase()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}