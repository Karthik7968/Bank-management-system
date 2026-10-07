import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserLogin from './components/UserLogin';
import UserSignup from './components/UserSignup';
import UserDashboard from './components/UserDashboard';
import AccountDetails from './components/AccountDetails';
import TransferMoney from './components/TransferMoney';
import TransactionHistory from './components/TransactionHistory';
import LoanInfo from './components/LoanInfo';
import UserSubmitCheque from './components/UserSubmitCheque';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import ManageCheques from './components/ManageCheques';
import LoanManagement from './components/LoanManagement';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          {/* User Routes */}
          <Route path="/user/login" element={<UserLogin onLogin={(user) => setUser(user)} />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route
            path="/user/dashboard"
            element={user ? <UserDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/user/login" />}
          />
          <Route
            path="/user/account"
            element={user ? <AccountDetails user={user} /> : <Navigate to="/user/login" />}
          />
          <Route
            path="/user/transfer"
            element={user ? <TransferMoney user={user} /> : <Navigate to="/user/login" />}
          />
          <Route
            path="/user/transactions"
            element={user ? <TransactionHistory user={user} /> : <Navigate to="/user/login" />}
          />
          <Route
            path="/user/loans"
            element={user ? <LoanInfo user={user} /> : <Navigate to="/user/login" />}
          />
          <Route
            path="/user/cheques"
            element={user ? <UserSubmitCheque user={user} /> : <Navigate to="/user/login" />}
          />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin onLogin={(admin) => setAdmin(admin)} />} />
          <Route
            path="/admin/dashboard"
            element={admin ? <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/users"
            element={admin ? <UserManagement /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/cheques"
            element={admin ? <ManageCheques /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/loans"
            element={admin ? <LoanManagement /> : <Navigate to="/admin/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
