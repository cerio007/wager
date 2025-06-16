const mongoose = require(`mongoose`);

const WagerTransactionSchema = new mongoose.Schema(
  {
    wagerId: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    wagererPosition: { type: Boolean, required: true },
    takerPosition: { type: Boolean, required: true },
    stake: { type: Number, required: true },
    wagererId: { type: String },
    wagerer: { type: String },
    takerId: { type: Array },
    taker: { type: String },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: [`pending`, `accepted`, `rejected`, `settled`],
      default: `pending`,
    },
    outcome: {
      type: String,
      enum: [`won`, `draw`, `lost`],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`WagerTransaction`, WagerTransactionSchema);
