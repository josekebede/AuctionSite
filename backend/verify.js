const router = require("express").Router();
const User = require("./schemas/users");
const Utility = require("./helpers");
const Bid = require("./schemas/bids");
const Notification = require("./schemas/notification")
const Item = require("./schemas/items")
const path = require("path")
const fs = require("fs").promises;

router.post("/user", async (req, res) => {

  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  const { userID } = req.body;
  try {
    let usersRes = await User.findById(userID);
    usersRes.verified = true;
    usersRes.save();
  } catch (error) {
    console.log("Error verifying user");
    return res.status(400).json(error)
  }

  res.status(200).json(userID)
});

router.post("/userReject", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  const { userID } = req.body;
  try {
    let usersRes = await User.findById(userID);
    usersRes.verified = null;
    usersRes.save();
  } catch (error) {
    console.log("Error verifying user");
    return res.status(400).json(error)
  }

  res.status(200).json(userID)
})

router.post("/slipAccept", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN");

  const { bidID } = req.body;
  try {
    let bidResult = await Bid.findById(bidID);
    let itemResult = await Item.findOne({ code: bidResult.itemCode });
    bidResult.verified = true;
    bidResult.save();
    await notifySlip(`Your bid for item (${itemResult.title}) with code ${bidResult.itemCode} has been accepted`, "ACCEPT", bidResult.userID);
  } catch (error) {
    console.log("Error Verifying Bid")
    console.log(error)
    return res.status(400).json(error)
  }
  return res.status(200).json(bidID)
});

router.post("/slipReject", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN");

  const { bidID } = req.body;
  try {
    let bidResult = await Bid.findById(bidID);
    let itemResult = await Item.findOne({ code: bidResult.itemCode });
    bidResult.verified = false;
    bidResult.pending = true;
    await notifySlip(`Your bid for an item (${itemResult.title}) with code ${bidResult.itemCode} has been rejected. Please resubmit another bank slip picture`, "REJECT", bidResult.userID)
    await deleteSlipPicture(bidID);
    bidResult.save();
  } catch (error) {
    console.log(error);
    return res.status(400).json(error)
  }
  return res.status(200).json(bidID)
});

router.get("/seen", async (req, res) => {
  const email = req.email;
  const userRes = await User.findOne({ email: email });
  if (!userRes)
    return res.status(400).json("User not found");

  await Notification.updateMany({ userID: userRes._id.valueOf() }, { $set: { seen: true } })
  return res.status(200).json(true)
})
async function deleteSlipPicture(slipID) {
  const folderPath = path.join(__dirname, "images", "proofs");
  let dir = await fs.readdir(folderPath);
  for (let i = 0; i < dir.length; i++) {
    if (dir[i].includes(slipID)) {
      await fs.rm(path.join(folderPath, dir[i]))
    }
  }
}

async function notifySlip(message, type, userID) {
  let notification = new Notification({
    message: message,
    type: type,
    userID: userID
  })

  await notification.save();
}
module.exports = router;
