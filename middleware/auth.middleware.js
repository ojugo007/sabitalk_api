const UsersModel = require("../models/users.model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const validateToken = async(req, res, next) =>{
    const bearerToken = req.cookies.token;

    if(!bearerToken){
        res.status(401).json({ message : "unauthorized"})
    }

    try{
        const token = await jwt.verify(bearerToken, process.env.JWT_SECRET)
        
        const user = await UsersModel.findOne({email:token.email})
        if(!user){
            res.status(401).json({ message : "unauthorized, you have to login" })
        }
        req.user = user;
        next()
    }catch(error){
        console.log("error.message")
    }
}

module.exports = validateToken;