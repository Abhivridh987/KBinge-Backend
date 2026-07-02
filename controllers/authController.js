const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const path = require('path')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const upload = require('../config/multer_config')


//Paths
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

//Models
const User = require('../models/user.model')
const OTP = require('../models/otp.model')



const userSignUp = async (req, res) => {
    const {username, email, password, DOB, otpId} = req.body
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            DOB,
            favorites: []
        })

        const savedUser = await newUser.save({ session })
        await OTP.deleteOne({ _id: otpId }, { session })

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: 'User signed up successfully',
            status: 201,
            ok: true,
            origin:"userSignUp Controller"
        })

    } catch (err) {
        
        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            message: "Error while saving new User",
            status: 500,
            ok: false,
            error: err,
            origin: "userSignUp controller, Transaction Error"
        })
    }
}

const userSignUpSendOTP = async (req,res) =>{
    const {email, purpose} = req.body

    if (purpose != "sign-up"){
        return res.status(400).json({
            "message":"Invalid Purpose",
            status:400,
            ok:false,
            origin:"userSignUpController, Purpose Section"
        })
    }
    const generateOTP = () =>{
        return crypto.randomInt(100000, 999999).toString()
    }

    const OTPGenerated = generateOTP()
    const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    try{
        await OTP.deleteMany({
            email:email, 
            purpose:purpose, 
            isUsed:false
        })
        const newOTP = new OTP({
            email:email,
            otp:OTPGenerated,
            expiresAt: expiresAt,
            purpose:purpose
        })
        try{

            const savedOTP = await newOTP.save()
            console.log("EMAIL_USER:", process.env.EMAIL_USER);
            console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "UNDEFINED");
            // send mail code
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            try{
                const info = await transporter.sendMail({
                    from: `"KBinge" <${process.env.EMAIL_USER}>`,
                    to:email,
                    subject:'Your OTP Code',
                    text:`Your OTP is ${OTPGenerated}, Valid for 10 minutes`,
                    html:`<div style="text-align: center;"><h2>Your OTP is: <b>${OTPGenerated}</b></h2></div>`,
                });
                console.log('Email sent:', info.messageId);
            }catch (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({
                    message:"Error while sending OTP",
                    status:500,
                    ok:false,
                    error:err,
                    origin:"userSignUpSendOTP controller, Error in Sending OTP"
                })
            }

            return res.status(200).json({
                message:"OTP Send and Saved",
                status:200,
                ok:true,
                otpId: savedOTP._id,
                origin:"userSignUpSendOTP controller"
            })
        }catch(err){
            return res.status(500).json({
                message:"Error while saving new OTP",
                status:500,
                ok:false,
                error:err,
                origin:"userSignUpSendOTP controller, Error in saving OTP or Mail"
            })
        }
    }catch(err){
        return res.status(500).json({
            message:"Error while saving new OTP or Deleting OTPs",
            status:500,
            ok:false,
            error:err,
            origin:"userSignUpSendOTP controller, Error in creating OTP"
        })
    }

}

const userSignUpVerifyOTP = async (req,res) =>{
    const {otpId, otp} = req.body

    try{
        const foundOTP = await OTP.findOne({_id:otpId})
        
        if (foundOTP.purpose !== 'sign-up')
        {
            return res.status(400).json({
                message:"Invalid OTP Purpose",
                status:400,
                ok:false,
                origin:"UserSignUpVerifyOTP"
            })
        }
        //OTP Validation
        if (foundOTP.otp !== otp){
            return res.status(400).json({
                message:"Invalid OTP",
                status:400,
                ok:false,
                origin:"UserSignUpVerifyOTP"
            })
        }
        foundOTP.isUsed = true
        try{
            await foundOTP.save()
            return res.status(200).json({
                message:"OTP Verified Successfully",
                status:200,
                ok:true,
                otpId:otpId,
                origin:"UserSignUpVerifyOTP - Verified Section"
            })
        }catch(err){
            return res.status(500).json({
                message:"OTP Not Updated ",
                status:500,
                ok:false,
                error:err,
                origin:"UserSignUpVerifyOTP - Not Saved Section"
            })
        }

    }catch(err){
        return res.status(500).json({
            message:"OTP Not Updated ",
            status:500,
            ok:false,
            error:err,
            origin:"UserSignUpVerifyOTP - Not Saved Section"
        })
    }
}

