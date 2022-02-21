const mongoose = require("mongoose")

const itemSchema = mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  initialBid: { type: Number, required: true },
  auctionID: { type: String, required: true }
})

module.exports = mongoose.model("Item", itemSchema);
