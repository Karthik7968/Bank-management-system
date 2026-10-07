const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup for storing uploaded cheque images
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      cb(null, extname);
  }
});


const dbUserInfo = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@7968',
  database: 'personal_information',
});
const dbCredentials = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@7968',
  database: 'user_credentials',
});

// User Functions
function userLogin(req, res) {
  const { account_number, password } = req.body;
  const query = 'SELECT password FROM user_credentials WHERE account_number = ?';
  dbCredentials.execute(query, [account_number], (err, result) => {
    if (err) {
      console.error("❌ User login query error:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (password === result[0].password) {
      res.status(200).json({ success: true, user: { account_number } });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  });
}


function userSignup(req, res) {
  const { account_number, password } = req.body;

  if (!account_number || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields: account_number and password' });
  }

  const checkUserQuery = `SELECT * FROM personal_information.user_info WHERE Account_number = ?`;

  dbUserInfo.execute(checkUserQuery, [account_number], (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ success: false, message: 'Database error while checking user' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Account number not found. Please contact admin.' });
    }

    const checkCredQuery = `SELECT * FROM user_credentials WHERE account_number = ?`;
    dbCredentials.execute(checkCredQuery, [account_number], (err, credResults) => {
      if (err) {
        console.error("❌ DB Error (credentials check):", err);
        return res.status(500).json({ success: false, message: 'Database error while checking credentials' });
      }

      if (credResults.length > 0) {
        return res.status(409).json({ success: false, message: 'Credentials already exist for this account' });
      }

      const insertCredQuery = `INSERT INTO user_credentials (account_number, password) VALUES (?, ?)`;
      dbCredentials.execute(insertCredQuery, [account_number, password], (err) => {
        if (err) {
          console.error("❌ Credential insert error:", err);
          return res.status(500).json({ success: false, message: 'Failed to create credentials' });
        }

        res.status(201).json({ success: true, message: 'User signed up successfully' });
      });
    });
  });
}


function getAccountDetails(req, res) {
  const { account_number } = req.params;
  const query = 'SELECT * FROM user_info WHERE Account_number = ?';
  dbUserInfo.execute(query, [account_number], (err, result) => {
    if (err) {
      console.error("❌ Error fetching account:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    const user = result[0];
    res.status(200).json({
      success: true,
      account: {
        accountNo: user.Account_number,
        name: user.Name,
        balance: user.Balance,
        phoneNo: user.Phone_No,
        email: user.Email_ID,
        address: user.Address,
      },
    });
  });
}

function transferMoney(req, res) {
  const { from_account, to_account, pin, amount, description } = req.body;
  if (!from_account || !to_account || !pin || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const verifyPinQuery = 'SELECT password FROM user_credentials WHERE account_number = ?';
  dbCredentials.execute(verifyPinQuery, [from_account], (err, result) => {
    if (err) {
      console.error("❌ PIN verification error:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (result.length === 0 || result[0].password !== pin) {
      return res.status(401).json({ success: false, message: 'Invalid PIN or sender not found' });
    }


    dbUserInfo.beginTransaction((err) => {
      if (err) {
        console.error("❌ Transaction error:", err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      const checkBalanceQuery = 'SELECT Balance FROM user_info WHERE Account_number = ?';
      dbUserInfo.execute(checkBalanceQuery, [from_account], (err, result) => {
        if (err || result.length === 0) {
          dbUserInfo.rollback();
          return res.status(404).json({ success: false, message: 'Sender account not found' });
        }
        if (result[0].Balance < amount) {
          dbUserInfo.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        dbUserInfo.execute(checkBalanceQuery, [to_account], (err, result) => {
          if (err || result.length === 0) {
            dbUserInfo.rollback();
            return res.status(404).json({ success: false, message: 'Receiver account not found' });
          }

          const updateSender = 'UPDATE user_info SET Balance = Balance - ? WHERE Account_number = ?';
          const updateReceiver = 'UPDATE user_info SET Balance = Balance + ? WHERE Account_number = ?';
          const insertTransaction = `
            INSERT INTO transactions (account_number, type, amount, recipient_account, description, transaction_date)
            VALUES (?, 'transfer', ?, ?, ?, NOW()),
                   (?, 'transfer', ?, ?, ?, NOW())
          `;

          dbUserInfo.execute(updateSender, [amount, from_account], (err) => {
            if (err) {
              dbUserInfo.rollback();
              return res.status(500).json({ success: false, message: 'Failed to update sender balance' });
            }

            dbUserInfo.execute(updateReceiver, [amount, to_account], (err) => {
              if (err) {
                dbUserInfo.rollback();
                return res.status(500).json({ success: false, message: 'Failed to update receiver balance' });
              }

              // Step 4: Log transactions
              dbUserInfo.execute(
                insertTransaction,
                [
                  from_account, -amount, to_account, description || `Sent to ${to_account}`,
                  to_account, amount, from_account, description || `Received from ${from_account}`
                ],
                (err) => {
                  if (err) {
                    dbUserInfo.rollback();
                    return res.status(500).json({ success: false, message: 'Failed to record transaction' });
                  }

                  dbUserInfo.commit((err) => {
                    if (err) {
                      dbUserInfo.rollback();
                      return res.status(500).json({ success: false, message: 'Transaction commit failed' });
                    }
                    res.status(200).json({ success: true, message: 'Transfer successful' });
                  });
                }
              );
            });
          });
        });
      });
    });
  });
}
function getTransactionHistory(req, res) {
  const { account_number } = req.params;
  const query = `
    SELECT transaction_id, type, amount, recipient_account, description, transaction_date
    FROM transactions
    WHERE account_number = ?
    ORDER BY transaction_date DESC
  `;
  dbUserInfo.execute(query, [account_number], (err, results) => {
    if (err) {
      console.error("❌ Error fetching transactions:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.status(200).json({ success: true, transactions: results });
  });
}

function getLoanInfo(req, res) {
  const { account_number } = req.params;
  const query = `
    SELECT loan_id, amount, interest_rate, status, created_at
    FROM loans
    WHERE account_number = ?
    ORDER BY created_at DESC
  `;
  dbUserInfo.execute(query, [account_number], (err, results) => {
    if (err) {
      console.error("❌ Error fetching loans:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const loansWithEMI = results.map(loan => {
      const P = loan.amount;
      const R = loan.interest_rate / 12 / 100;
      const N = 12; // Fixed 12 months
      const EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      return { ...loan, emi: Math.round(EMI) };
    });

    res.status(200).json({ success: true, loans: loansWithEMI });
  });
}


function payEMI(req, res) {
  const { loan_id } = req.params;
  const { account_number, amount, password } = req.body;

  const authQuery = 'SELECT password FROM user_credentials.user_credentials WHERE account_number = ?';
  dbCredentials.execute(authQuery, [account_number], (err, results) => {
    if (err || results.length === 0 || results[0].password !== password) {
      return res.status(403).json({ success: false, message: 'Authentication failed' });
    }

    dbUserInfo.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Transaction error' });
      }

      const checkBalanceQuery = 'SELECT Balance FROM user_info WHERE Account_number = ?';
      const checkLoanQuery = 'SELECT amount, status FROM loans WHERE loan_id = ? AND account_number = ?';

      dbUserInfo.execute(checkBalanceQuery, [account_number], (err, balanceResult) => {
        if (err || balanceResult.length === 0 || balanceResult[0].Balance < amount) {
          dbUserInfo.rollback();
          return res.status(400).json({ success: false, message: 'Insufficient balance or account not found' });
        }

        dbUserInfo.execute(checkLoanQuery, [loan_id, account_number], (err, loanResult) => {
          if (err || loanResult.length === 0 || loanResult[0].status !== 'pending') {
            dbUserInfo.rollback();
            return res.status(400).json({ success: false, message: 'Loan not found or not pending' });
          }

          const updateBalance = 'UPDATE user_info SET Balance = Balance - ? WHERE Account_number = ?';
          const insertTransaction = `
            INSERT INTO transactions (account_number, type, amount, description)
            VALUES (?, 'emi_payment', ?, ?)
          `;

          dbUserInfo.execute(updateBalance, [amount, account_number], (err) => {
            if (err) return dbUserInfo.rollback(() => res.status(500).json({ success: false, message: 'Failed to update balance' }));

            dbUserInfo.execute(insertTransaction, [account_number, amount, `EMI payment for loan ${loan_id}`], (err) => {
              if (err) return dbUserInfo.rollback(() => res.status(500).json({ success: false, message: 'Failed to record transaction' }));

              const updateLoanStatus = 'UPDATE loans SET status = "approved" WHERE loan_id = ?';
              dbUserInfo.execute(updateLoanStatus, [loan_id], (err) => {
                if (err) return dbUserInfo.rollback(() => res.status(500).json({ success: false, message: 'Failed to update loan status' }));

                dbUserInfo.commit((err) => {
                  if (err) return dbUserInfo.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
                  res.status(200).json({ success: true, message: 'EMI payment successful, loan status updated' });
                });
              });
            });
          });
        });
      });
    });
  });
}



function submitCheque(req, res) {
  const { cheque_id, sender_accno, receiver_accno, amount } = req.body;
  const chequeImage = req.file ? `uploads/${req.file.filename}` : null;

  if (!cheque_id || !sender_accno || !receiver_accno || !amount || !chequeImage) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields or cheque image'
    });
  }

  const checkSenderQuery = 'SELECT Account_number FROM user_info WHERE Account_number = ?';
  dbUserInfo.execute(checkSenderQuery, [sender_accno], (err, result) => {
    if (err) {
      console.error("❌ Error checking sender:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Sender account not found' });
    }

    const insertChequeQuery = `
      INSERT INTO cheques (cheque_id, sender_accno, receiver_accno, amount, cheque_image, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    dbUserInfo.execute(
      insertChequeQuery,
      [cheque_id, sender_accno, receiver_accno, amount, chequeImage],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting cheque:", err);
          return res.status(500).json({ success: false, message: 'Failed to submit cheque' });
        }

        res.status(201).json({
          success: true,
          message: 'Cheque submitted successfully',
          cheque_id: cheque_id
        });
      }
    );
  });
}


// Admin Functions
function adminLogin(req, res) {
  const { admin_id, password } = req.body;
  const query = 'SELECT admin_password FROM admin_credentials WHERE admin_id = ?';
  dbCredentials.execute(query, [admin_id], (err, result) => {
    if (err) {
      console.error("❌ Admin login query error:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    if (password === result[0].admin_password) {
      res.status(200).json({ success: true, admin: { adminId: admin_id } });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  });
}

function getPendingCheques(req, res) {
  const query = `
    SELECT cheque_id, sender_accno, receiver_accno, amount, status, cheque_image
    FROM cheques
    WHERE status = 'pending'
    ORDER BY issued_at DESC
  `;
  dbUserInfo.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching pending cheques:", err);
      return res.status(500).json({ success: false, message: 'Failed to fetch pending cheques' });
    }
    res.status(200).json({ success: true, cheques: results });
  });
}


function approveCheque(req, res) {
  const { cheque_id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const getChequeQuery = 'SELECT * FROM cheques WHERE cheque_id = ?';
  dbUserInfo.query(getChequeQuery, [cheque_id], (err, chequeResults) => {
    if (err) {
      console.error('❌ Error fetching cheque:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (chequeResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Cheque not found' });
    }

    const cheque = chequeResults[0];

    // Update status
    const updateQuery = 'UPDATE cheques SET status = ? WHERE cheque_id = ?';
    dbUserInfo.query(updateQuery, [status, cheque_id], (err, updateResult) => {
      if (err) {
        console.error('❌ Error updating cheque status:', err);
        return res.status(500).json({ success: false, message: 'Failed to update cheque status' });
      }

      if (status === 'approved') {
        const { sender_accno, receiver_accno, amount } = cheque;

        const getSenderBalanceQuery = 'SELECT Balance FROM user_info WHERE Account_number = ?';
        dbUserInfo.query(getSenderBalanceQuery, [sender_accno], (err, senderResults) => {
          if (err) {
            console.error('❌ Error getting sender balance:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch sender balance' });
          }

          if (senderResults.length === 0 || senderResults[0].Balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
          }

          const newSenderBalance = senderResults[0].Balance - amount;

          const updateSender = 'UPDATE user_info SET Balance = ? WHERE Account_number = ?';
          const updateReceiver = 'UPDATE user_info SET Balance = Balance + ? WHERE Account_number = ?';
          const insertTransaction = `
  INSERT INTO transactions (account_number, type, amount, recipient_account, description, transaction_date)
  VALUES (?, ?, ?, ?, ?, NOW())
`;


          dbUserInfo.beginTransaction((err) => {
            if (err) {
              console.error('❌ Transaction start error:', err);
              return res.status(500).json({ success: false, message: 'Transaction error' });
            }

            dbUserInfo.query(updateSender, [newSenderBalance, sender_accno], (err) => {
              if (err) return rollback(err, 'Error updating sender balance');

              dbUserInfo.query(updateReceiver, [amount, receiver_accno], (err) => {
                if (err) return rollback(err, 'Error updating receiver balance');

                dbUserInfo.query(insertTransaction, [sender_accno, 'cheque', amount, receiver_accno, 'Cheque Payment'], (err) => {
                  if (err) return rollback(err, 'Error logging sender transaction');
                
                  dbUserInfo.query(insertTransaction, [receiver_accno, 'cheque', amount, sender_accno, 'Cheque Received'], (err) => {
                    if (err) return rollback(err, 'Error logging receiver transaction');
                
                    dbUserInfo.commit((err) => {
                      if (err) return rollback(err, 'Error committing transaction');
                      return res.status(200).json({ success: true, message: 'Cheque approved and funds transferred successfully' });
                    });
                  });
                });
                
              });
            });

            function rollback(error, message) {
              console.error(`❌ ${message}:`, error);
              dbUserInfo.rollback(() => {
                res.status(500).json({ success: false, message });
              });
            }
          });
        });

      } else {
        res.status(200).json({ success: true, message: 'Cheque rejected successfully' });
      }
    });
  });
}



function getUserById(req, res) {
  const { user_id } = req.params;
  const query = 'SELECT * FROM user_info WHERE Account_number = ?';
  dbUserInfo.execute(query, [user_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = result[0];
    res.status(200).json({
      success: true,
      user: {
        accountNo: user.Account_number,
        name: user.Name,
        age: user.Age,
        phoneNo: user.Phone_No,
        email: user.Email_ID,
        address: user.Address,
        balance: user.Balance,
      },
    });
  });
}

function updateUserInfo(req, res) {
  const { user_id } = req.params;
  const { name, age, phone_no, email_id, address, balance } = req.body;
  const updateQuery = `
    UPDATE user_info
    SET Name = ?, Age = ?, Phone_No = ?, Email_ID = ?, Address = ?, Balance = ?
    WHERE Account_number = ?
  `;
  dbUserInfo.execute(
    updateQuery,
    [name || 'Unknown', age || 0, phone_no || '', email_id || '', address || '', balance || 0, user_id],
    (err, result) => {
      if (err) {
        console.error("❌ Error updating user:", err);
        return res.status(500).json({ success: false, message: 'Failed to update user' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, message: 'User updated successfully' });
    }
  );
}


function getLoanByUserId(req, res) {
  const { user_id } = req.params;
  const query = `
    SELECT loan_id, amount, interest_rate, status, created_at
    FROM loans
    WHERE account_number = ?
    ORDER BY created_at DESC
  `;
  dbUserInfo.execute(query, [user_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching loans:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.status(200).json({ success: true, loans: results });
  });
}

module.exports = {
  userLogin,
  userSignup,
  getAccountDetails,
  transferMoney,
  getTransactionHistory,
  getLoanInfo,
  payEMI,
  submitCheque,
  adminLogin,
  getPendingCheques,
  approveCheque,
  getUserById,
  updateUserInfo,
  getLoanByUserId,
};



