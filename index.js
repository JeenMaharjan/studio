const express = require("express");
const { readdirSync } = require("fs");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require('fs');
const bodyParser = require('body-parser');

const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadDir = path.join('C:', 'tmp');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


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
app.use(express.json({ limit: "1024mb" }));
app.use(express.static(path.join(__dirname, './build')))


// route middleware

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.use("*", function(req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"))
})

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));