const companyWallet = require(`../models/companyWallet`);
const User = require(`../models/User`);

// Get All Company Wallets
const getCompanyWallets = async (req, res) => {
  try {
    const wallets = await companyWallet.find({});
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get A Company Wallet
const getCompanyWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await companyWallet.findById(id);
    if (!wallet) {
      return res.status(404).json({ message: `wallet not found` });
    }
    res.status(200).json(wallet);
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
    const wallet = await companyWallet.find({});
    const userIdExist = wallet.find((user) => user.userId == userId);
    if (username != userUsername) {
      return res.status(404).json({ message: `Wrong user` });
    } else if (userIdExist) {
      return res.status(404).json({ message: `Wallet already created` });
    } else if (username == userUsername && !usernameExist) {
      await companyWallet.create({
        userId: userId,
        username,
        balance: companyBalance,
      });
      return res.status(200).json({
        message: `Company wallet created successfully`,
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
    const { amount } = req.body;
    const userId = req.user.id;
    if (userId) {
      if (!amount) {
        return res.status(404).json({ message: `Wallet crediting failed` });
      }
      const wallet = await companyWallet.findOne({ userId });
      wallet.balance += amount;
      await wallet.save();
      res.status(200).json({ message: `wallet credited with ${amount}` });
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
      const wallet = await companyWallet.findOne({ userId });
      wallet.balance += amount;
      await wallet.save();
      res.status(200).json({ message: `wallet credited with ${amount}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanyWallets,
  getCompanyWallet,
  createCompanyWallet,
  creditWallet,
  debitWallet,
};
