const mongoose = require(`mongoose`);

const CompanyLedgerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String },
    oldBalance: { type: Number },
    newBalance: { type: Number },
    role: { type: String, enum: [`admin`] },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`CompanyLedger`, CompanyLedgerSchema);
