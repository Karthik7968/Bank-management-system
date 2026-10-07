import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function TransferMoney({ user }) {
  const [formData, setFormData] = useState({
    to_account: '',
    amount: '',
    pin: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending transfer request:', {
        from_account: user.account_number,
        to_account: formData.to_account,
        pin: formData.pin,
        amount: parseInt(formData.amount),
        description: formData.description,
      });
      const response = await axios.post('http://localhost:3001/user/transfer', {
        from_account: user.account_number,
        to_account: formData.to_account,
        pin: formData.pin,
        amount: parseInt(formData.amount),
        description: formData.description,
      });
      if (response.data.success) {
        setSuccess(response.data.message);
        setFormData({ to_account: '', amount: '', pin: '', description: '' });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Transfer error:', err.response?.data || err.message);
      setError('Failed to transfer money.');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Transfer Money</h2>
      <Link to="/user/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleTransfer}>
        <input
          type="text"
          name="to_account"
          placeholder="Recipient Account Number"
          value={formData.to_account}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="password"
          name="pin"
          placeholder="PIN"
          value={formData.pin}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Transfer
        </button>
      </form>
    </div>
  );
}

export default TransferMoney;
