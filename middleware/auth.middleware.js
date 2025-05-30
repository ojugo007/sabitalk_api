const UsersModel = require("../models/users.model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const validateToken = async(req, res, next) =>{
    const bearerToken = req.cookies.token;

    if(!bearerToken){
       return res.status(401).json({ message : "unauthorized"})
    }

    try{
        const token = await jwt.verify(bearerToken, process.env.JWT_SECRET)
        
        const user = await UsersModel.findOne({email:token.email})
        if(!user){
            return res.status(401).json({ message : "unauthorized, you have to login" })
        }
        req.user = user;
        return next()
    }catch(error){
        console.log(error.message)
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = validateToken;