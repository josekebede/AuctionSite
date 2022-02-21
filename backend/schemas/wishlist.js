const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
  userID: { type: String, required: true },
  itemCode: { type: String, required: true }
})

module.exports = mongoose.model("Wishlist", wishlistSchema);
