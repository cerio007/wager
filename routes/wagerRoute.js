const express = require(`express`);
const router = express.Router();
const verifyToken = require(`../middleware/authMiddleware.js`);
const authorizeRoles = require(`../middleware/roleMiddleware.js`);
const {
  getWagers,
  getWager,
  createWager,
  confirmWager,
  gradeWager,
  getWagerTransaction,
  getWagerTxs,
  getWagersByUser,
  getWagerByUser,
  // updateWagerTransaction,
  updateWager,
  // deleteWager,
} = require(`../controller/wagerController.js`);

// Get All Wager Transactions
router.get(`/txs`, getWagerTxs);

// Get A Wager Transaction
router.get(`/tx/:id`, getWagerTransaction);

// Get All Wagers
router.get(`/`, getWagers);

// Get A Wager
router.get(`/:id`, getWager);

// Create A Wager
router.post(`/`, verifyToken, createWager);

// Confirm A Wager
router.put(`/confirm/:id`, verifyToken, confirmWager);

// Grade A Wager
router.put(`/grade/:id`, verifyToken, authorizeRoles(`admin`), gradeWager);

// Get All Wagers By User
router.get(`/user`, verifyToken, getWagersByUser);

// Get A Wager By User
router.get(`/user/:id`, verifyToken, getWagerByUser);

// Get All Wager Transactions By User
router.get(`/txs/user`, verifyToken, getWagersByUser);

// Get A Wager Transaction By User
router.get(`/txs/user/:id`, verifyToken, getWagerByUser);

// // Update A Wager Transaction
// router.put(`/tx/:id`, verifyToken, updateWagerTransaction);

// Update A Wager
router.put(`/update/:id`, verifyToken, updateWager);

// // Delete A Wager
// router.delete(`/:id`, verifyToken, deleteWager);

module.exports = router;
