const mongoose = require("mongoose")
require("dotenv").config()

const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING
const connectDB =()=>{
    mongoose.connect(MONGODB_CONNECTION_STRING)
    mongoose.connection.on("connected", ()=>{
        console.log("successfully connected to database")
    })
    mongoose.connection.on("error", (err)=>{
        console.log("unable to connect to database " + err.message)
    })
}

module.exports = {connectDB}