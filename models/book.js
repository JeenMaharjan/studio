    const mongoose = require("mongoose");

    const { Schema } = mongoose;

    const dateRangeSchema = new Schema({
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        key: {
            type: String,
            default: "markedRange2", // Set the default value to "markedRange2"
            required: true,
        }
    });

    const bookSchema = new Schema({
        name: {
            type: String,
            trim: true,
            required: "Name is required",
        },
        email: {
            type: String,
            trim: true,
            required: "Email is required",
            
        },
        phone: {
            type: String,
            required: true,
        
        },
        price:{
            type: Number,
            required: true,
        
        },
        address: {
            type: String,
            
            required: true,
        },
        location: {
            type: String,
        },
        dates:{
            type: dateRangeSchema,
            required: true,
        }
        
    }, { timestamps: true });


    module.exports = mongoose.model("Book", bookSchema);