const userLogin = async (req,res) =>{
    const {email, password} = req.body
    
    try{
        const foundUser = await User.findOne({email:email})
        if (!foundUser) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
                ok: false,
                origin: "userLogin"
            })
        }
        const isMatch = await bcrypt.compare(password, foundUser.password)
        if (!isMatch){
            return res.status(404).json({
                "message":"Incorrect Password",
                "status":400,
                "ok":false,
                "origin": "userLogin - Incorrect Password"     
            })
        }
        const token = jwt.sign({
            email: foundUser.email, 
            username: foundUser.username, 
            _id: foundUser._id, 
            admin:foundUser.admin, 
            favorites:foundUser.favorites
        }, JWT_SECRET, {expiresIn:'1d'});

        res.cookie("token", token, {
            httpOnly:true,
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });
        const decodedToken = jwt.verify(token, JWT_SECRET)

        res.status(200).json({
            message: 'Login successful',
            status: 200,
            ok: true,
            token: token,
            decodedToken: decodedToken
        });
    }catch(err){
        return res.status(500).json({
            "message":"Error in Logging in",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"userLogin - Unsuccessful User Finding or Tokenisation"
        })
    }
}

const userLogout = async (req,res) =>{
    res.clearCookie('token');
    res.status(200).json({
        message:"Logout Successfully",
        status:200,
        ok:true
    })
}

const currentUser = async (req,res) =>{
    try{
        const currUser = jwt.verify(req.cookies.token, JWT_SECRET)
        res.status(200).json({
            message:"Current User Extracted",
            status:200,
            ok:true,
            token:req.cookies.token,
            currUser:currUser   
        })
    }catch(err){
        res.status(500).json({
            message:"Tokenisation Unsuccessfull",
            status:500,
            ok:true,
            token:req.cookies.token,
            error:err,
            origin:"Current User - Tokenisation Error"
        })
    }
    
}

const changePassword = async (req,res) =>{
    const {oldPassword, newPassword} = req.body
    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)
    try{
        const foundUser = await User.findOne({_id:decodedToken._id})
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
        foundUser.password = hashedPassword
        await foundUser.save()
        return res.status(200).json({
            message:"Password Changed Successfully",
            status:200,
            ok:true,
            origin:"changePassword Controller"
        })
    }catch(err){
        return res.status(500).json({
            message:"Server Error",
            status:500,
            ok:false,
            error:err,
            origin:"changePassword Controller"
        })
    }
}

const userForgotSendOTP = async (req,res) =>{
    const {email, purpose} = req.body

    if (purpose != "forgot-password"){
        return res.status(400).json({
            "message":"Invalid Purpose",
            status:400,
            ok:false,
            origin:"userSendForgotOTP, Purpose Section"
        })
    }
    const generateOTP = () =>{
        return crypto.randomInt(100000, 999999).toString()
    }

    const OTPGenerated = generateOTP()
    const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    try{
        await OTP.deleteMany({
            email:email, 
            purpose:purpose, 
            isUsed:false
        })
        const newOTP = new OTP({
            email:email,
            otp:OTPGenerated,
            expiresAt: expiresAt,
            purpose:purpose
        })
        try{

            const savedOTP = await newOTP.save()
            // send mail code
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            try{
                const info = await transporter.sendMail({
                    from: `"KBinge" <${process.env.EMAIL_USER}>`,
                    to:email,
                    subject:'Your OTP Code',
                    text:`Your OTP is ${OTPGenerated}, Valid for 10 minutes`,
                    html:`<div style="text-align: center;"><h2>Your OTP is: <b>${OTPGenerated}</b></h2></div>`,
                });
                console.log('Email sent:', info.messageId);
            }catch (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({
                    message:"Error while sending OTP",
                    status:500,
                    ok:false,
                    error:err,
                    origin:"userForgotSendOTP controller, Error in Sending OTP"
                })
            }

            return res.status(200).json({
                message:"OTP Send and Saved",
                status:200,
                ok:true,
                otpId: savedOTP._id,
                origin:"userForgotSendOTP controller"
            })
        }catch(err){
            return res.status(500).json({
                message:"Error while saving new OTP",
                status:500,
                ok:false,
                error:err,
                origin:"userForgotSendOTP controller, Error in saving OTP or Mail"
            })
        }
    }catch(err){
        return res.status(500).json({
            message:"Error while saving new OTP or Deleting OTPs",
            status:500,
            ok:false,
            error:err,
            origin:"userForgotSendOTP controller, Error in creating OTP"
        })
    }

}

