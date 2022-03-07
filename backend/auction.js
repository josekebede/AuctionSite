const router = require("express").Router();
const xlsx = require("node-xlsx");
const Category = require("./schemas/categories")
const fs = require("fs").promises;
const JSZip = require("jszip");
const ExcelJS = require('exceljs')
const workbook = new ExcelJS.Workbook();
const path = require("path")
const Auction = require("./schemas/auctions");
const Item = require("./schemas/items");
const multer = require("multer");
const upload = multer();
const Utility = require("./helpers");
const Bid = require("./schemas/bids");
const User = require("./schemas/users");
const Wishlist = require("./schemas/wishlist")

require("dotenv").config();


router.post("/add", upload.single("picture"), async (req, res) => {
  let isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(400).json({ message: "NOT ADMIN" });

  // Gets the necessary items from the request body
  let { title, type, initialBid, auctionSelect, auctionStart, auctionEnd, newAuction } = req.body;
  let itemPicture = req.file;

  try {
    newAuction = parseInt(newAuction);
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "INCORRECT INITIAL BID" })
  }
  // Validates title
  if (!Utility.isString(title))
    return res.status(400).json({ message: "INCORRECT TITLE" })

  // Checks if the type is part of the categories in the database
  let categoriesResult;
  try {
    categoriesResult = await Category.find();
  } catch (error) {
    console.log("CATEGORY ERROR");
    return res.status(400).json({ message: error })
  }
  let names = categoriesResult.map(category => category.name);

  if (!names.includes(type))
    return res.status(400).json({ message: "INCORRECT TYPE" })


  // Tries to parse the bid into an INTEGER
  try {
    initialBid = parseInt(initialBid);
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "INCORRECT INITIAL BID" })
  }

  // If the bid is a new one
  if (newAuction) {
    let startDate, endDate;
    try {
      startDate = new Date(auctionStart)
      endDate = new Date(auctionEnd);
      startDate.setHours(0, 0, 0); // Sets the start time to the start of day
      endDate.setHours(23, 59, 59); // Sets the end time to the end of day
    } catch (error) {
      return res.status(400).json({ message: "INCORRECT AUCTION DATES" })
    }
    let validAuction = await checkNewAuction(startDate, endDate);
    if (!validAuction)
      return res.status(403).json("Incorrect Dates")

    let auction = new Auction({
      startDate: startDate,
      endDate: endDate
    })

    let auctionResult;
    try {
      auctionResult = await auction.save();
    } catch (error) {
      console.log("ERROR SAVING AUCTION");
      return res.status(400).json({ message: error })
    }
    let auctionID = auctionResult._id.valueOf();

    let savedItem;
    try {
      savedItem = await saveItem(auctionID, title, type, initialBid);
    } catch (error) {
      console.log("ERROR SAVING ITEM");
      return res.status(400).json({ message: error })
    }


    try {
      await saveImage("items", savedItem.code, itemPicture)
    } catch (error) {
      console.log("ERROR SAVING IMAGE");
      return res.status(400).json({ message: error })
    }

    auction.items.push({ itemCode: savedItem.code })

    try {
      auctionResult = await auction.save();
    } catch (error) {
      console.log("ERROR APPENDING ITEMS TO AUCTION");
      return res.status(400).json({ message: error })
    }

    return res.status(200).json(auctionResult)
  } else {

    if (!Utility.isString(auctionSelect)) {
      return res.status(400).json({ message: "INVALID ID" })
    }

    console.log(auctionSelect)
    let savedItem;
    try {
      savedItem = await saveItem(auctionSelect, title, type, initialBid);
    } catch (error) {
      console.log("ERROR SAVING ITEM");
      return res.status(400).json({ message: error })
    }

    try {
      await saveImage("items", savedItem.code, itemPicture)
    } catch (error) {
      console.log("ERROR SAVING IMAGE");
      return res.status(400).json({ message: error })
    }

    let auctionResult;
    try {
      auctionResult = await Auction.findOne({ _id: auctionSelect });
    } catch (error) {
      console.log("ERROR GETTING AUCTION");
      return res.status(400).json({ message: error })
    }

    auctionResult.items.push({ itemCode: savedItem.code })
    try {
      auctionResult = await auctionResult.save();
    } catch (error) {
      console.log("ERROR APPENDING ITEMS TO AUCTION");
      return res.status(400).json({ message: error })
    }

    return res.status(200).json(auctionResult)
  }
});

