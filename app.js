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
const UsersModel = require("./models/users.model")

const PORT = process.env.PORT || 8000

const app = express()

// connecting to database
connect.connectDB()
cache.connect();

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

var corsOption = {
    origin : [
        "http://localhost:5173",
        "http://localhost:8000",
        "https://sabitalk-api.onrender.com",
        "https://sabitalk.vercel.app",
        "https://huge-moose-say.loca.lt"
    ],
    credentials: true,
    methods: ["GET", "POST"],
};

app.use(cors(corsOption))
const passportConfig = require("./auth/google")
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

// dynamic setting secure to true or false
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie: { 
        secure: isProduction,
        httpOnly : true,
        sameSite : isProduction ? 'None' : 'Lax'
    } 
}))

app.use(passport.initialize())
app.use(passport.session())
passportConfig(passport)

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

// test if session is set correctly
app.get("/check-session", (req, res) => {
    console.log("Session data:", req.session);
    res.json({ message: "Session data", session: req.session });
});

// OAuth signup and login
app.get("/success", async(req, res) => {
    console.log("req.session.passport:", req.session.passport);
    const user = req.user
    console.log(user)
    if (!req.user) {
        return res.redirect('/failed');
    }

    const newUser = await UsersModel.findOne({email : req.user.email })
    console.log("old user", newUser)
    const token = await jwt.sign({email:user.email}, process.env.JWT_SECRET, {expiresIn : "1hr"})

    res.cookie('token', token, {
        httpOnly : true,
        secure: isProduction,
        maxAge : 24 * 60 * 60 * 1000,
        sameSite : isProduction ? 'None' : 'Lax'
    })
    res.status(200).json({
        success : true,
        data :{ user, token},
        message : "logged in successfully"
    })
    // const redirectUrl = `https://sabitalk.vercel.app/oauth-success?token=${token}`;
    // res.redirect(redirectUrl);
})

app.get("/failed", (req, res) => {
    console.log("session at failure: ", req.session)
    res.status(400).json({
        success : false,
        data :null,
        message : "failed to login"
    })
})

app.get('/google-auth/login',
    passport.authenticate('google', 
        { 
            scope:[ 'profile', 'email' ],
        }
    )
);
// app.get('/google-auth/callback', (req, res, next) => {
//     passport.authenticate('google', (err, user, info) => {
//         if (err || !user) {
//             return res.redirect('/failed');
//         }

//         // Manually establish login session
//         req.logIn(user, (err) => {
//             if (err) {
//                 return res.redirect('/failed');
//             }

//             // Ensure session is saved before redirect
//             req.session.save(() => {
//                 res.redirect('/success');
//             });
//         });
//     })(req, res, next); // <<< pass req/res/next here
// });

app.get( '/google-auth/callback', passport.authenticate( 'google', {failureRedirect: '/failed'}), (req, res)=>{
    res.redirect('/success');

})


app.get("/", (req,res)=>{
    res.send("we are live")
})


app.use((error, req, res, next)=>{
    console.log("path: ", req.path)
    console.log("session: ", req.session)
    console.log("user: ", req.user)
   
    const StatusCode = error.status || 500
    const message = error.message || "Internal server error"

    res.status(StatusCode).json({
        success : false,
        message ,
        error
    })
    next()
})

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})
