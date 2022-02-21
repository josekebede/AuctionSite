const express = require('express')
const app = express();
const fs = require("fs");
const path = require("path")
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer();
require("dotenv").config();

const Bid = require("./schemas/bids");
const User = require("./schemas/users")
const Admin = require("./schemas/admins")
const Category = require("./schemas/categories")
const Item = require("./schemas/items");
const port = process.env.port | 5000;
const Utility = require("./helpers");
const Auction = require("./schemas/auctions");
const Notification = require("./schemas/notification")


let auctions = [];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

mongoose
  .connect("mongodb://127.0.0.1:27017/auction-website", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => { console.log("Success "); await trackAuction() })
  .catch(() => { console.log("Failure "); });


app.get("/", (req, res) => {
  res.send("WORKS")
})
app.options('*', function (req, res) { res.sendStatus(200); });
app.use("/auth", require("./auth"));
app.use("/fetch", Utility.verifyToken, require("./fetch"));
app.use("/auction", Utility.verifyToken, require("./auction"));
app.use("/verify", Utility.verifyToken, require("./verify"))

async function trackAuction() {
  setInterval(async () => {
    await checkAuctionEnd()
  }, 1000);
}

async function fetchAuctions() {
  const auctionsResult = (await Auction.find({}, { _id: 1, startDate: 1, endDate: 1 }))
  auctions = [];
  auctionsResult.forEach(auction => {
    let startDate = new Date(auction.startDate)
    let endDate = new Date(auction.endDate)
    let now = Date.now();
    if (startDate.getTime() <= now && endDate.getTime() >= now) {
      let auc = {
        id: auction._id.valueOf(),
        endDate: auction.endDate
      }
      auctions.push(auc)
    }
  });
}

async function checkAuctionEnd() {
  if (auctions.length == 0) {
    await fetchAuctions();
  }

  for (let i = 0; i < auctions.length; i++) {
    let endDate = new Date(auctions[i].endDate);
    let diff = endDate.getTime() - Date.now();
    console.log(diff)
    if (diff < 0) {
      await calculateHighestBidder(auctions[i].id)
    }
  }
}

async function calculateHighestBidder(auctionID) {

  let auctionResult = (await Auction.findById(auctionID))
  let userIDs = [];
  const bidResult = (await Bid.find({ auctionID: auctionID, pending: false, verified: true }));

  specialItems = [];

  auctionResult.items.forEach((item, index) => { // Iterates through the auction items
    let highestBid = [{
      userID: undefined,
      amount: 0
    }];
    bidResult.forEach(bid => { // Finds every bid for item
      if (bid.itemCode == item.itemCode && !bid.pending) {
        if (isBigger(bid.amount, highestBid)) { // If bid is larger than hightBid, it becomes highestBid;
          let hb = {};
          hb.amount = bid.amount;
          hb.userID = bid.userID;

          highestBid = [];
          highestBid.push(hb)
        } else if (isEqual(bid.amount, highestBid)) {
          let hb = {};
          hb.amount = bid.amount;
          hb.userID = bid.userID;

          highestBid.push(hb)
        }
      }
    })

    console.log(highestBid)
    if (highestBid.length == 1) {
      auctionResult.items[index].highestBid = highestBid[0].amount; // Saves Highest bid
      auctionResult.items[index].userID = highestBid[0].userID; // Saves user
      if (highestBid[0].userID)
        userIDs.push({ userID: highestBid[0].userID, itemCode: auctionResult.items[index].itemCode })
    } else if (highestBid.length > 1) {
      specialItems.push({
        itemCode: auctionResult.items[index].itemCode,
        highestBid: highestBid
      })
    }
  });

  if (specialItems.length) {
    await equalWinners(specialItems)
  }
  await auctionResult.save();
  await fetchAuctions();
  for (let i = 0; i < userIDs.length; i++) {
    const itemResult = await Item.findOne({ code: userIDs[i].itemCode })
    await notifySlip(`You have won an item (${itemResult.title}) with code ${userIDs[i].itemCode}. Please contact your administartor`, "WIN", userIDs[i].userID)
  }
}

