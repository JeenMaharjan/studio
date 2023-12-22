const express = require("express");
const { readdirSync } = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// db connection
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.DATABASE, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log('Mongo connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();



// middlewares
app.use(cors(
    
));
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
// app.use(express.static(path.join(__dirname, './build')))


// route middleware

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// app.use("*", function(req, res) {
//     res.sendFile(path.join(__dirname, "build", "index.html"))
// })

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));