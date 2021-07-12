const emailSchema = require("validator");

module.exports = (req, res, next) => {
    if (!emailSchema.isEmail(req.body.email)) {
        console.log("Email invalide, format : test@test.com");
        return res.status(400).json({ error: "Format email invalide" });
    } 
    else {
        next();
    }
};