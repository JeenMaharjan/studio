const express = require("express");
const router = express.Router();

const { requireSignin } = require("../middlewares/index.js");
const { create  , getAllBooking , getAllBookingRecords} = require("../controllers/book.js");


router.post("/booking", create);
router.get("/get-all-booking", getAllBooking);
router.get("/get-all-booking-records", getAllBookingRecords);

module.exports = router;
