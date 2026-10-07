import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LoanManagement() {
  const [userId, setUserId] = useState('');
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');

  const fetchLoans = async () => {
    if (!userId) {
      setError('Please enter a user ID.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/admin/loans/${userId}`);
      if (response.data.success) {
        setLoans(response.data.loans);
        setError('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch loans.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Loan Management</h2>
      <Link to="/admin/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button
          onClick={fetchLoans}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Fetch Loans
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Loan ID</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Interest Rate</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.loan_id}>
                <td className="border p-2">{loan.loan_id}</td>
                <td className="border p-2">${loan.amount}</td>
                <td className="border p-2">{loan.interest_rate}%</td>
                <td className="border p-2">{loan.status}</td>
                <td className="border p-2">{new Date(loan.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LoanManagement;