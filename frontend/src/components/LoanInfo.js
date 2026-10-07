import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LoanInfo({ user }) {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/loans/${user.account_number}`);
        if (response.data.success) {
          setLoans(response.data.loans);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch loan info.');
      }
    };
    fetchLoans();
  }, [user.account_number]);

  const handlePayEMI = async () => {
    if (!selectedLoanId) {
      setError('Please select a loan.');
      return;
    }

    const selectedLoan = loans.find(loan => loan.loan_id === selectedLoanId);
    if (!selectedLoan) {
      setError('Loan not found.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3001/user/emi/${selectedLoanId}`, {
  account_number: user.account_number,
  amount: selectedLoan.emi,
  password: password
});


      if (response.data.success) {
        setSuccess(response.data.message);
        setError('');
        setPassword('');
      } else {
        setError(response.data.message);
        setSuccess('');
      }
    } catch (err) {
      setError('Failed to process EMI payment.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Loan Information</h2>
      <Link to="/user/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        <>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Loan ID</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Interest Rate</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">EMI</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.loan_id}>
                  <td className="border p-2">{loan.loan_id}</td>
                  <td className="border p-2">₹{loan.amount}</td>
                  <td className="border p-2">{loan.interest_rate}%</td>
                  <td className="border p-2">{loan.status}</td>
                  <td className="border p-2">₹{loan.emi}</td>
                  <td className="border p-2">{new Date(loan.created_at).toLocaleString()}</td>
                  <td className="border p-2 text-center">
                    <input
                      type="radio"
                      name="selectedLoan"
                      value={loan.loan_id}
                      onChange={() => setSelectedLoanId(loan.loan_id)}
                      checked={selectedLoanId === loan.loan_id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="max-w-md">
            <h3 className="text-xl mb-2">Pay EMI</h3>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={handlePayEMI}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Confirm EMI Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LoanInfo;
