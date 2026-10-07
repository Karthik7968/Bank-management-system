-- Create Databases
CREATE DATABASE IF NOT EXISTS personal_information;
CREATE DATABASE IF NOT EXISTS user_credentials;

-- Create Tables in personal_information
USE personal_information;

-- User Information and Account Details
CREATE TABLE user_info (
    Account_number BIGINT PRIMARY KEY,
    Name VARCHAR(100) DEFAULT 'Unknown',
    Age INT DEFAULT 0,
    Phone_No VARCHAR(20) DEFAULT '',
    Email_ID VARCHAR(255) DEFAULT '',
    Address VARCHAR(500) DEFAULT '',
    Balance INT DEFAULT 0
);

-- Transactions (for transfers, EMI payments, and cheques)
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number BIGINT NOT NULL,
    type ENUM('transfer', 'emi_payment', 'cheque') NOT NULL,
    amount INT NOT NULL,
    recipient_account BIGINT DEFAULT NULL,
    description VARCHAR(255) DEFAULT '',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES user_info(Account_number),
    FOREIGN KEY (recipient_account) REFERENCES user_info(Account_number)
);

-- Loans
CREATE TABLE loans (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number BIGINT NOT NULL,
    amount INT NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'approved', 'repaid', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES user_info(Account_number)
);

-- Cheques
CREATE TABLE  cheques (
  cheque_id VARCHAR(50) PRIMARY KEY,
  sender_accno VARCHAR(50) NOT NULL,
  receiver_accno VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  cheque_image VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create Tables in user_credentials
USE user_credentials;

-- User Credentials
CREATE TABLE user_credentials (
    account_number BIGINT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (account_number) REFERENCES personal_information.user_info(Account_number)
);

-- Admin Credentials
CREATE TABLE admin_credentials (
    admin_id VARCHAR(50) PRIMARY KEY,
    admin_password VARCHAR(255) NOT NULL
);
