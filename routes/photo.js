const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

const { requireSignin } = require("../middlewares/index.js");
const { create , getCategories , uploadBannerPhoto , saveBannerPhoto , 
        saveLandscapePhoto , savePhoto , getAllPhotos , getSinglePhotos , deleteSingleLandscape , deleteSinglePhoto,
        deletePhotoCategory ,allPhotoCategories, getSingleCategory , updatePhotoCategory , getPhotoAggregate} = require("../controllers/photo.js");

router.post("/create-photo-category", create);

router.get("/get-photo-categories", getCategories);

router.put("/update-indiviual-photo/:slug", requireSignin , updatePhotoCategory);

router.get("/get-photo-categories/:slug", getSingleCategory);
router.get("/all-photo-categories", allPhotoCategories);
router.post("/upload-banner-photo/:slug", formidable(), requireSignin , uploadBannerPhoto);
router.delete("/delete-photo-category", requireSignin , deletePhotoCategory);
router.post("/save-banner-photo",  requireSignin , saveBannerPhoto);
router.post("/save-landscape-photo",  requireSignin , saveLandscapePhoto);
router.put("/delete-landscape-photo",  requireSignin , deleteSingleLandscape);
router.put("/delete-photo",  requireSignin , deleteSinglePhoto);
router.post("/save-photo",  requireSignin , savePhoto);
router.get("/get-all-photos", getAllPhotos);
router.get("/get-single-photo/:slug", getSinglePhotos);

router.get("/get-photo-aggregate", getPhotoAggregate);


module.exports = router;
