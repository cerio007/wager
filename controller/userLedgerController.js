const userLedger = require(`../models/userLedger`);
const companyWallet = require(`../models/companyWallet`);

// Create A Wager
const createLedger = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    await userLedger.create({
      userId: userId,
      username: username,
      oldBalance,
      newBalance,
    });
  } catch (error) {
    return res.status(500).json({ message: `Error creating ledger` });
  }
};

module.exports = {
  createLedger,
};
