const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const verifyPassword = require("../middleware/verifyPassword");
const emailValidator = require("../middleware/email");

router.post("/signup", verifyPassword, emailValidator, userCtrl.signup);
router.post("/login", verifyPassword, userCtrl.login);

module.exports = router;