const router = require("express").Router();
const User = require("./schemas/users");
const Item = require("./schemas/items");
const Category = require("./schemas/categories")
const Utility = require("./helpers");
const Auction = require("./schemas/auctions");
const Wishlist = require("./schemas/wishlist");
const Notification = require("./schemas/notification")
const Bid = require("./schemas/bids");
const fs = require("fs").promises;
const path = require("path")


router.get("/categories", async (req, res) => {
  let categoriesResult;
  try {
    categoriesResult = await Category.find();
  } catch (error) {
    console.log("CATEGORY ERROR");
    return res.status(400).json({ message: error })
  }

  let names = categoriesResult.map(category => category.name);
  res.status(200).json(names);
})

router.get("/items", async (req, res) => {

  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  let itemsResult;
  try {
    itemsResult = await Item.find({}, { _id: 0, __v: 0 });
  } catch (error) {
    console.log("ITEM ERROR");
    return res.status(400).json({ message: error })
  }

  res.status(200).json(itemsResult)
})

router.get("/auctionsAll", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  let auctionResults;
  try {
    auctionResults = await Auction.find({}, { __v: 0 });
  } catch (error) {
    console.log("AUCTION ERROR");
    return res.status(400).json({ message: error })
  }

  let auctionList = [];
  for (let i = 0; i < auctionResults.length; i++) {
    let items;
    try {
      items = await getItemsOfAuction(auctionResults[i].items)
    } catch (error) {
      console.log("AUCTION ITEMS ERROR");
      return res.status(400).json({ message: error })
    }

    let finalItems = [];
    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      // console.log(item)
      let picture = await getImage(item.code);
      // let editableItem = item.toObject();
      item.picture = picture;
      finalItems.push(item);
    };

    let aggregatedInformation = {
      id: auctionResults[i]._id.valueOf(),
      special: auctionResults[i].special,
      startDate: auctionResults[i].startDate,
      endDate: auctionResults[i].endDate,
      items: finalItems
    }
    // console.log(aggregatedInformation)
    auctionList.push(aggregatedInformation);
  }

  res.status(200).json(auctionList)



})

router.get("/auctionsLive", async (req, res) => {
  let userResult = (await User.findOne({ email: req.email }));
  let userID = userResult._id.valueOf();

  let bidResult = (await Bid.find({ userID: userID }));
  let alreadyBidItems = bidResult.map(bid => bid.itemCode);

  let wishlistResult = await Wishlist.find({ userID: userID });
  let wishlistItems = wishlistResult.map(wish => wish.itemCode);

  let auctionResults;
  try {
    auctionResults = await getLiveAuctions();
  } catch (error) {
    console.log("AUCTION ERROR");
    return res.status(400).json({ message: error })
  }

  let categoriesResult;
  try {
    categoriesResult = await Category.find();
  } catch (error) {
    console.log("CATEGORY ERROR");
    return res.status(400).json({ message: error })
  }
  let categories = categoriesResult.map(category => category.name);



  let auctionList = [];
  for (let i = 0; i < auctionResults.length; i++) {

    let startDate = new Date(auctionResults[i].startDate);
    let endDate = new Date(auctionResults[i].endDate);

    let cats = {};
    categories.forEach(category => {
      cats[category] = []
    });

    let itemsResult;
    try {
      itemsResult = await getItemsOfAuction(auctionResults[i].items)
    } catch (error) {
      console.log("AUCTION ITEMS ERROR");
      return res.status(400).json({ message: error })
    }

    for (let j = 0; j < itemsResult.length; j++) {
      let code = itemsResult[j].code;
      if (!alreadyBidItems.includes(code)) {
        let image = await getImage(code);

        let convertedObj = itemsResult[j];
        convertedObj.picture = image;

        if (wishlistItems.includes(code))
          convertedObj.wishlist = true;
        else
          convertedObj.wishlist = false;
        cats[itemsResult[j].type].push(convertedObj)
      }
    }
    let aggregatedInformation = {
      startDate: startDate,
      endDate: endDate,
      categories: cats
    }
    auctionList.push(aggregatedInformation);
  }
  res.status(200).json(auctionList)
});


router.get("/auctionDates", async (req, res) => {
  let auctionResults;
  try {
    auctionResults = await Auction.find({ special: false }, { _id: 1, startDate: 1, endDate: 1 });
  } catch (error) {
    console.log("ERROR FETCHING AUCTIONS")
    return res.status(400).json(error)
  }
  let now = Date.now();
  let filteredResults = auctionResults.filter(auction => {
    let startDate = new Date(auction.startDate);
    let endDate = new Date(auction.endDate);
    if (startDate.getTime() > now && endDate.getTime() > now)
      return auction
  })
  res.status(200).json(filteredResults)
})

