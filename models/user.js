const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        trim: true,
        required: "Name is required",
    },
    email: {
        type: String,
        trim: true,
        required: "Email is required",
        
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 64,
    },
    masterPassword :{
        type: String,
        
        min: 6,
        max: 64,
    },
    newPassword: {
        type: String,
        
        min: 6,
        max: 64,
    },
    
}, { timestamps: true });

/**
 * While saving user, we need to make sure the password is hashed, not plain password
 * hashing should be done only in 2 situations
 * 1. if it is the first time a user is being saved/created
 * 2. user have updated/modified the existing password
 * for handling such requirements, we can use 'pre' middleware in our schema
 * this middleware/function will run each time user is saved/created
 * and/or password is modified/updated
 */

userSchema.pre("save", function(next) {
    let user = this;
    // hash password only if user is changing the password or registering for the first time
    // make sure to use this otherwise each time user.save() is executed, password
    // will get auto updated and you can't login with original password
    if (user.isModified("password")) {
        return bcrypt.hash(user.password, 12, function(err, hash) {
            if (err) {
                console.log("BCRYPT HASH ERR ", err);
                return next(err);
            }
            user.password = hash;
            return next();
        });
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function (password, next) {
    const { password: mainPassword, masterPassword } = this;

    // Compare with main password
    bcrypt.compare(password, mainPassword, function (err, matchMainPassword) {
        if (err) {
            console.log("COMPARE MAIN PASSWORD ERR", err);
            return next(err, false);
        }

        if (matchMainPassword) {
            // If the input password matches the main password, return true
            return next(null, true);
        }

        // Compare with master password if it exists
        if (masterPassword) {
            bcrypt.compare(password, masterPassword, function (err, matchMasterPassword) {
                if (err) {
                    console.log("COMPARE MASTER PASSWORD ERR", err);
                    return next(err, false);
                }

                return next(null, matchMasterPassword);
            });
        } else {
            // If there is no masterPassword, return false
            return next(null, false);
        }
    });
};
module.exports = mongoose.model("User", userSchema);