const express = require("express")
require("dotenv").config()
const connect = require("./db")
const authRoute = require("./routes/auth.routes")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const validateToken = require("./middleware/auth.middleware")
const { rateLimit } = require('express-rate-limit') 
const passport = require("passport")
const jwt = require("jsonwebtoken")
const cache = require("./redisClient")
const MongoStore = require("connect-mongo")
const mongoose = require("mongoose")

const PORT = process.env.PORT || 8000

const app = express()

// connecting to database
connect.connectDB()
cache.connect();


var corsOption = {
    origin : ["http://localhost:5173/", "http://localhost:8000/", "https://sabitalk.vercel.app/"],
    optionsSuccessStatus: 200 ,
    credentials: true 
};

// app.set('trust proxy', true);
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 10, 
    validate: {
		validationsConfig: false,
		default: true,
	},
	standardHeaders: 'draft-8',
	legacyHeaders: false, 
	
})

require("./auth/google")
app.use(cookieParser())
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({extended : true}))

// dynamic setting secure to true or false
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    store : MongoStore.create({
        // mongoUrl : process.env.MONGODB_CONNECTION_STRING,
        // ttl : 14 * 24 * 60 * 60
        client: mongoose.connection.getClient()
    }),
    // set this to true before deploy
    cookie: { 
        secure: isProduction,
        httpOnly : true,
        sameSite : isProduction ? 'None' : 'Lax'
    } 
}))

app.use(passport.initialize())
app.use(passport.session())

// routes
app.use("/auth", limiter, authRoute)

app.post("/select-language", (req, res)=>{
    const {language} = req.body;
    if(!language){
        res.status(400).json({
            message : "you have to select a language"
        })
    }
    req.session.language = language;

    console.log(req.session)
    res.status(200).json({
        message : `successfully selected ${language}`
    })
})


// OAuth signup and login
app.get("/success", (req, res) => {
    const user = req.user
    if (!user) {
        return res.redirect('/failed');
    }

    console.log("from google oauth", user.email)
    const token = jwt.sign({email:user.email}, process.env.JWT_SECRET, {expiresIn : "1hr"})

    res.cookie('token', token, {
        httpOnly : true,
        secure: isProduction,
        maxAge : 24 * 60 * 60 * 1000,
        sameSite : isProduction ? 'None' : 'Lax'
    })
    const redirectUrl = `https://sabitalk.vercel.app/oauth-success?token=${token}`;
    res.redirect(redirectUrl);
})

app.get("/failed", (req, res) => {
    res.status(400).json({
        success : false,
        data :null,
        message : "failed to login"
    })
})

app.get('/google-auth/login',
    passport.authenticate('google', 
        { 
            scope:[ 'email', 'profile' ] 
        }
    )
);
  
app.get( '/google-auth/callback',
    passport.authenticate( 'google', 
        {
          successRedirect: '/success',
          failureRedirect: '/failed'
        }
    )
);

app.get("/", (req,res)=>{
    res.send("we are live")
})


app.use((error, req, res, next)=>{
    console.log("path: ", req.path)
   
    const StatusCode = error.status || 500
    const message = error.message || "Internal server error"

    res.status(StatusCode).json({
        success : false,
        message 
    })
    next()
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})
