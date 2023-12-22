const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

const { requireSignin } = require("../middlewares/index.js");
const { create , listAll , read , remove} = require("../controllers/notification.js");

router.post("/notify",  create);
router.get("/get-all-notifications",  listAll);
router.put("/read-all-notifications",  read);
router.delete("/delete-notification/:id", requireSignin, remove);

module.exports = router;
