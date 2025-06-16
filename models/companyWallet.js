const mongoose = require(`mongoose`);

const CompanyWalletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    balance: { type: Number },
    role: { type: String, enum: [`admin`] },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`CompanyWallet`, CompanyWalletSchema);
