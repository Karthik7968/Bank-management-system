import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard({ admin, onLogout }) {
  return (
    <div className="p-8 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h2>
        <p className="mb-6 text-center text-gray-600">Welcome, Admin {admin.adminId}</p>
        <div className="grid grid-cols-1 gap-4">
          <Link to="/admin/users">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              Manage Users
            </button>
          </Link>
          <Link to="/admin/cheques">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              Manage Cheques
            </button>
          </Link>
          <Link to="/admin/loans">
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center flex items-center justify-center">
              Manage Loans
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

export default AdminDashboard;
