const express = require(`express`);
const router = express.Router();
const verifyToken = require(`../middleware/authMiddleware.js`);
const authorizeRoles = require(`../middleware/roleMiddleware.js`);
const {
  getCompanyWallets,
  getCompanyWallet,
  createCompanyWallet,
  creditWallet,
  debitWallet,
} = require(`../controller/companyWalletController.js`);

// Get Company Wallets
router.get(`/`, getCompanyWallets);

// Get Company Wallet
router.get(`/:id`, getCompanyWallet);

// Create Company Wallet
router.post(`/`, verifyToken, authorizeRoles(`admin`), createCompanyWallet);

// Credit Company Wallet
router.post(`/`, verifyToken, creditWallet);

// Debit Company Wallet
router.post(`/`, verifyToken, debitWallet);

module.exports = router;