const userForgotVerifyOTP = async (req,res) =>{
    const {otpId, otp} = req.body

    try{
        const foundOTP = await OTP.findOne({_id:otpId})
        
        //Pupose Checking
        if (foundOTP.purpose !== 'forgot-password')
        {
            return res.status(400).json({
                message:"Invalid OTP Purpose",
                status:400,
                ok:false,
                origin:"UserSignUpVerifyOTP"
            })
        }
        //OTP Validation
        if (foundOTP.otp !== otp){
            return res.status(400).json({
                message:"Invalid OTP",
                status:400,
                ok:false,
                origin:"UserForgotVerify OTP"
            })
        }
        foundOTP.isUsed = true
        try{
            await foundOTP.save()
            return res.status(200).json({
                message:"OTP Verified Successfully",
                status:200,
                ok:true,
                otpId:otpId,
                origin:"UserSignUpVerifyOTP - Verified Section"
            })
        }catch(err){
            return res.status(500).json({
                message:"OTP Not Saved ",
                status:500,
                ok:false,
                error:err,
                origin:"UserForgotVerifyOTP - Not Saved Section"
            })
        }

    }catch(err){
        return res.status(500).json({
            message:"OTP Not Updated",
            status:500,
            ok:false,
            error:err,
            origin:"UserSignUpVerifyOTP - Not Created Section"
        })
    }
}

const userResetPassword = async (req,res) =>{
    const {otpId, password, email} = req.body
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const session = await mongoose.startSession()
    await session.startTransaction()

    try{
        const foundUser = await User.findOne({email:email}).session(session)
        foundUser.password = hashedPassword
        await foundUser.save({session:session})
        await OTP.deleteOne({ _id: otpId }, {session:session})

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            "message":"User Reset Password Successfull",
            "status":200,
            "ok":true,
            "origin":"userResetPassword Controller - Reset Password Successfull"
        })

    }catch(err){

        await session.abortTransaction()
        session.endSession()


        return res.status(500).json({
            "message":"User Reset Password Unsuccessful",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"UserResetPassword Controller "
        })
    }
}

const userProfilePicUpload = async (req,res)=>{
    if(!req.file){

        return res.status(400).json({
            message:"Profile Pic Unsuccesfull",
            "status":400,
            ok:false,
            origin:"userProfilePicUploaded Controller - Pic not uploaded successfully"
        })
    }

    try{
        const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET) 
        const foundUser = await User.findOne({_id:decodedToken._id})
        foundUser.profilePic = req.file.filename
        await foundUser.save()
        res.status(200).json({
            "message":"Profile Pic Successfully Uploaded",
            "status":200,
            ok:true,
            file:req.file,
            origin:"userProfilePic"
        })
    }catch(err){
        return res.status(500).json({
            message:"Server Error , Profile Pic Unsuccesful",
            "status":500,
            ok:false,
            error:err,
            origin:"userProfilePicUploaded Controller"
        })
    }
}

const userProfilePicDelete = async (req,res) =>{
    try{
        const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET) 
        const foundUser = await User.findOne({_id:decodedToken._id})
        foundUser.profilePic = "default.webp"
        await foundUser.save()
        res.status(200).json({
            "message":"Profile Pic Successfully Deleted",
            "status":200,
            ok:true,
            origin:"userProfilePic"
        })
    }catch(err){
        return res.status(500).json({
            message:"Server Error , Profile Pic Delete Unsuccesful",
            "status":500,
            ok:false,
            error:err,
            origin:"userProfilePicDelete Controller"
        })
    }
}

const showProfilePic = async (req,res) =>{
    try{
        const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)
        const foundUser = await User.findOne({_id:decodedToken._id})
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Profile Pic</title>
            </head>

            <body>
                <h1>Profile Picture</h1>

                <img
                    src="upload/${foundUser.profilePic}"
                    width="300"
                />
            </body>

            </html>
        `)
    }catch(err){
        res.status(500).json({
            ok:false,
            status:500
        })
    }
}
module.exports = {
    userSignUp,
    userSignUpSendOTP,
    userSignUpVerifyOTP,
    userLogin,
    userLogout,
    currentUser,
    changePassword,
    userForgotSendOTP,
    userForgotVerifyOTP,
    userResetPassword,
    userProfilePicUpload,
    userProfilePicDelete,
    showProfilePic
}