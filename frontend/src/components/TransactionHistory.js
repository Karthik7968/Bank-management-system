import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TransactionHistory({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/transactions/${user.account_number}`);
        if (response.data.success) {
          setTransactions(response.data.transactions);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch transaction history.');
      }
    };
    fetchTransactions();
  }, [user.account_number]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <Link to="/user/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Recipient</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.transaction_id}>
                <td className="border p-2">{txn.transaction_id}</td>
                <td className="border p-2">{txn.type}</td>
                <td className="border p-2">${txn.amount}</td>
                <td className="border p-2">{txn.recipient_account || 'N/A'}</td>
                <td className="border p-2">{txn.description}</td>
                <td className="border p-2">{new Date(txn.transaction_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionHistory;