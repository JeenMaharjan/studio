const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        
       
    },
    slug: {
        type: String,
        
        lowercase: true,
        index: true,
    
    },
    status: {
        type: String,
        trim: true,
        required: true,
        
       
    },
    desc: {
        type: String,
        trim: true,
        required: true,
        
       
    },
    location: {
        type: String,
        trim: true,
        required: true,
        
       
    },
    video: {
    },
    images: {
        type: Array,
    },
    
})


const categorySchema = new mongoose.Schema({
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
    project:[projectSchema]
})

module.exports = mongoose.model("Category", categorySchema);