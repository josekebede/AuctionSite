const router = require("express").Router();
const User = require("./schemas/users");
const Admin = require("./schemas/admins");
const bcrypt = require("bcrypt");

const Utility = require("./helpers");

require("dotenv").config();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Not Correct format" })
  }
  // Checks if email is found
  // if (type == "user") {
  const userResult = await User.findOne({ email: { $eq: email } });
  if (userResult) {
    if (!userResult.verified)
      return res.status(403).json({ message: "Not Verified" })
    let isFound = await bcrypt.compare(password, userResult.password);
    if (isFound) {
      const fullName = userResult.firstName + " " + userResult.lastName;
      const token = Utility.generateToken(email);
      return res.status(200).send({ token: token, type: "user", fullName: fullName })
    }
  }
  const adminResult = await Admin.findOne({ email: { $eq: email } })
  if (adminResult) {
    let isFound = await bcrypt.compare(password, adminResult.password);
    if (isFound) {
      const fullName = adminResult.firstName + " " + adminResult.lastName;
      const token = Utility.generateToken(email);
      return res.status(200).send({ token: token, type: "admin", fullName: fullName })
    }
  }

  return res.status(400).json({ message: "NOT FOUND" });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, companyID } = req.body; // Gets the variables

  // If they are valid, it stores them to the database, otherwise it sends an error to the client
  if (firstName == undefined || lastName == undefined ||
    email == undefined || !Utility.isEmail(email) ||
    password == undefined || password.length < 8 || companyID == undefined)
    return res.status(400).send({ registered: false }) // Sending error


  const userResult = await User.findOne({ email: { $eq: email } });
  if (userResult)
    return res.status(403).json({ message: "USER EXISTS" });

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: hashedPassword,
    companyID: companyID
  })

  const newUser = await user.save();
  if (newUser)
    return res.status(201).send({ registered: true }) // Sending success
  return res.status(400).send({ message: "Error Saving User" }) // Sending Error
})

module.exports = router;
