const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const path = require('path')
const router = express.Router()
const joi = require('joi')
const mongoose = require('mongoose')
const upload = require('../config/multer_config')
//envs

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

//Models

const User = require('../models/user.model')
const OTP = require('../models/otp.model')


// Middlewares
const imgStaticMiddleware = express.static(path.join(__dirname, '../public/images/uploads'))
router.use('/upload', imgStaticMiddleware)

//JWT

const jwtAuthMiddleware = (req,res, next) =>{
    if(req.cookies && req.cookies.token)
    {
        const token = req.cookies.token;
        try{
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }catch(err)
        {
            console.log('Invalid JWT Token');
            res.status(401).json({
                message: 'Invalid JWT Token',
                status:401,
                ok:false
            })
        }
    }
    else{
        console.log('JWT Token is missing in the request');
        res.status(401).json({
            message: 'JWT Token is missing in the request',
            status:401,
            ok:false
        })
    }
}

// JOI
const SignUpValidation = async (req,res,next) =>{
    const SignUpSchema = joi.object({
        username:joi.string().required(),
        email:joi.string().email().required(),
        password:joi.string().required(),
        DOB:joi.date().required(),
        otpId:joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        })
    })
    const {error} = SignUpSchema.validate(req.body)
    if(error)
    {
        return res.status(400).json({
            "message":"JOI: Invalid Sign Up Validation Schema",
            "status":400,
            "ok":false,
            "error":error
        })
    }
    else{
        const foundUser = await User.findOne({email:req.body.email})
        if(foundUser)
        {
            return res.status(400).json({
                "message":"JOI: Email ExistS",
                "status":404,
                "ok":false
            })
        }
        const foundOTP = await OTP.findOne({_id:req.body.otpId}) 
        if (!foundOTP)
        {
            return res.status(404).json({
                "message":"JOI: OTP Session Doesnt Exists",
                "status":404,
                "ok":false
            })
        }
        if(foundOTP.isUsed !== true)
        {
            return res.status(400).json({
                "message":"JOI: OTP Session not verified",
                "status":404,
                "ok":false,
                "origin":"SignUpValidation JOI - OTP Not Verifed"
            })
        }
        if(new Date() > foundOTP.expiresAt)
        {
            return res.status(400).json({
                "message":"JOI: OTP Session Expired",
                "status":404,
                "ok":false,
                "origin":"SignUpValidation JOI - OTP Expired"
            })
        }
        if(foundOTP.purpose !== "sign-up")
        {
            return res.status(400).json({
                "message":"JOI: OTP Session Purpose Error",
                "status":404,
                "ok":false,
                "origin":"SignUpValidation JOI - OTP Purpose Error"
            })
        }
        if(foundOTP.email !== req.body.email)
        {
            return res.status(400).json({
                "message":"JOI: OTP Session Email Not Matching",
                "status":404,
                "ok":false,
                "origin":"SignUpValidation JOI - OTP Email Matching Error"
            })
        }
        
        
        next();
    }
}

const LoginInValidation = async (req,res,next) =>{
    const LoginInSchema = joi.object({
        email:joi.string().email().required(),
        password:joi.string().required()
    })
    const {error} = LoginInSchema.validate(req.body)
    if(error)
    {
        return res.status(400).json({
            "message":"JOI: Invalid Login In Validation Schema",
            "status":404,
            "ok":false,
            "error":error,
            "origin":"Login Validation Schema - Validation Error"
        })
    }
    else{
        const foundUser = await User.findOne({email:req.body.email})
        if(!foundUser){
            return res.status(404).json({
                "message":"Invalid Email",
                "status":404,
                "ok":false,
                "origin": "Login Validation Schema - User Not Found"
            })
        }
        next();
    }
}

const OTPSendingValidation = async (req, res, next) => {
    const OTPSendingSchema = joi.object({
        email: joi.string().email().required(),
        purpose: joi.string().valid('sign-up', 'forgot-password').required()
    });

    const { error } = OTPSendingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            status: 400,
            ok: false,
            error: error
        });
    }

    const foundUser = await User.findOne({ email: req.body.email });

    // For sign-up: user should NOT exist
    if (req.body.purpose === 'sign-up' && foundUser) {
        return res.status(409).json({
            message: "User with this email already exists",
            status: 409,
            ok: false
        });
    }

    // For forgot-password: user MUST exist
    if (req.body.purpose === 'forgot-password' && !foundUser) {
        return res.status(404).json({
            message: "No account found with this email",
            status: 404,
            ok: false
        });
    }

    next();
};

const OTPVerificationValidation = async (req,res,next) => {
    const OTPVerificationSchema = joi.object({
        otpId:joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }),
        otp:joi.string().pattern(/^\d{6}$/).required()
    })
    const {error} = OTPVerificationSchema.validate(req.body)
    if(error)
    {
        return res.status(400).json({
            "message":"JOI: Invalid Sign Up Validation Schema",
            "status":400,
            "ok":false,
            "error":error,
            "origin":"JOI OTPVerificationValidation Invalid Schema"
        })
    }
    else{
        const foundOTP = await OTP.findOne({_id:req.body.otpId}) 
        if (!foundOTP)
        {
            return res.status(404).json({
                "message":"JOI: OTP Session Doesnt Exists",
                "status":404,
                "ok":false
            })
        }
        // Check if OTP is valid (not expired, not used)
        if (!foundOTP.isValid()) {
            return res.status(400).json({
                message: "OTP has expired or already been used",
                status: 400,
                ok: false
            });
        }
        next();
    }
}

