const UsersModel = require("../models/users.model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const otpGenerator = require('otp-generator')
const cache = require("../redisClient")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")


function generateToken(val){
    return jwt.sign({email : val}, process.env.JWT_SECRET, { expiresIn : "1hr"})
}

const Signup = async({email, password, termsAccepted, language}) =>{
    
    try{
        if (!termsAccepted) {
            return {
              code: 400,
              success: false,
              data: null,
              message: "You must agree to the Terms and Conditions to sign up."
            };
        }

        const userExist = await UsersModel.findOne({email})

        if(userExist){
            return({
                code : 409,
                success : false,
                data : null,
                message: "Email already exist"
            })
        }

        const user = await UsersModel.create({email, password, termsAccepted, language })
        
        const token = generateToken(user.email)
        
        return({
            success: true,
            code : 201,
            data: {user, token},
            message : "signed up successfully"
        })

    }catch(error){
        return({
            code : 500,
            success : false,
            data : null,
            message: "server error, unable to create account"
        })
    }
}

const Login = async({email, password}) =>{
    if(!email || !password){
        return{
            success : false,
            code : 400,
            data : null,
            message : "both fields are required"
        }
    }

    try{
        const user = await UsersModel.findOne({email});
        if(!user){
            return{
                success : false,
                data : null,
                code : 404,
                message : "Invalid email address"
            }
        }

        const isPasswordValid = await user.validatePass(password)
        if(!isPasswordValid){
            return{
                success : false,
                data : null,
                code : 404,
                message : "Invalid password"
            }
        }

        const token = generateToken(user.email)
        
        return{
            code : 200,
            success: true,
            data : {
                user,
                token
            },
            message : "login successful"
        }
        
    }catch(error){
        return({
            code : 500,
            success : false,
            data : null,
            message: "server error, unable to log into account"
        })
    }
}

const Reset = async({email})=>{
    try{
        if(!email){
            return({
                code : 400,
                success : false,
                data : null,
                message : "your email is required to reset password"
            })
        }

        const userExist = await UsersModel.findOne({email})
        if(!userExist){
            return({
                code : 404,
                success : false,
                data : null,
                message : "account with the email does not exist"
            })
        }

        const otp = otpGenerator.generate(6, {digits: true, lowerCaseAlphabets:false, upperCaseAlphabets: false, specialChars: false });

        const key = `otp:${userExist.email}`

        await cache.redis.set(key, otp, { EX: 5 * 60 })

        const CONFIG = {
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_PSWD
            },
            tls: {
                rejectUnauthorized: false,
            }
        };
        const transporter = nodemailer.createTransport(CONFIG);

        const message = `here is your otp:${otp}, it expires in 5mins`
        const customSubject = `Hello ${userExist.username || userExist.email.split("@")[0]}`
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL, 
            to: userExist.email,
            subject: customSubject, 
            text: message, 
            html: `<b>${message}</b>`,
        });

   
        const costumMessage = `your otp has been sent to ${userExist.email}`
        return({
            success : true,
            code : 200,
            message : costumMessage,
            data : null,
        })
    }catch(err){
        return({
            success : false,
            code : 500,
            message: err.message,
            data : null
        })
    }

}

const VerifyOtp = async({otp, email}) =>{
    console.log(email)
    console.log(otp)
    try{
        if(!otp){
            return({
                code : 400,
                success : false,
                data : null,
                message : "enter the otp sent to your email"
            })
        }
        const key = `otp:${email}`
        console.log('redis key from service', key)
        const oneTimePassword = await cache.redis.get(key)
        console.log('redis OTP from service', oneTimePassword)

        if(!oneTimePassword){
            return({
                code : 400,
                success : false,
                data : null,
                message : "otp already expired"
            })
        }

        console.log("does passed otp covert to number",Number(otp))
        console.log( "does otp from redis covert to number", Number(oneTimePassword))
        console.log( "does otp from redis typeof", typeof(oneTimePassword))
        console.log( "does otp from redis typeof", typeof(otp))
        console.log( Number(otp) !== Number(oneTimePassword))

        if(Number(otp) !== Number(oneTimePassword)){
            return({
                code : 400,
                success : false,
                data : null,
                message : "You entered an invalid otp"
            })
        }

        const verifiedKey = `otp_verified:${email}`
        await cache.redis.set(verifiedKey, "true", {EX : 6 * 60})

        return({
            code : 200,
            success : true,
            data : null,
            message : "otp verification was successful"
        })

    }catch(error){
        return({
            code : 500,
            success : false,
            data : null,
            message : "server error unable to verify token" + error
        })
    }
}

const PasswordChange = async({email, password})=>{
    try{

        if(!email || !password){
            return({
                code : 400,
                success : false,
                data : null,
                message : "Enter a new password"
            })
        }
    
        const verifiedKey = `otp_verified:${email}`
        const isVerified = await cache.redis.get(verifiedKey)
    
        if(!isVerified){
            return({
                code : 401,
                success : false,
                data : null,
                message : "OTP verification required before changing password"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const updatedUser = await UsersModel.findOneAndUpdate({email}, {password : hashedPassword }, {new :true})
        if(!updatedUser){
            return({
                code : 404,
                success : false,
                data : null,
                message : "user not found"
            })
        }

        await cache.redis.del(verifiedKey)

        return({
            code : 200,
            success : true,
            data : updatedUser,
            message : "password  reset was successful"
        })
        
    }catch(error){
        return({
            code : 500,
            success : false,
            data : null,
            message : "server error" + error.message
        })

    }

}


module.exports = {
    Signup,
    Login,
    Reset,
    VerifyOtp,
    PasswordChange
}