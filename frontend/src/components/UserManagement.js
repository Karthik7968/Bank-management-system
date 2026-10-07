import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserManagement() {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const fetchUser = async () => {
    if (!userId) {
      setError('Please enter a user ID.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/admin/users/${userId}`);
      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name,
          age: response.data.user.age,
          phone_no: response.data.user.phoneNo,
          email_id: response.data.user.email,
          address: response.data.user.address,
          balance: response.data.user.balance, 
        });
        setError('');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch user.');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/admin/users/${userId}`, formData);
      if (response.data.success) {
        setError('');
        alert('User updated successfully!');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update user.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
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
          onClick={fetchUser}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Fetch User
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {user && (
        <div>
          <h3 className="text-xl mb-2">Edit User: {user.accountNo}</h3>
          <input
            type="text"
            placeholder="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            placeholder="Age"
            value={formData.age || ''}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone_no || ''}
            onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email_id || ''}
            onChange={(e) => setFormData({ ...formData, email_id: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            placeholder="Balance"
            value={formData.balance || ''}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            onClick={handleUpdate}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Update User
          </button>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
