const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const {
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
  getLoanByUserId
} = require('./Functions');

const app = express();
const port = 3001;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cheque-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// User Routes
app.post('/user/login', userLogin);
app.post('/user/signup', userSignup);
app.get('/user/account/:account_number', getAccountDetails);
app.post('/user/transfer', transferMoney);
app.get('/user/transactions/:account_number', getTransactionHistory);
app.get('/user/loans/:account_number', getLoanInfo);
app.post('/user/emi/:loan_id', payEMI);
app.post('/submit-cheque', upload.single('chequeImage'), submitCheque);

// Admin Routes
app.post('/admin/login', adminLogin);
app.get('/admin/cheques/pending', getPendingCheques);
app.post('/admin/cheques/approve/:cheque_id', approveCheque);
app.get('/admin/users/:user_id', getUserById);
app.put('/admin/users/:user_id', updateUserInfo);
app.get('/admin/loans/:user_id', getLoanByUserId);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