router.post("/addFile", upload.single("file"), async (req, res) => {
  let isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(400).json({ message: "NOT ADMIN" });

  const file = req.file;
  let data = (xlsx.parse(file.buffer))[0].data;

  let auctionResult = await Auction.find({});
  let auctionStartDates = auctionResult.map(auction => auction.startDate);
  let auctionEndDates = auctionResult.map(auction => auction.endDate);

  let categories = await Category.find();
  let categoryNames = categories.map(category => category.name.toLowerCase())
  let now = new Date(Date.now());

  let auctionRange = null;
  for (let i = 1; i < data.length; i++) {
    let title = data[i][0];
    let type = data[i][1];
    let initial = data[i][2];
    let start = data[i][3];
    let end = data[i][4];

    if (!title || !type || !initial || !start || !end)
      return res.status(400).json("Invalid Format")

    if (!categoryNames.includes(type.toLowerCase()))
      return res.status(400).json(`Unknown Item type on Row ${i + 1}`);

    try {
      initial = parseInt(initial)
    } catch (error) {
      return res.status(400).json(`Incorrect initial bid on Row ${i + 1}`)
    }

    try {
      start = new Date(ExcelDateToJSDate(start, true))
      end = new Date(ExcelDateToJSDate(end))
    } catch (error) {
      return res.status(400).json(`Invalid Date(s) on Row ${i + 1}`)
    }

    data[i][3] = start;
    data[i][4] = end;
    if (!auctionRange)
      auctionRange = { start: start, end: end };

    let newAuctionRange = { start: start, end: end };
    if (auctionRange.start.getTime() !== newAuctionRange.start.getTime() || auctionRange.end.getTime() !== newAuctionRange.end.getTime())
      return res.status(400).json("Multiple date ranges. Only one auction per file.")

    start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    now = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (start.valueOf() < now.valueOf())
      return res.status(400).json(`Start Date on Row ${i + 1} is set in the past`)

    if (end.valueOf() < start.valueOf())
      return res.status(400).json(`End Date before Start on Row ${i + 1}`)

    for (let j = 0; j < auctionStartDates.length; j++) {
      let auctionStart = new Date(Date.UTC(auctionStartDates[j].getUTCFullYear(), auctionStartDates[j].getUTCMonth(), auctionStartDates[j].getUTCDate()));
      let auctionEnd = new Date(Date.UTC(auctionEndDates[j].getUTCFullYear(), auctionEndDates[j].getUTCMonth(), auctionEndDates[j].getUTCDate()));

      if ((start <= auctionEnd && start >= auctionStart) || (start <= auctionStart && end >= auctionEnd))
        return res.status(400).json(`Ovelapping auction on Row ${i + 1}`)
    }
  }

  // Loads workbook
  await workbook.xlsx.load(file.buffer);
  // Selects a worksheet
  let worksheet = workbook.worksheets[0];

  // Gets all images inside worksheet
  for (const image of worksheet.getImages()) {
    // Gets row of image
    const row = image.range.tl.nativeRow;
    // Gets column of image
    const col = image.range.tl.nativeCol;

    // If the image is not on the fifth column (where it should be)
    if (col !== 5) {
      return res.status(400).json(`Image not of 5th Column on Row ${row}`)
    }

    // Gets actual image
    const img = workbook.model.media.find(m => m.index === image.imageId);
    // Adds image (and extension) to data
    data[row][5] = { image: img.buffer, extension: img.extension };
    // console.log(img)
  }


  let auction = new Auction({
    startDate: auctionRange.start,
    endDate: auctionRange.end
  })

  let savedAuction;

  try {
    savedAuction = await auction.save();
  } catch (error) {
    console.log(error)
    return res.status(400).json("ERROR SAVING AUCTION")
  }

  for (let i = 1; i < data.length; i++) {
    let savedItem;

    try {
      savedItem = await saveItem(savedAuction._id.valueOf(), data[i][0], data[i][1], data[i][2]);
    } catch (error) {
      console.log(error)
      return res.status(400).json("ERROR SAVING ITEM")
    }

    // Saves the image only if it exists
    if (data[i][5])
      try {
        await saveImageFromFile(savedItem.code, data[i][5].extension, data[i][5].image)
      } catch (error) {
        console.log(error)
        return res.status(400).json("ERROR SAVING IMAGE")
      }

    savedAuction.items.push({ itemCode: savedItem.code })
  }

  try {
    await savedAuction.save();
  } catch (error) {
    console.log(error)
    return res.status(400).json("ERROR SAVING AUCTION")
  }

  let newAuctionDateStart = auctionRange.start.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
  let newAuctionDateEnd = auctionRange.end.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
  res.status(200).json([`Auction Created Successfully`, '', `Range:- ${newAuctionDateStart} - ${newAuctionDateEnd}`, `Items:-  ${data.length - 1}`])
});

