import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Trash2, User, LogOut, AlertTriangle, XCircle } from 'lucide-react';
import './App.css';

const AuthContext = createContext();

export default function App() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('fin_users')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('fin_active_user')) || null);

  // Persistence: Update Master User List whenever users change
  useEffect(() => {
    localStorage.setItem('fin_users', JSON.stringify(users));
  }, [users]);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('fin_active_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const signup = (userData) => {
    const userExists = users.some(u => u.email === userData.email);
    if (userExists) return alert("User already exists!");
    const newUsers = [...users, { ...userData, transactions: [], initialBalance: 0 }];
    setUsers(newUsers);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fin_active_user');
  };

  const deleteAccount = () => {
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    setUsers(updatedUsers);
    logout();
  };

  const updateUserData = (updatedTransactions, updatedBalance) => {
    const updatedUser = { ...currentUser, transactions: updatedTransactions, initialBalance: updatedBalance };
    setCurrentUser(updatedUser);
    localStorage.setItem('fin_active_user', JSON.stringify(updatedUser));
    setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, updateUserData, deleteAccount }}>
      <Router>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animated-bg">
          <Navbar />
          <Routes>
            {/* Home Page remains a landing page with Get Started button */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </motion.div>
      </Router>
    </AuthContext.Provider>
  );
}

// --- COMPONENTS ---

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  return (
    <nav className="navbar">
      <div style={{ fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Wallet /> AssetFlow
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {currentUser ? (
          <>
            <Link to="/dashboard">Tracking</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><LogOut size={20} /></button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" />;
}

// --- PAGES ---

function Home() {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="auth-wrapper" style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }}>Track Your ₹ Wealth</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>The professional dashboard for Indian smart savers.</p>
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to={currentUser ? "/dashboard" : "/signup"}>
            <button className="btn-submit" style={{ width: '200px', background: 'white', color: '#6366f1' }}>
              {currentUser ? "Go to Dashboard" : "Get Started"}
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Login() {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(creds.email, creds.password)) navigate('/dashboard');
    else alert("Invalid Credentials");
  };

  return (
    <div className="auth-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <motion.div className="glass-card" style={{ width: '100%', maxWidth: '400px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>User Login</h2>
        <form onSubmit={handleLogin}>
          <input className="input-field" type="email" placeholder="Email" onChange={e => setCreds({ ...creds, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" onChange={e => setCreds({ ...creds, password: e.target.value })} required />
          <button className="btn-submit">Login</button>
        </form>
      </motion.div>
    </div>
  );
}

function Signup() {
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (signup(data)) navigate('/login');
  };

  return (
    <div className="auth-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <motion.div className="glass-card" style={{ width: '100%', maxWidth: '400px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
        <form onSubmit={handleSignup}>
          <input className="input-field" placeholder="Full Name" onChange={e => setData({ ...data, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Email" onChange={e => setData({ ...data, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" onChange={e => setData({ ...data, password: e.target.value })} required />
          <button className="btn-submit">Register</button>
        </form>
      </motion.div>
    </div>
  );
}

function Dashboard() {
  const { currentUser, updateUserData } = useContext(AuthContext);
  const [form, setForm] = useState({ desc: '', amount: '', type: 'expense' });
  const [initBal, setInitBal] = useState(currentUser.initialBalance || 0);

  const transactions = currentUser.transactions || [];
  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const netBalance = initBal + income - expense;

  const barData = [
    { name: 'Income', val: income, color: '#059669' },
    { name: 'Expense', val: expense, color: '#dc2626' }
  ];

  const handleAddTx = (e) => {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    const uniqueId = Date.now();
    const formattedDate = new Date().toLocaleDateString('en-IN');
    const newList = [{ ...form, id: uniqueId, amount: Number(form.amount), date: formattedDate }, ...transactions];
    updateUserData(newList, initBal);
    setForm({ ...form, desc: '', amount: '' });
  };

  const handleDeleteTx = (id) => {
    const filtered = transactions.filter(t => t.id !== id);
    updateUserData(filtered, initBal);
  };

  return (
    <div className="dashboard-container">
      {netBalance < 10000 && (
        <div className="low-balance-alert">
          <AlertTriangle size={20} /> Low Balance Alert: Your net balance is below ₹10,000.
        </div>
      )}

      <div className="summary-grid">
        <SummaryCard label="Net Balance" value={`₹${netBalance.toLocaleString()}`} color={netBalance < 10000 ? "#dc2626" : "#1e293b"} />
        <SummaryCard label="Total Income" value={`₹${income.toLocaleString()}`} color="#059669" icon={<TrendingUp />} />
        <SummaryCard label="Total Expense" value={`₹${expense.toLocaleString()}`} color="#dc2626" icon={<TrendingDown />} />
      </div>

      <div className="main-layout">
        <motion.div className="glass-card" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h3 style={{ marginBottom: '15px' }}>Wallet Setup</h3>
          <input className="input-field" type="number" value={initBal} onChange={(e) => {
            const val = Number(e.target.value);
            setInitBal(val);
            updateUserData(transactions, val);
          }} />

          <h3 style={{ marginTop: '25px', marginBottom: '15px' }}>Record Entry</h3>
          <form onSubmit={handleAddTx}>
            <input className="input-field" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Description" required />
            <input className="input-field" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount ₹" required />
            <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
              <button type="button" onClick={() => setForm({ ...form, type: 'income' })} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: form.type === 'income' ? '#1e293b' : '#eee', color: form.type === 'income' ? 'white' : '#000', border: 'none', cursor: 'pointer' }}>Income</button>
              <button type="button" onClick={() => setForm({ ...form, type: 'expense' })} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: form.type === 'expense' ? '#1e293b' : '#eee', color: form.type === 'expense' ? 'white' : '#000', border: 'none', cursor: 'pointer' }}>Expense</button>
            </div>
            <button className="btn-submit">Add to Ledger</button>
          </form>
        </motion.div>

        <motion.div className="glass-card" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h3 style={{ marginBottom: '20px' }}>Visual Analysis</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="val" radius={[10, 10, 0, 0]} barSize={60}>
                  {barData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <h3 style={{ marginTop: '30px' }}>History</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <AnimatePresence>
              {transactions.map(t => (
                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tx-item">
                  <div><strong>{t.desc}</strong><br /><small>{t.date}</small></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: t.type === 'income' ? 'green' : 'red', fontWeight: 700 }}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </div>
                    <Trash2 size={16} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => handleDeleteTx(t.id)} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Profile() {
  const { currentUser, deleteAccount } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAccountDelete = () => {
    if (window.confirm("Warning: This will permanently delete your account. Proceed?")) {
      deleteAccount();
      navigate('/');
    }
  };

  return (
    <div className="auth-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <motion.div className="glass-card" style={{ textAlign: 'center', width: '350px' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <div style={{ background: '#6366f1', color: 'white', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={40} />
        </div>
        <h2>{currentUser.name}</h2>
        <p style={{ color: '#64748b' }}>{currentUser.email}</p>
        <button onClick={handleAccountDelete} style={{ marginTop: '30px', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '10px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 }}>
          <XCircle size={18} /> Delete Account
        </button>
      </motion.div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: '26px', fontWeight: 900, color }}>{value}</p>
      </div>
      <div style={{ color }}>{icon}</div>
    </div>
  );
}