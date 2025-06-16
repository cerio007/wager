const mongoose = require(`mongoose`);

const UserWalletSchema = new mongoose.Schema(
  {
    userId: { type: String },
    username: { type: String },
    balance: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Wallet`, UserWalletSchema);
