
const UsersModel = require("../models/users.model")
const authService = require("../services/auth.service")


const Signup = async(req, res) => {
    const payload = req.body

    const language= req.session.language
    
    if(!language){
        res.status(400).json({
            message : "Language not selected",
        })
    }
    
    if(!payload){
        res.status(400).json({
            message : "all fields are required",
        })
    }

    const newUser = new UsersModel({
        email : payload.email,
        password : payload.password,
        termsAccepted : payload.termsAccepted,
        language 
    })

    const signupResponse = await authService.Signup(newUser)
    
    res.cookie('token', signupResponse.data.token,{ 
        httpOnly: true, 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'Strict',
    })

    res.status(signupResponse.code).json(signupResponse)
    
}

const Login = async(req, res) =>{
    const payload = req.body

    const loginResponse = await authService.Login({
        email : payload.email,
        password : payload.password
    })

    res.cookie('token', loginResponse.data.token, {
        httpOnly: true, 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'Strict',
    })

    res.status(loginResponse.code).json(loginResponse)
}

const Reset = async(req, res) =>{
    const {email} = req.body;
    if(!req.session.email){
        req.session.email = email
    }
    const resetResponse = await authService.Reset({email})
    res.status(resetResponse.code).json(resetResponse)
}

const VerifyOtp = async(req,res) =>{
    const {otp} = req.body
    const email = req.session.email
    console.log(otp, email)
    const otpRespone = await authService.VerifyOtp({otp, email})
    res.status(otpRespone.code).json(otpRespone)
}

const PasswordChange = async(req, res)=>{
    const {password} = req.body
    const email = req.session.email
    const response =  await authService.PasswordChange({email ,password})

    res.status(response.code).json(response)
}


module.exports = {
    Signup,
    Login,
    Reset,
    VerifyOtp,
    PasswordChange
}