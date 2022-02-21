const mongoose = require("mongoose")

const item = mongoose.Schema({
  itemCode: { type: String, required: true },
  highestBid: { type: Number },
  userID: { type: String }
}, { _id: false });

const auctionSchema = mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  special: { type: Boolean, default: false },
  specialParticipants: [{ userID: { type: String } }],
  items: [item]
})

module.exports = mongoose.model("Auction", auctionSchema);