router.get("/bids", async (req, res) => {
  let userResult;
  let userID;
  try {
    userResult = (await User.findOne({ email: req.email }));
    userID = userResult._id.valueOf();
  } catch (error) {
    console.log("ERROR FETCHING USERS");
    return res.status(400).json(error);
  }

  let bidsResult;
  try {
    bidsResult = (await Bid.find({ userID: userID, pending: true }, { __v: 0 }));
  } catch (error) {
    console.log("ERROR FETCHING BIDS");
    return res.status(400).json(error);
  }

  let finalArray = [];
  for (let i = 0; i < bidsResult.length; i++) {
    let itemResult = (await Item.findOne({ code: bidsResult[i].itemCode }));
    let auctionResult = (await Auction.findById(bidsResult[i].auctionID));
    let picture = await getImage(itemResult.code);

    let data = {
      auctionID: bidsResult[i].auctionID,
      itemCode: bidsResult[i].itemCode,
      userID: bidsResult[i].userID,
      amount: bidsResult[i].amount,
      pending: bidsResult[i].pending,
      title: itemResult.title,
      type: itemResult.type,
      image: picture,
      auctionEnd: auctionResult.endDate,
      bidID: bidsResult[i]._id.valueOf()
    }
    finalArray.push(data)
  }
  return res.status(200).json(finalArray);
})

router.get("/wishlist", async (req, res) => {
  const { email } = req;
  // Gets user info
  let userResult = await User.findOne({ email: email });
  // Gets all live auctions
  let liveAuctions = await getLiveAuctions();
  // Gets auction item codes
  if (!liveAuctions.length)
    return res.status(200).json()
  let auctionItemCodes = (liveAuctions[0].items).map(item => item.itemCode);

  // Gets all bids from that user and auction
  let bidsResult = await Bid.find({ userID: userResult._id.valueOf(), auctionID: liveAuctions[0]._id.valueOf() })
  // Maps the bids item codes
  let bidItemCodes = bidsResult.map(bid => bid.itemCode);

  // Selects all wishlists that are in auciton item lists but not in bids item list
  let wishlistResult = await Wishlist.find({ itemCode: { $in: auctionItemCodes, $nin: bidItemCodes }, userID: userResult._id.valueOf() });
  // Maps the wishlist item codes
  let wishlistItemCodes = wishlistResult.map(wish => wish.itemCode);

  // If the wishlist is empty, it returns empty
  if (!wishlistItemCodes.length)
    return res.status(200).json();
  // Finds all item information of wishlist items list
  let itemsResult = await Item.find({ code: { $in: wishlistItemCodes } });

  // Parses information and sends it to user
  let finalItemList = [];
  for (let i = 0; i < itemsResult.length; i++) {
    let picture = await getImage(itemsResult[i].code);
    let convertedObj = itemsResult[i].toObject();
    convertedObj.picture = picture;

    finalItemList.push(convertedObj)
  }
  return res.status(200).json({ items: finalItemList, endDate: liveAuctions[0].endDate })
  // let
})

router.get("/usersList", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN");
  let usersList;
  try {
    usersList = await User.find({ verified: false }, { __v: 0 })
  } catch (error) {
    console.log("Error fetching users")
    return res.status(400).json(error)
  }
  return res.status(200).json(usersList)
})

router.get("/slipList", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN");

  const liveAuctions = await getLiveAuctions(true);
  let finalArray = [];
  if (liveAuctions.length) {
    for (let j = 0; j < liveAuctions.length; j++) {
      let auctionID = liveAuctions[j]._id;
      const bidsResult = await Bid.find({ auctionID: auctionID, pending: false, verified: false }, { __v: 0 });
      let bidItemCodes = bidsResult.map(bid => bid.itemCode)
      let itemsResult = await Item.find({ code: { $in: bidItemCodes } }, { __v: 0 })
      for (let i = 0; i < bidItemCodes.length; i++) {
        let item = findItem(itemsResult, bidItemCodes[i])
        let user = await User.findById(bidsResult[i].userID);

        let final = {
          bidID: bidsResult[i]._id.valueOf(),
          itemCode: bidItemCodes[i],
          itemTitle: item.title,
          initialBid: item.initialBid,
          currentBid: bidsResult[i].amount,
          userFullName: `${user.firstName} ${user.lastName}`,
          special: liveAuctions[0].special,
          slip: await getProofImage(bidsResult[i]._id.valueOf())
        }
        finalArray.push(final)
      }
    }
  }
  console.log(finalArray.length)

  res.status(200).json(finalArray)
})

router.get("/notificationCount", async (req, res) => {
  const { email } = req;
  const userResult = await User.findOne({ email: email });
  if (!userResult)
    return res.status(400).json("User not found");

  const notificationResult = await Notification.countDocuments({ userID: userResult._id.valueOf(), seen: false });
  res.status(200).json(notificationResult)
})

