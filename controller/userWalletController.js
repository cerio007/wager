const userWallet = require(`../models/userWallet`);

// Get All Wallets
const getUserWallets = async (req, res) => {
  try {
    const wallets = await userWallet.find({});
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get A Wallet
const getUserWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await userWallet.findById(id);
    if (!wallet) {
      return res.status(404).json({ message: `wallet not found` });
    }
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create A Wallet
const createUserWallet = async (req, res) => {
  try {
    const { username } = req.body;
    let userBalance = 10000;
    const userId = req.user.id;
    const userUsername = req.user.username;
    const wallets = await userWallet.find({});
    const usernameExist = wallets.find((user) => user.username == username);
    if (username != userUsername) {
      return res.status(404).json({ message: `Wrong user` });
    } else if (usernameExist) {
      return res
        .status(404)
        .json({ message: `Wallet with ${username} already created` });
    } else if (username == userUsername && !usernameExist) {
      await userWallet.create({
        userId: userId,
        username,
        balance: userBalance,
      });
      return res.status(200).json({
        message: `Wallet created successfully`,
      });
    } else {
      return res.status(404).json({ message: `Error creating wallet` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create A Company Wallet
const createCompanyWallet = async (req, res) => {
  try {
    const { username } = req.body;
    let companyBalance = 1000000000;
    const userId = req.user.id;
    const userUsername = req.user.username;
    const wallets = await userWallet.find({});
    const usernameExist = wallets.find((user) => user.username == username);
    if (username != userUsername) {
      return res.status(404).json({ message: `Wrong user` });
    } else if (usernameExist) {
      return res
        .status(404)
        .json({ message: `Wallet with ${username} already created` });
    } else if (username == userUsername && !usernameExist) {
      await userWallet.create({
        userId: userId,
        username,
        balance: companyBalance,
      });
      return res.status(200).json({
        message: `Wallet created successfully`,
      });
    } else {
      return res.status(404).json({ message: `Error creating wallet` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const creditWallet = async (req, res) => {
  try {
    const { amount, username } = req.body;
    const userId = req.user.id;
    if (userId) {
      if (!amount) {
        return res.status(404).json({ message: `Wallet crediting failed` });
      }
      const wallet = await userWallet.findOne({ username });
      wallet.balance += amount;
      await wallet.save();
      res
        .status(200)
        .json({ message: `wallet credited with ${amount} to ${username}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const debitWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    if (userId) {
      if (!amount) {
        return res.status(404).json({ message: `Wallet crediting failed` });
      }
      const wallet = await userWallet.findOne({ userId });
      wallet.balance += amount;
      await wallet.save();
      res.status(200).json({ message: `wallet credited with ${amount}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserWallets,
  getUserWallet,
  createUserWallet,
  createCompanyWallet,
  creditWallet,
  debitWallet,
};
