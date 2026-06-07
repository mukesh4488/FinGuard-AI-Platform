import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ShieldAlert, Landmark, Activity, Sun, Moon, Home, TerminalSquare, Database } from 'lucide-react';

const API_BASE_URL = 'https://finguard-api-gateway.onrender.com/api/financials';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [txForm, setTxForm] = useState({ userId: 'USER-8842', amount: '', location: '0', merchantType: '0', hour: '12' });
  const [loanForm, setLoanForm] = useState({ applicantName: '', annualIncome: '', creditScore: '', loanAmount: '', debtToIncomeRatio: '' });

  const [txResult, setTxResult] = useState(null);
  const [loanResult, setLoanResult] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const [txRes, loanRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions`),
        axios.get(`${API_BASE_URL}/loans`)
      ]);
      if (txRes.data?.data) setTransactions(txRes.data.data);
      if (loanRes.data?.data) setLoans(loanRes.data.data);
    } catch (err) { console.error("Error retrieving historical logs", err); }
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setTxResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/transaction`, { ...txForm, amount: Number(txForm.amount), location: Number(txForm.location), merchantType: Number(txForm.merchantType), hour: Number(txForm.hour) });
      setTxResult(res.data.data); fetchHistory();
    } catch (err) { alert("API Error"); } finally { setLoading(false); }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setLoanResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/loan`, { ...loanForm, annualIncome: Number(loanForm.annualIncome), creditScore: Number(loanForm.creditScore), loanAmount: Number(loanForm.loanAmount), debtToIncomeRatio: Number(loanForm.debtToIncomeRatio) });
      setLoanResult(res.data.data); fetchHistory();
    } catch (err) { alert("API Error"); } finally { setLoading(false); }
  };

  const theme = isDarkMode ? {
    bg: '#0f172a', surface: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', border: '#334155', primary: '#38bdf8', secondary: '#a855f7', danger: '#f43f5e', success: '#22c55e'
  } : {
    bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', primary: '#0284c7', secondary: '#9333ea', danger: '#e11d48', success: '#16a34a'
  };

  const pieData = [
    { name: 'Approved', value: loans.filter(l => l.status !== 'Rejected').length },
    { name: 'Rejected', value: loans.filter(l => l.status === 'Rejected').length }
  ];
  const COLORS = [theme.success, theme.danger];

  const chartData = transactions.slice(0, 15).reverse().map((t, i) => ({
    name: `Tx ${i+1}`, amount: t.amount, risk: t.fraudScore * 100
  }));

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: 'sans-serif', transition: 'background-color 0.4s ease, color 0.4s ease' }}>
      
      {/* NAVBAR */}
      <header style={{ borderBottom: `1px solid ${theme.border}`, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, transition: 'background-color 0.4s ease' }}>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={28} color={theme.primary} />
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>FINGUARD AI</h1>
        </motion.div>
        
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {['home', 'terminal', 'analytics'].map((tab) => (
            <motion.button 
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)} 
              style={{ padding: '8px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: activeTab === tab ? theme.primary : 'transparent', color: activeTab === tab ? '#fff' : theme.text, transition: 'background-color 0.2s' }}>
              {tab === 'home' && <Home size={18} />}
              {tab === 'terminal' && <TerminalSquare size={18} />}
              {tab === 'analytics' && <Database size={18} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
          
          <div style={{ width: '1px', height: '24px', backgroundColor: theme.border, margin: '0 10px' }}></div>
          
          <motion.button 
            whileHover={{ rotate: 180 }}
            onClick={() => setIsDarkMode(!isDarkMode)} 
            style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${theme.border}`, cursor: 'pointer', backgroundColor: theme.surface, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </motion.div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          
          {/* HOME PAGE */}
          {activeTab === 'home' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.h1 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} style={{ fontSize: '56px', marginBottom: '20px', background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Enterprise Financial Intelligence
              </motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '20px', color: theme.textMuted, maxWidth: '700px', margin: '0 auto 50px auto', lineHeight: '1.6' }}>
                Deployed globally on Render and Vercel. Powered by Scikit-Learn Random Forest models.
              </motion.p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
                <motion.div whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }} onClick={() => setActiveTab('terminal')} style={{ backgroundColor: theme.surface, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                  <ShieldAlert size={48} color={theme.primary} style={{ marginBottom: '20px' }} />
                  <h3>Fraud Detection Terminal</h3>
                  <p style={{ color: theme.textMuted }}>Execute real-time transaction inference.</p>
                </motion.div>
                <motion.div whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }} onClick={() => setActiveTab('terminal')} style={{ backgroundColor: theme.surface, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, cursor: 'pointer' }}>
                  <Landmark size={48} color={theme.secondary} style={{ marginBottom: '20px' }} />
                  <h3>Credit Underwriting</h3>
                  <p style={{ color: theme.textMuted }}>Evaluate loan structures dynamically.</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* TERMINAL PAGE */}
          {activeTab === 'terminal' && (
            <motion.div key="terminal" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ backgroundColor: theme.surface, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.primary, display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldAlert/> Transaction Risk</h2>
                <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  <input type="number" required placeholder="Amount (USD)" value={txForm.amount} onChange={e=>setTxForm({...txForm, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                  <select value={txForm.location} onChange={e=>setTxForm({...txForm, location: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}>
                    <option value="0">Local Area</option>
                    <option value="1">Domestic Out-of-State</option>
                    <option value="2">High-Risk International</option>
                  </select>
                  <select value={txForm.merchantType} onChange={e=>setTxForm({...txForm, merchantType: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }}>
                    <option value="0">Groceries / Low Risk</option>
                    <option value="1">Retail / Standard</option>
                    <option value="2">Electronics / High Risk</option>
                    <option value="3">Crypto / Gambling / Severe Risk</option>
                  </select>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: theme.primary, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? 'Processing...' : 'Run Fraud Inference'}
                  </motion.button>
                </form>
                
                <AnimatePresence>
                  {txResult && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', backgroundColor: txResult.isFlagged ? `${theme.danger}22` : `${theme.success}22`, border: `1px solid ${txResult.isFlagged ? theme.danger : theme.success}` }}>
                        <h3 style={{ color: txResult.isFlagged ? theme.danger : theme.success, margin: 0 }}>
                          {txResult.isFlagged ? '🚨 FLAGGED' : '✅ SECURE'} ({(txResult.fraudScore*100).toFixed(1)}%)
                        </h3>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ backgroundColor: theme.surface, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                <h2 style={{ color: theme.secondary, display: 'flex', alignItems: 'center', gap: '10px' }}><Landmark/> Underwriting</h2>
                <form onSubmit={handleLoanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  <input type="text" required placeholder="Applicant Name" value={loanForm.applicantName} onChange={e=>setLoanForm({...loanForm, applicantName: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="number" required placeholder="Income" value={loanForm.annualIncome} onChange={e=>setLoanForm({...loanForm, annualIncome: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                    <input type="number" required placeholder="Credit Score" value={loanForm.creditScore} onChange={e=>setLoanForm({...loanForm, creditScore: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="number" required placeholder="Loan Amount" value={loanForm.loanAmount} onChange={e=>setLoanForm({...loanForm, loanAmount: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                    <input type="number" step="0.01" required placeholder="Debt Ratio" value={loanForm.debtToIncomeRatio} onChange={e=>setLoanForm({...loanForm, debtToIncomeRatio: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.text }} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: theme.secondary, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? 'Evaluating...' : 'Evaluate Loan Risk'}
                  </motion.button>
                </form>

                <AnimatePresence>
                  {loanResult && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', backgroundColor: loanResult.status === 'Rejected' ? `${theme.danger}22` : `${theme.success}22`, border: `1px solid ${loanResult.status === 'Rejected' ? theme.danger : theme.success}` }}>
                        <h3 style={{ color: loanResult.status === 'Rejected' ? theme.danger : theme.success, margin: 0 }}>
                          {loanResult.status === 'Rejected' ? '❌ REJECTED' : '✅ APPROVED'} ({(loanResult.riskScore*100).toFixed(1)}%)
                        </h3>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS PAGE */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <motion.div whileHover={{ scale: 1.01 }} style={{ backgroundColor: theme.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0 }}>Recent Transaction Flow & Risk Overlay</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                      <XAxis dataKey="name" stroke={theme.textMuted} />
                      <YAxis yAxisId="left" stroke={theme.textMuted} />
                      <YAxis yAxisId="right" orientation="right" stroke={theme.danger} />
                      <RechartsTooltip contentStyle={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="amount" stroke={theme.primary} strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="risk" stroke={theme.danger} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} style={{ backgroundColor: theme.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ marginTop: 0, width: '100%', textAlign: 'left' }}>Loan Approval Ratio</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}