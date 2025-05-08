const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require("passport");
const UsersModel = require('../models/users.model');
require("dotenv").config()

passport.serializeUser((user, done)=> {
    done(null, user._id);
});

passport.deserializeUser(async(user, done) =>{
    try {
        const user = await UsersModel.findById(id);
        console.log("deserialized user: ", user)
        done(null, user);
    } catch (err) {
        done(err, null);
    }

});

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_AUTH_CALLBACK,
    passReqToCallback   : true
  },

    async function(request, accessToken, refreshToken, profile, done) {
        console.log(request.session.language)
        const userData = {
            googleId : profile.id,
            username : profile.displayName,
            email : profile.emails[0].value,
            avatar : profile.photos[0].value,
            language : request.session.language || null,
            termsAccepted : true
        }
        try{
            const userExist = await UsersModel.findOne({email: userData.email})

            console.log({"user_exist_google" : userExist})

            if(!userExist){
                const user = await UsersModel.create(userData)
                console.log({"google_user" : user})
                return done(null, user)
            }else {
                return done(null, userExist);
            }
            
        }catch(err){
            return done(null, err)
            
        }
    }
   
));