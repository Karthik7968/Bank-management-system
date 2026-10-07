import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ManageCheques() {
  const [cheques, setCheques] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCheques = async () => {
      try {
        const response = await axios.get('http://localhost:3001/admin/cheques/pending');
        if (response.data.success) {
          setCheques(response.data.cheques);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to fetch cheques.');
      }
    };
    fetchCheques();
  }, []);

  const handleApprove = async (chequeId, status) => {
    try {
      const response = await axios.post(`http://localhost:3001/admin/cheques/approve/${chequeId}`, { status });
      if (response.data.success) {
        setCheques(cheques.filter((cheque) => cheque.cheque_id !== chequeId));
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to update cheque status.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Manage Cheques</h2>
      <Link to="/admin/dashboard">
        <button className="mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
          Back to Dashboard
        </button>
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cheques.length === 0 ? (
        <p>No pending cheques.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Cheque ID</th>
              <th className="border p-2">Sender</th>
              <th className="border p-2">Receiver</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cheques.map((cheque) => (
              <tr key={cheque.cheque_id}>
                <td className="border p-2">{cheque.cheque_id}</td>
                <td className="border p-2">{cheque.sender_accno}</td>
                <td className="border p-2">{cheque.receiver_accno}</td>
                <td className="border p-2">${cheque.amount}</td>
                <td className="border p-2">
                  {cheque.cheque_image ? (
                    <a href={`http://localhost:3001/${cheque.cheque_image}`} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`http://localhost:3001/${cheque.cheque_image}`}
                        alt={`Cheque ${cheque.cheque_id}`}
                        className="w-24 h-24 object-cover"
                      />
                    </a>
                  ) : (
                    'No image'
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleApprove(cheque.cheque_id, 'approved')}
                    className="bg-green-500 text-white p-1 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(cheque.cheque_id, 'rejected')}
                    className="bg-red-500 text-white p-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageCheques;
