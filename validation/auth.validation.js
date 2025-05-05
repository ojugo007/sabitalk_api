const joi = require("joi")


const authSignupSchema = joi.object({
    email : joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password : joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .required(),

    termsAccepted:joi.boolean()
        .required(),
    
})

const authLoginSchema = joi.object({
    email : joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password : joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .required(),
})

const authResetSchema = joi.object({
    email : joi.string()
    .email({minDomainSegments: 2, tlds: { allow: ['com', 'net'] }})
    .required()
})

const authOtpSchema = joi.object({
    otp : joi.number()
    .required()
})

const authNewPasswordSchema = joi.object({
    password : joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
    .required(),
})

const validateSignup = async(req, res, next)=>{
    const authPayload = req.body

    try{
        await authSignupSchema.validateAsync(authPayload)
        next()
    }catch(error){
        next({
            status : 400,
            message : error.message
        })
    }
}

const validateLogin = async(req, res, next)=>{
    const authPayload = req.body;
    try{
        await authLoginSchema.validateAsync(authPayload)
        next()
    }catch(error){
        next({
            status : 400,
            message : error.message
        })
    }
}

const validateResetEmail = async(req, res, next)=>{
    const authPayload = req.body;
    console.log(authPayload)
    try{
        await authResetSchema.validateAsync(authPayload)
        next()
    }catch(error){
        next({
            status : 400,
            message : error.message
        })
    }
}

const validateResetOtp = async(req, res, next)=>{
    const authPayload = req.body;
    try{
        await authOtpSchema.validateAsync(authPayload)
        next()
    }catch(error){
        next({
            status : 400,
            message :  error.message

        })
    }
}

const validateResetNewPwd = async(req, res, next)=>{
    const authPayload = req.body;
    try{
        await authNewPasswordSchema.validateAsync(authPayload)
        next()
    }catch(error){
        next({
            status : 400,
            message : error.message

        })
    }
}

module.exports = {
    validateSignup,
    validateLogin,
    validateResetEmail,
    validateResetOtp,
    validateResetNewPwd
}