const express = require(`express`);
// const verifyToken = require(`../middlewares/authMiddleware`);
const router = express.Router();
// const authorizeRoles = require(`../middlewares/roleMiddleware.js`);
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require(`../controller/userController`);

// Get All Users
router.get(`/`, getUsers);

// Get A User
router.get(`/:id`, getUser);

// Update A User
router.put(`/:id`, updateUser);

// Delete A User
router.delete(`/:id`, deleteUser);

module.exports = router;
