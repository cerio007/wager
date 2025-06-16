const express = require(`express`);
const router = express.Router();
const verifyToken = require(`../middleware/authMiddleware.js`);
const authorizeRoles = require(`../middleware/roleMiddleware.js`);
const {
  getUserWallets,
  getUserWallet,
  createUserWallet,
  creditWallet,
  debitWallet,
} = require(`../controller/userWalletController.js`);

// Get All Users Wallets
router.get(`/`, getUserWallets);

// Get A User Wallet
router.get(`/:id`, getUserWallet);

// Create A User Wallet
router.post(`/`, verifyToken, createUserWallet);

// Credit A User Wallet
router.post(`/credit`, verifyToken, authorizeRoles(`admin`), creditWallet);

// Debit A User Wallet
router.post(`/debit`, verifyToken, debitWallet);

module.exports = router;
