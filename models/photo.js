const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    bannerImage:{
        
    },
    landscapeImages: {
        type: Array,
    },
    images: {
        type: Array,
    },
    
})


const photoSchema = new mongoose.Schema({
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
    project:[imageSchema]
})

module.exports = mongoose.model("Photo", photoSchema);