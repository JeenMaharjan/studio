const express = require("express");
const router = express.Router();

const { requireSignin } = require("../middlewares/index.js");
const { khaltiPayment } = require("../controllers/khalti.js");


router.post("/khalti-app", khaltiPayment);

module.exports = router;
