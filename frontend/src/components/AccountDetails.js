import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AccountDetails({ user }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/account/${user.account_number}`);
        if (response.data.success) {
          setAccount(response.data.account);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch account details.');
      }
    };
    fetchAccount();
  }, [user.account_number]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Account Details</h2>
      <Link to="/user/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {account && (
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Account Number:</strong> {account.accountNo}</p>
          <p><strong>Name:</strong> {account.name}</p>
          <p><strong>Balance:</strong> ${account.balance}</p>
          <p><strong>Phone:</strong> {account.phoneNo}</p>
          <p><strong>Email:</strong> {account.email}</p>
          <p><strong>Address:</strong> {account.address}</p>
        </div>
      )}
    </div>
  );
}

export default AccountDetails;