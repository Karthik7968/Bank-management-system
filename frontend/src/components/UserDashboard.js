import React from 'react';
import { Link } from 'react-router-dom';

function UserDashboard({ user, onLogout }) {
  return (
    <div className="p-8 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Dashboard</h2>
        <p className="mb-6 text-center text-gray-600">Welcome, Account {user.account_number}</p>
        <div className="grid grid-cols-1 gap-4">
          <Link to="/user/account">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              View Account Details
            </button>
          </Link>
          <Link to="/user/transfer">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              Transfer Money
            </button>
          </Link>
          <Link to="/user/transactions">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              View Transaction History
            </button>
          </Link>
          <Link to="/user/loans">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              View Loan Info
            </button>
          </Link>
          <Link to="/user/cheques">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              Submit Cheque
            </button>
          </Link>
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-200 text-center flex items-center justify-center"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
