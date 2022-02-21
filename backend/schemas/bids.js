const mongoose = require("mongoose")

const bidsSchema = mongoose.Schema({
  auctionID: { type: String, required: true },
  itemCode: { type: String, required: true },
  userID: { type: String, require: true },
  amount: { type: Number, required: true },
  pending: { type: Boolean, default: true },
  verified: { type: Boolean, default: false }
})

module.exports = mongoose.model("Bid", bidsSchema);