router.get("/notifications", async (req, res) => {
  const { email } = req;
  const userResult = await User.findOne({ email: email });
  if (!userResult)
    return res.status(400).json("User not found");

  const notificationResult = await Notification.find({ userID: userResult._id.valueOf() }, { __v: 0, _id: 0 });
  res.status(200).json(notificationResult)
})

router.get("/specialAuction", async (req, res) => {
  const { email } = req;
  const userResult = await User.findOne({ email: email });
  if (!userResult)
    return res.status(400).json("User not found");

  let userID = userResult._id.valueOf();

  const auctions = await Auction.find({ 'specialParticipants.userID': { $eq: userID } })
  auctionItems = [];
  for (let i = 0; i < auctions.length; i++) {
    let auction = auctions[i];
    let itemCodes = auction.items.map(item => item.itemCode);
    for (let j = 0; j < itemCodes.length; j++) {

      let bidsCount = await Bid.countDocuments({ auctionID: auction._id.valueOf(), itemCode: itemCodes[j], userID, userID })
      if (!bidsCount) {
        let itemCode = itemCodes[j];
        let picture = await getImage(itemCode)
        let auctionItem = {
          auctionID: auction._id.valueOf(),
          startDate: auction.startDate,
          endDate: auction.endDate,
          picture: picture,
          itemCode: itemCode
        }
        auctionItems.push(auctionItem)
      }
    }
  }

  let finalItems = [];
  for (let i = 0; i < auctionItems.length; i++) {
    let itemRes = await Item.findOne({ code: auctionItems[i].itemCode }, { __v: 0 })
    itemRes = itemRes.toObject();
    itemRes.auctionID = auctionItems[i].auctionID;
    itemRes.auctionStart = auctionItems[i].startDate;
    itemRes.auctionEnd = auctionItems[i].endDate;
    itemRes.picture = auctionItems[i].picture;
    finalItems.push(itemRes)
  }
  res.status(200).json(finalItems)
})

router.get("/usersListVerified", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN");

  let usersResult;
  try {
    usersResult = await User.find({}, { __v: 0, password: 0 });
  } catch (error) {
    console.log("Error fetching users")
    return res.status(400).json(error)
  }
  return res.status(200).json(usersResult);
})
module.exports = router;

async function getLiveAuctions(all = false) {
  let now = new Date().toISOString();
  let auctionResult;
  if (all)
    auctionResult = await Auction.find({ startDate: { $lte: now }, endDate: { $gte: now } })
  else
    auctionResult = await Auction.find({ startDate: { $lte: now }, endDate: { $gte: now }, special: false })
  return auctionResult;
}

async function getItemsOfAuction(itemsInfo) {
  let itemsList = [];
  for (let i = 0; i < itemsInfo.length; i++) {
    let item = (await Item.findOne({ code: itemsInfo[i].itemCode }, { _id: 0, __v: 0 }));
    item = item.toObject();
    if (item) {
      if (itemsInfo[i].highestBid)
        item.highestBid = itemsInfo[i].highestBid;


      if (itemsInfo[i].userID) {
        let user = await User.findById(itemsInfo[i].userID);
        item.fullName = user.firstName + " " + user.lastName;
        item.userID = itemsInfo[i].userID;
      }
      itemsList.push(item);
    }
  };
  return itemsList;
}

async function getImage(itemCode) {
  const folderPath = path.join(__dirname, "images", "items");
  let dir = await fs.readdir(folderPath);
  let file = undefined;
  let extension = "";
  for (let i = 0; i < dir.length && !file; i++) {
    if (dir[i].includes(itemCode)) {
      file = await fs.readFile(path.join(folderPath, dir[i]));
      extension = path.extname(path.join(folderPath, dir[i]))
    }
  }
  return `data:image/${extension.substring(1)};base64, ${Buffer.from(file).toString("base64")}`;
}
async function getProofImage(bidID) {
  const folderPath = path.join(__dirname, "images", "proofs");
  let dir = await fs.readdir(folderPath);
  let file = undefined;
  let extension = "";
  for (let i = 0; i < dir.length && !file; i++) {
    if (dir[i].includes(bidID)) {
      file = await fs.readFile(path.join(folderPath, dir[i]));
      extension = path.extname(path.join(folderPath, dir[i]))
    }
  }
  return `data:image/${extension.substring(1)};base64, ${Buffer.from(file).toString("base64")}`;
}

function findItem(itemList, itemCode) {
  for (let i = 0; i < itemList.length; i++) {
    if (itemList[i].code == itemCode)
      return itemList[i]
  }
}