router.post("/deleteAuction", async (req, res) => {
  let isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(400).json({ message: "NOT ADMIN" });

  const { auctionID } = req.body;
  const auctionResult = await Auction.findById(auctionID);
  let itemCodeList = auctionResult.items.map(item => item.itemCode);

  try {
    await Auction.deleteOne({ _id: auctionID })
  } catch (error) {
    console.log("Error Deleting Auction");
    return res.status(400).json(error)
  }

  try {
    await Item.deleteMany({ code: { $in: itemCodeList } });
    itemCodeList.forEach(async itemCode => {
      await deleteItemPicture(itemCode)
    });
    await Bid.deleteMany({ itemCode: { $in: itemCodeList } });
    await Wishlist.deleteMany({ itemCode: { $in: itemCodeList } });
  } catch (error) {
    console.log("Error Deleting Items");
    return res.status(400).json(error)
  }

  return res.status(200).json(auctionID)
})

router.post("/addCategory", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  const { category } = req.body;
  const categoryResult = await Category.find({});
  let categoryNames = categoryResult.map(category => category.name.toLowerCase())
  if (categoryNames.includes(category.toLowerCase()))
    return res.status(400).json(category)

  let newCategory = new Category({
    name: category
  })

  await newCategory.save();
  res.status(200).json(category)
})

