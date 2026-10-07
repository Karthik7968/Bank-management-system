import React, { useState } from 'react';
import axios from 'axios';

function UserSubmitCheque() {
  const [formData, setFormData] = useState({
    cheque_id: '',
    sender_accno: '',
    receiver_accno: '',
    amount: '',
    chequeImage: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'chequeImage' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:3001/submit-cheque', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
    } catch (error) {
      console.error('❌ Cheque submission failed:', error);
      alert('Cheque submission failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Submit Cheque</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="cheque_id"
          placeholder="Cheque ID"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="text"
          name="sender_accno"
          placeholder="Sender Account No"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="text"
          name="receiver_accno"
          placeholder="Receiver Account No"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="file"
          name="chequeImage"
          accept="image/*"
          onChange={handleChange}
          required
        />
        <br /><br />
        <button type="submit">Submit Cheque</button>
      </form>
    </div>
  );
}

export default UserSubmitCheque;
