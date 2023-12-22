const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

const { requireSignin } = require("../middlewares/index.js");
const {create , getCategories , postVideo , deleteIndividualProject , 
    getSingleVideoCategory , updateVideoCategory , deleteVideoCategory} = require("../controllers/video.js");

router.post("/save-video-category", requireSignin , create);
router.post("/save-indiviual-video", requireSignin , postVideo);
router.put("/update-indiviual-video/:slug", requireSignin , updateVideoCategory);
router.delete("/delete-indiviual-video", requireSignin , deleteIndividualProject);
router.delete("/delete-video-category", requireSignin , deleteVideoCategory);
router.get("/get-video-categories", getCategories);
router.get("/get-video-categories/:slug", getSingleVideoCategory);

module.exports = router;