router.post("/deleteCategory", async (req, res) => {
  const isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(403).json("NOT ADMIN")

  const { categoryName } = req.body;
  let itemCodes;
  let bids;
  try {

    result = await Category.find({ name: categoryName });
    if (!result)
      return res.status(400).json("Category Not Found");

    let itemsResult = await Item.find({ type: categoryName });
    await Category.deleteOne({ name: categoryName })
    if (itemsResult.length) {
      itemCodes = itemsResult.map(item => item.code);
      bids = await Bid.find({ itemCode: { $in: itemCodes } });
      await Item.deleteMany({ type: categoryName })
      await Bid.deleteMany({ itemCode: { $in: itemCodes } });
      await Auction.updateMany({ 'items.itemCode': { $in: itemCodes } }, { $pull: { items: { itemCode: { $in: itemCodes } } } })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json("ERROR DELETING CATEGORY")
  }

  try {
    if (itemCodes && itemCodes.length)
      itemCodes.forEach(async itemCode => {
        await deleteItemPicture(itemCode)
      });

    if (bids && bids.length)
      bids.forEach(async bid => {
        await deleteBidPicture(bid._id.valueOf())
      });
  } catch (error) {
    console.log(error)
    return res.status(400).json("ERROR DELETING PICTURES")
  }
  return res.status(200).json(categoryName)
})
router.post("/deleteItem", async (req, res) => {
  let isAdmin = await Utility.checkIfAdmin(req.email);
  if (!isAdmin)
    return res.status(400).json({ message: "NOT ADMIN" });

  const { itemCode } = req.body;

  try {
    await Item.deleteOne({ code: itemCode });
    await deleteItemPicture(itemCode);
  } catch (error) {
    console.log("Error Deleting Item");
    return res.status(400).json(error)
  }

  try {
    await Bid.deleteMany({ itemCode: itemCode })
    await Wishlist.deleteMany({ itemCode: itemCode })
  } catch (error) {
    console.log("Error Deleting Information associated with item");
    return res.status(400).json(error)
  }

  let aucitonResult = await Auction.findOne({ items: { itemCode: itemCode } });
  if (aucitonResult.items.length == 1)
    await Auction.deleteOne({ _id: aucitonResult._id.valueOf() })
  else
    await Auction.updateOne({ items: { itemCode: itemCode } }, { $pull: { items: { itemCode: itemCode } } });

  return res.status(200).json(itemCode)
})
router.post("/bid", async (req, res) => {
  let { auctionID, itemCode, amount } = req.body;

  let userResult = (await User.findOne({ email: req.email }, { _id: 1 }))
  let userID;
  try {
    userID = userResult._id.valueOf();
  } catch (error) {
    return res.status(400).json({ message: "NO USER FOUND" })
  }
  try {
    amount = parseInt(amount);
  } catch (error) {
    console.log("ERROR ON AMOUNT")
    return res.status(400).json({ message: "INVALID INPUT" })
  }
  if (!auctionID || !Utility.isString(auctionID) || !itemCode || !Utility.isString(itemCode) ||
    !userID || !Utility.isString(userID) || !amount || !Utility.isNumber(amount))
    return res.status(400).json({ message: "INVALID INPUT" })

  const bid = new Bid({
    auctionID: auctionID,
    itemCode: itemCode,
    userID: userID,
    amount: amount
  });


  try {
    await bid.save();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "ERROR SAVING BID" })
  }

  return res.status(200).json({ message: itemCode })
})

router.post("/bidProof", upload.single("proofImage"), async (req, res) => {
  const { bidID } = req.body;
  const image = req.file

  let bidResult = await (Bid.findById(bidID));
  if (!bidResult.pending)
    return res.status(400).json("BID ALREADY SAVED");

  if (!bidResult)
    return res.status(400).json("NO BID");

  if (!image)
    return res.status(400).json("NO IMAGE");

  try {
    await saveImage("proofs", bidResult._id.valueOf(), image)
  } catch (error) {
    console.log("ERROR SAVING PROOF");
    return res.status(400).json(error)
  }

  bidResult.pending = false;
  try {
    await bidResult.save();
  } catch (error) {
    console.log("ERROR SAVING BID");
    return res.status(400).json(error)
  }

  return res.status(200).json(bidID)
})

router.post("/deleteBid", async (req, res) => {
  const { bidID } = req.body;
  let userID = (await User.findOne({ email: req.email }))._id.valueOf();
  const bidResult = await Bid.deleteOne({ _id: bidID, userID: userID });
  if (bidResult.deletedCount == 0)
    return res.status(400).json("Incorrect Parameters")

  res.status(200).json(bidID)

})

router.post("/addWish", async (req, res) => {
  const { email } = req;
  const { itemCode } = req.body;
  const wishlistRes = await Wishlist.findOne({ itemCode: itemCode });
  if (wishlistRes)
    return res.status(200).json("Already Added");

  const itemRes = await Item.findOne({ code: itemCode })
  if (!itemRes)
    return res.status(400).json("Item doesn't exist")
  const userResult = await User.findOne({ email: email });
  let wish = new Wishlist({
    userID: userResult._id.valueOf(),
    itemCode: itemCode
  });

  try {
    await wish.save();
  } catch (error) {
    console.log("ERROR SAVING WISHLIST");
    return res.status(400).json(error)
  }

  res.status(200).json({ message: "Item added to wishlist", itemCode: itemCode });
})

