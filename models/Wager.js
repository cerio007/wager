const mongoose = require(`mongoose`);

const WagerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    wagerPosition: { type: Boolean, required: true },
    stake: { type: Number, required: true },
    wagererId: { type: String },
    wagerer: { type: String },
    invites: { type: Array, required: true },
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

module.exports = mongoose.model(`Wager`, WagerSchema);
