const jwt = require("jsonwebtoken");
const Admin = require("./schemas/admins")

module.exports = {
  // Generates a token
  generateToken: function (email) {
    const payload = {
      email: email
    }
    return jwt.sign(payload, process.env.JWT_TOKEN)
  },

  // Generates 8 random character (from A - Z)
  getRandom8Char: function () {
    let characters = [];
    for (let i = 0; i < 8; i++) {
      characters.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
    }
    return characters.join("")
  },
  verifyToken: function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ message: "NO TOKEN" })

    jwt.verify(token, process.env.JWT_TOKEN, (err, payload) => {
      if (err) return res.status(403).json({ message: "INVALID TOKEN" });
      req.email = payload.email;
      next();
    })
  },

  // Checks if it is an email
  isEmail: function (email) {
    let emailArray = String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return (emailArray != undefined ? true : false)
  },

  // Check if email is admin
  checkIfAdmin: async function (email) {
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
  },
  isString: function (input) {
    return (typeof input) == "string"
  },

  isNumber: function (input) {
    return (typeof input) == "number"
  },

  isType: function (type) {
    const types = ["Furniture", "Vehicle", "Office Equipment", "Stock Items"];
    return types.includes(type);
  }
}