router.post("/deleteWish", async (req, res) => {
  const { email } = req;
  let { itemCode } = req.body;
  const userResult = await User.findOne({ email: email });
  const deletedRes = await Wishlist.deleteOne({ userID: userResult._id.valueOf(), itemCode: itemCode });
  if (deletedRes.deletedCount == 0)
    return res.status(400).json("Wishlist item Not Found")
  return res.status(200).json(itemCode)
})

router.post("/deleteUser", async (req, res) => {
  const { userID } = req.body;

  try {
    await User.findByIdAndDelete(userID)
  } catch (error) {
    console.log("ERROR DELETING USER");
    return res.status(400).json(error)
  }
  res.status(200).json(userID)
})
async function saveItem(auctionID, title, type, initialBid) {

  let codeList = (await Item.find({}, { _id: 0, code: 1 }));
  codeList = codeList.map(code => code.name);
  let code = Utility.getRandom8Char();
  let hasError = true;
  for (let i = 0; i < codeList.length && hasError; i++) {
    if (codeList.includes(code))
      code = Utility.getRandom8Char();
    else
      hasError = false;
  }


  let item = new Item({
    title: title,
    type: type,
    code: code,
    initialBid: initialBid,
    auctionID: auctionID
  })
  const savedItem = item.save();
  return savedItem;
}

async function checkNewAuction(startDateCheck, endDateCheck) {
  let start = startDateCheck.toISOString();
  let end = endDateCheck.toISOString();
  if (start == "Invalid Date" || end == "Invalid Date")
    return false;
  let now = Date.now();
  if (new Date(start).getTime() < now || new Date(end).getTime() < now)
    return false;

  let auctionResults = await Auction.find(
    {
      $or: [
        {
          $and: [{ startDate: { $lte: start } }, { endDate: { $gte: start } }]
        },
        {
          $and: [{ startDate: { $lte: end } }, { endDate: { $gte: end } }]
        },
        {
          $and: [{ startDate: { $gte: start } }, { endDate: { $lte: end } }]
        },
      ]
    }
  )

  if (auctionResults && auctionResults.length == 0)
    return true;
  else
    return false;
}

async function saveImage(subFolder, name, image) {
  let saveItemPic;
  let extension = path.extname(image.originalname);
  const filePath = path.join(__dirname, "images", subFolder, name + extension);
  saveItemPic = await fs.writeFile(filePath, image.buffer, "binary");
}

async function saveImageFromFile(name, extension, imageBuffer) {
  const filePath = path.join(__dirname, "images", "items", name + extension);
  saveItemPic = await fs.writeFile(filePath, imageBuffer, "binary");
}

async function deleteItemPicture(itemCode) {
  const folderPath = path.join(__dirname, "images", "items");
  let dir = await fs.readdir(folderPath);
  for (let i = 0; i < dir.length; i++) {
    if (dir[i].includes(itemCode)) {
      await fs.rm(path.join(folderPath, dir[i]))
    }
  }
}

async function deleteBidPicture(bidID) {
  const folderPath = path.join(__dirname, "images", "proofs");
  let dir = await fs.readdir(folderPath);
  for (let i = 0; i < dir.length; i++) {
    if (dir[i].includes(bidID)) {
      await fs.rm(path.join(folderPath, dir[i]))
    }
  }
}

function ExcelDateToJSDate(date, isStart = false) {
  let newDate = new Date(Math.round((date - 25569) * 86400 * 1000))
  if (isStart)
    newDate.setHours(0, 0, 0)
  else
    newDate.setHours(23, 59, 59)
  if (newDate == "Invalid Date")
    throw error
  // newDate = ((newDate.toString()).split('Z')[0])
  console.log(newDate)
  return newDate;
}
module.exports = router
