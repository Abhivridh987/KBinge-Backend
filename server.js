// Imports


//Access Environment Variables
require('dotenv').config()
const PORT= Number(process.env.PORT) || 5050
const MONGO_URI=process.env.MONGO_URI
const JWT_SECRET=process.env.JWT_SECRET

//Basic Imports
const os = require('os')
const fs = require('fs')
const path = require('path')
const express = require('express') 
const cors = require('cors')

//Authentication Imports
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Server Imports
const app = express()

//API Documentation Imports
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger/swagger')

// Database Imports
const mongoose = require('mongoose')



// Paths

const authRouterPath = path.join(__dirname, 'routes', 'authRouter.js')
const movieRouterPath = path.join(__dirname, 'routes', 'movieRouter.js')
const adminRouterPath = path.join(__dirname, 'routes', 'adminRouter.js')
const userModelPath = path.join(__dirname, 'models', 'user.model.js')

//Models

const User = require(userModelPath)

// Middleware

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

const jwtAuthAdminMiddleware = async (req,res, next) =>{
    if(req.cookies && req.cookies.token)
    {
        const token = req.cookies.token;
        try{
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            const foundUser = await User.findOne({_id:decoded._id})
            if(!foundUser){
                return res.status(401).json({
                    "message":"User Not Found in DB",
                    status:401,
                    ok:false,
                    origin:"jwtAdminAuthMiddleware - No User Found"
                })
            }

            if(foundUser.admin !== true){
                return res.status(401).json({
                    "message":"User Not an Admin",
                    status:401,
                    ok:false,
                    origin:"jwtAdminAuthMiddleware - User Not An Admin"
                })
            }
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


const logData = (req,res,next) =>{
    console.log(`HTTPS REQUEST : ${req.method} ${req.headers.host}${req.url}`)
    next()
}



app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(logData)





//Routes
const authRouter = require(authRouterPath)
app.use('/auth', authRouter)

const movieRouter = require(movieRouterPath)
app.use('/home', jwtAuthMiddleware, movieRouter)

const adminRouter = require(adminRouterPath)
app.use('/admin', jwtAuthAdminMiddleware, adminRouter)

const commentRouter = require(path.join(__dirname, 'routes', 'commentRouter.js'))
app.use('/comments', jwtAuthMiddleware, commentRouter)

app.get('/', (req,res)=>{
    return res.status(200).json({
        message:"KBinge Server Root Running", 
        status:200,
        ok:true,
        origin:"App Root"
    })
})

//API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Setting the Server

mongoose.connect(MONGO_URI)
.then(()=>{
    console.log(`Mongo DB Successfully Connected`)
    app.listen(PORT, ()=>{
        console.log(`Server is Running in PORT ${PORT}`)
    })
})
.catch((err)=>{
    console.log(`Error Occured while Cnnecting to Database : `)
    console.log(err)
})