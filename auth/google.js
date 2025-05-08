const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require("passport");
const UsersModel = require('../models/users.model');
require("dotenv").config()

passport.serializeUser((user, done)=> {
    console.log("serialized user: ", user._id);
    done(null, user._id);
});

passport.deserializeUser( async(id, done) =>{
    console.log("Deserializing user with ID:", id);
    try {
        const user = await UsersModel.findById(id);
        console.log("User found during deserialization:", user)
        done(null, user);
    } catch (err) {
        console.error("Error during deserialization:", err); 
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
        const userData = {
            googleId : profile.id,
            username : profile.displayName,
            email : profile.emails[0].value,
            avatar : profile.photos[0].value,
            language : request.session.language || "yoruba",
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