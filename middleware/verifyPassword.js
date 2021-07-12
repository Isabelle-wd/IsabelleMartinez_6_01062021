const passwordSchema = require("../models/password");

module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        return res.status(400).json({ error: "Mot de passe non valable: 8 caractères dont 1 majuscule et 1 chiffre" });        
    } 
    else {
        next();
    }
};