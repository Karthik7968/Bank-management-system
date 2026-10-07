import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="p-8 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <img src="/ffbank-new-logo.png" alt="FFBank Logo" className="mx-auto mb-6 w-48 h-auto object-contain" />
        <div className="grid grid-cols-3 gap-4">
          <Link to="/user/login">
            <button className="w-full aspect-square bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center">
              User Login
            </button>
          </Link>
          <Link to="/admin/login">
            <button className="w-full aspect-square bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center">
              Admin Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="w-full aspect-square bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
