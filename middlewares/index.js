const expressJwt = require("express-jwt");

// req.user
exports.requireSignin = expressJwt({
    // secret, expiryDate
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
});