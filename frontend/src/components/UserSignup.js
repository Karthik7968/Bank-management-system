import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function UserSignup() {
  const [formData, setFormData] = useState({
    account_number: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.account_number || !formData.password) {
      setError('Account Number and Password are required.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/user/signup', formData);
      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="p-8 min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">User Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="account_number"
            placeholder="Account Number"
            value={formData.account_number}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <button
              type="submit"
              className="w-full aspect-square bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            >
              Sign Up
            </button>
            <Link to="/">
              <button className="w-full aspect-square bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200 flex items-center justify-center">
                Back to Login
              </button>
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default UserSignup;
