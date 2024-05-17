const mongoose = require("mongoose");

const vidSchema = new mongoose.Schema({
    videoTitle:{
        type: String,
    },
    video: {

    },
     bannerImage:{
        
    },
})


const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        text: true,
    },
    slug: {
        type: String,
        lowercase: true,
    },
    pin:{
        type:Boolean,
        default:false
    },
    displayVideo: {},
    project:[vidSchema]
})

module.exports = mongoose.model("Video", videoSchema);