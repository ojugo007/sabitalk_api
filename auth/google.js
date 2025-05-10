const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require("passport");
const UsersModel = require('../models/users.model');
require("dotenv").config()


module.exports = function (passport) {

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_AUTH_CALLBACK,
        passReqToCallback: true
    },

        async function (request, accessToken, refreshToken, profile, done) {
            const userData = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                language: request.session.language || "yoruba",
                termsAccepted: true
            }
            try {
                const userExist = await UsersModel.findOne({ email: userData.email })

                console.log({ "user_exist_google": userExist })

                if (!userExist) {
                    const user = await UsersModel.create(userData)
                    console.log({ "google_user": user })
                    return done(null, user)
                } else {
                    return done(null, userExist);
                }

            } catch (err) {
                return done(null, err)

            }
        }

    ));

    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser(async (email, done) => {
        try {
            const user = await UsersModel.findOne({ email: email });

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            done(err);
        }

    });
}