const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

const { requireSignin } = require("../middlewares/index.js");
const { create , getCategories , uploadBannerPhoto , saveBannerPhoto , 
        saveLandscapePhoto , savePhoto , getAllPhotos , getSinglePhotos , deleteSingleLandscape} = require("../controllers/photo.js");

router.post("/create-photo-category", create);

router.get("/get-photo-categories", getCategories);
router.post("/upload-banner-photo", formidable(), requireSignin , uploadBannerPhoto);
router.post("/save-banner-photo",  requireSignin , saveBannerPhoto);
router.post("/save-landscape-photo",  requireSignin , saveLandscapePhoto);
router.put("/delete-landscape-photo",  requireSignin , deleteSingleLandscape);
router.post("/save-photo",  requireSignin , savePhoto);
router.get("/get-all-photos", getAllPhotos);
router.get("/get-single-photo/:slug", getSinglePhotos);

module.exports = router;