async function equalWinners(specialItems) {
  for (let i = 0; i < specialItems.length; i++) {
    let itemRes = await Item.findOne({ code: specialItems[i].itemCode });
    itemRes.initialBid = specialItems[i].highestBid[0].amount;
    await itemRes.save();

    let participants = specialItems[i].highestBid.map(bid => { return { userID: bid.userID } });
    let items = [];
    items.push({ itemCode: specialItems[i].itemCode })
    let now = new Date();
    let days = 10;
    let finalDate = new Date((now.getTime() + (86400000 * days))) // 1 day is 86400000 ms. 10 days is
    let newAuction = new Auction({
      special: true,
      startDate: now,
      endDate: finalDate,
      items: items,
      specialParticipants: participants
    })

    await newAuction.save();
    for (let j = 0; j < participants.length; j++) {
      await notifySlip(`You have been invited to bid again. Please check out your special bids page.\n\nRemember you only need to pay the difference between the 10% of your new bid and the amount you paid before.`, 'NEW', participants[j].userID)
    }
  }


  // }
  // const auction = await Auction.findById(auctionID);
  // let items = auction.items;
  // items = items.map(item => item.itemCode);

  // const itemsResult = await Item.find({$in: items});


  // let specialParticipants = highestBids.map(bid => bid.userID)
  // let now = new Date();
  // now.setHours(23, 59, 59);
  // let days = 10;
  // let finalDate = new Date((now.getTime() + (86400000 * days))) // 1 day is 86400000 ms. 10 days is
  // let newAuction = new Auction({
  //   startDate: now,
  //   endDate: finalDate,
  //   special: true,
  //   specialParticipants: specialParticipants,
  //   items: items
  // })
}

function isBigger(currentBid, bidArray) {
  let isBigger = false;
  for (let i = 0; i < bidArray.length && !isBigger; i++) {
    if (currentBid > bidArray[i].amount) {
      isBigger = true;
    }
  }

  return isBigger;
}

function isEqual(currentBid, bidArray) {
  let isEqual = false;
  for (let i = 0; i < bidArray.length && !isEqual; i++) {
    if (bidArray[i].amount == currentBid)
      isEqual = true;
  }
  return isEqual;
}
async function notifySlip(message, type, userID) {
  let notification = new Notification({
    message: message,
    type: type,
    userID: userID
  })

  await notification.save();
}

app.get("/auctionCategories", verifyToken, (req, res) => {
  Category.find().then(
    (document) => {
      var categories = document.map(doc => doc.name) // Gets only the name from the list of documents
      res.status(200).send(categories)
    }
  )
})

// Adds a category
app.post("/addCategories", verifyToken, async (req, res) => {
  const name = req.body.name;
  if (name) {
    if (checkIfAdmin(req.email)) {
      const category = new Category({ name: name });
      try {
        await category.save();
      } catch (error) {
        return res.status(400).json(error)
      }
      res.status(201).json({ message: "Category Created" })
    }
  } else {
    return res.status(400).json({ message: "Category name is required" })
  }
})

app.post("/addAdmin", verifyToken, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (firstName == undefined || lastName == undefined ||
    email == undefined || !isEmail(email) || password == undefined || password.length < 8) {

    return res.status(400).json({ message: "Invalid Information Provided" })
  } else {

    if (checkIfAdmin(req.email)) {
      const admin = new Admin({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
      })
      try {
        await admin.save();
      } catch (error) {
        return res.status(400).json(error);
      }
      return res.status(200).json({ message: "Admin Added" })
    }
    return res.status(400).json({ message: "Unauthorized. Only admins can add other admins" })
  }
})


// ---------------------------------------------- //
//              Getting Items
// ---------------------------------------------- //

app.post("/fetchItems", verifyToken, async (req, res) => {
  const { type } = req.body;
  if (!type)
    return res.status(400).json({ message: "No Type Provided" });

  const itemResult = await Item.find({ type: { $eq: type } }, { _id: 0 });
  res.status(200).json(itemResult)

})