const ResetPasswordValidation = async (req,res,next)=>{
    const ResetPasswordSchema = joi.object({
        otpId:joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }),
        password:joi.string().required(),
        email:joi.string().email().required()
    })

    const {error} = ResetPasswordSchema.validate(req.body)
    if(error)
    {
        return res.status(400).json({
            "message":"JOI: Invalid Sign Up Validation Schema",
            "status":400,
            "ok":false,
            "error":error
        })
    }
    else{
        const foundOTP = await OTP.findOne({_id:req.body.otpId}) 
        if (!foundOTP)
        {
            return res.status(404).json({
                "message":"JOI: OTP Session Doesnt Exists",
                "status":404,
                "ok":false,
                "origin":"ResetPasswordValidation - OTP Not Session"
            })
        }

        if (foundOTP.isUsed !== true)
        {
            return res.status(404).json({
                "message":"JOI: OTP Session Not Verified",
                "status":404,
                "ok":false,
                "origin":"ResetPasswordValidation - OTP Not Verified"
            })
        }
        if(new Date() > foundOTP.expiresAt)
        {
            return res.status(400).json({
                "message":"JOI: OTP Session Expired",
                "status":404,
                "ok":false,
                "origin":"ResetPasswordValidation JOI - OTP Expired"
            })
        }
        if(foundOTP.purpose !== "forgot-password")
        {
            return res.status(400).json({
                "message":"JOI: OTP Session Purpose Error",
                "status":404,
                "ok":false,
                "origin":"ResetPasswordValidation JOI - OTP Purpose Error"
            })
        }
        if (req.body.email != foundOTP.email)
        {
            return res.status(404).json({
                "message":"JOI: OTP Email doesnt verify user email",
                "status":404,
                "ok":false,
                "origin":"ResetPasswordValidation - Email Mismatch"
            })
        }
        
        const foundUser = await User.findOne({email:req.body.email}) 
        if (!foundUser)
        {
            return res.status(404).json({
                "message":"JOI: User with this email Doesnt Exists",
                "status":404,
                "ok":false,
                "origin":"ResetPaswordValidation "
            })
        }

        
        next();
    }
}

const changePasswordValidation = async (req,res,next) =>{
    const changePasswordSchema = joi.object({
        oldPassword:joi.string().required(),
        newPassword:joi.string().required()
    })

    const {error} = changePasswordSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            message:"Error in JOI changePasswordValidation Schema",
            status:200,
            ok:false,
            err:error,
            origin:"changePasswordSchema JOI - Error in Validation"
        })
    }
    try{
        const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)
        const foundUser = await User.findOne({_id:decodedToken._id})
        
        if(!foundUser){
            return res.status(404).json({
                message:"User Not Found",
                status:404,
                ok:false,
                origin:"changePasswordSchema JOI - Error in Validation"
            })
        }

        const isMatch = await bcrypt.compare(req.body.oldPassword, foundUser.password)
        if (!isMatch){
            return res.status(404).json({
                "message":"Incorrect Password",
                "status":404,
                "ok":false,
                "origin": "changePasswordValidation JOI - Incorrect Password"     
            })
        }
        next()

    }catch(err){
        return res.status(500).json({
            message:"Error in Finding User",
            status:500,
            ok:false,
            error:err,
            origin:"changePasswordValidation JOI - Server Error"
        })
    }
}

// Paths

const authControllerPath = path.join(__dirname, '..', 'controllers', 'authController.js')

// Controllers

const {
    userSignUp,
    userSignUpSendOTP,
    userSignUpVerifyOTP,

    userLogin,

    userForgotSendOTP,
    userForgotVerifyOTP,
    userResetPassword,

    currentUser,

    changePassword,

    userLogout,

    userProfilePicUpload,

    userProfilePicDelete,

    showProfilePic

} = require(authControllerPath)

//Routes

router.get('/', (req,res)=>{
    return res.status(200).json({
        message:"KBinge Auth Root Reached",
        status:200,
        ok:true,
        origin:"Auth Root"
    })
})

//Sign Up Routes
router.post('/signup', SignUpValidation, userSignUp)
router.post('/sign-up/send-otp', OTPSendingValidation, userSignUpSendOTP)
router.post('/sign-up/verify-otp', OTPVerificationValidation ,userSignUpVerifyOTP)


//Forgot Password Routes
router.post('/forgot-password/send-otp', OTPSendingValidation, userForgotSendOTP);
router.post('/forgot-password/verify-otp', OTPVerificationValidation,userForgotVerifyOTP);
router.put('/forgot-password/reset',ResetPasswordValidation , userResetPassword);

//Login Routes
router.post('/login',LoginInValidation, userLogin)

//Current User
router.get('/me', jwtAuthMiddleware, currentUser)

//Change Password
router.put('/change-password', jwtAuthMiddleware, changePasswordValidation, changePassword)

//Logout
router.post('/logout', jwtAuthMiddleware, userLogout)

//Change Profile Pic
router.post('/change-profile-pic', jwtAuthMiddleware, upload.single('profilePic'), userProfilePicUpload)

// Delete Profile Pic

router.delete('/delete-profile-pic', jwtAuthMiddleware, userProfilePicDelete)

//Show Profile Pic

router.get('/show-profile-pic', jwtAuthMiddleware, showProfilePic)



module.exports = router