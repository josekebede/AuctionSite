const mongoose = require("mongoose")

const notificationSchema = mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, required: true },
  userID: { type: String, required: true },
  date: { type: Date, default: Date.now() },
  seen: { type: Boolean, default: false }
})

module.exports = mongoose.model("Notification", notificationSchema);