app.get("/furniture", async (req, res) => {
  const pending = req.body.pending;
  let furniture;
  furniture = await Item.find({ type: { $eq: "Furniture" } }, { _id: 0 });
  res.status(200).json(furniture)
})



// TODO: Add password change middleware. Should handle both user and admin based on the type




// ---------------------------------------------- //
//              Adding Items
// ---------------------------------------------- //

app.post("/addItem", verifyToken, upload.single("picture"), async (req, res) => {

  // Gets all the admins from the database
  let adminEmails = await Admin.find({}, { _id: 0, email: 1 });
  adminEmails = adminEmails.map(email => email.email);

  // Checks if the requester is an admin
  if (!adminEmails.includes(req.email)) {
    return res.status(403).json({ message: "Only Admins allowed" })
  }

  // Gets the necessary items from the request body
  const { title, type, initialBid } = req.body;
  let itemPicture = req.file;
  // If any of the required items are not listed or if they are of not correct format, it is an error
  if (!itemPicture || !title || !type || !initialBid || !isString(title) || !isType(type) || !isNumber(initialBid))
    return res.status(400).json({ message: "INVALID INPUT" })
  let error;
  let maxErrorCounter = 0;
  let savedItem;
  let code;
  // This loop is there in the case of the loop creates a duplicate code
  do {
    error = false;
    code = getRandom8Char(); // Gets a random 8 character code
    let item = new Item({
      title: title,
      type: type,
      code: code,
      initialBid: initialBid,
    }) // Creates a new document
    try {
      savedItem = await item.save(); // Tries to save the new document
    } catch (err) {
      maxErrorCounter++; // It increases the error counter
      error = err;

      if (maxErrorCounter > 20) { // Just in case it gets in an infinite loop
        maxErrorCounter = 0;
        return res.status(400).message({ error: err })
      }
    }
  } while (error); // Loops as long as there is an error
  let picturePath;
  let extension = path.extname(itemPicture.originalname); // Extension of the file

  // Chooses the correct path based on the type
  if (type == "Furniture")
    picturePath = path.join(__dirname, "images", "furniture", code + extension);

  else if (type == "Office Equipment")
    picturePath = path.join(__dirname, "images", "office", code + extension);

  else if (type == "Stock Items")
    picturePath = path.join(__dirname, "images", "stock", code + extension);

  else
    picturePath = path.join(__dirname, "images", "vehicle", code + extension);
  // Saves the file
  fs.writeFile(picturePath, itemPicture.buffer, "binary", (err) => {
    if (error)
      return res.status(500).json({ error: error })
    return res.status(200).json({ message: "SUCCESS" })
  })
})

// ------------ END ADDING ITEMS ---------------- //





/**
 *
 *
 *
 *
 * UTILITY FUNCTIONS
 *
 *
 *
 *
 */

// Generates a token
function generateToken(email) {
  const payload = {
    email: email
  }
  return jwt.sign(payload, process.env.JWT_TOKEN)
}

// Generates 8 random character (from A - Z)
function getRandom8Char() {
  let characters = [];
  for (let i = 0; i < 8; i++) {
    characters.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
  }
  return characters.join("")
}

// Verifies a token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ message: "NO TOKEN" })

  jwt.verify(token, process.env.JWT_TOKEN, (err, payload) => {
    if (err) return res.status(403).json({ message: "INVALID TOKEN" });
    req.email = payload.email;
    next();
  })
}

// Checks if it is an email
function isEmail(email) {
  let emailArray = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  return (emailArray != undefined ? true : false)
}

// Check if email is admin
async function checkIfAdmin(email) {
  let returnValues = null;
  let adminList;
  try {
    adminList = await Admin.find({ email: { $eq: email } });
  } catch (error) {
    return false;
  }
  if (adminList.length > 0)
    return true;
  else
    return false;
}
function isString(input) {
  return (typeof input) == "string"
}

function isNumber(input) {
  return (typeof input) == "number"
}

function isType(type) {
  const types = ["Furniture", "Vehicle", "Office Equipment", "Stock Items"];
  return types.includes(type);
}


app.listen(port, console.log(`Listening on port ${port}`));
