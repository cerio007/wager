const mongoose = require(`mongoose`);

const UserLedgerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    oldBalance: { type: Number },
    newBalance: { type: Number },
    role: { type: String, enum: [`user`] },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`UserLedger`, UserLedgerSchema);
