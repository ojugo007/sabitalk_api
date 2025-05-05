const express = require("express")
const {validateLogin, validateSignup, validateResetEmail, validateResetOtp, validateResetNewPwd} = require("../validation/auth.validation")
const authController = require("../controllers/auth.controller")


const route = express.Router()


    
route.post("/signup", validateSignup, authController.Signup)

route.post("/login", validateLogin, authController.Login)
// Reset password routes
route.post("/reset-password",validateResetEmail,  authController.Reset)
route.post("/verify-otp", validateResetOtp, authController.VerifyOtp)
route.post("/reset/new-password",validateResetNewPwd, authController.PasswordChange)

module.exports = route