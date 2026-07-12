const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const path = require('path')
const router = express.Router()
const joi = require('joi')
const mongoose = require('mongoose')

//ENVS
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

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

// Import Models
const User = require(path.join(__dirname, '../models/user.model.js'))
const Movie = require(path.join(__dirname, '../models/movie.model.js'))
const Comment = require(path.join(__dirname, '../models/comment.model.js'))


// JOI
const GetCommentsForMovieValidation = async (req,res,next)=>{

    const MovieSchema = joi.object({
        movieId:joi.string().required().custom((value, helpers)=>{
            if(!mongoose.Types.ObjectId.isValid(value)){
                return helpers.error("any.invalid")
            }
            return value
        })
    })

    const {error} = MovieSchema.validate(req.params)

    if(error){
        return res.status(400).json({
            "message":"JOI: Invalid Movie ID",
            "status":400,
            "ok":false,
            "error":error
        })
    }

    const foundMovie = await Movie.findById(req.params.movieId)

    if(!foundMovie){
        return res.status(404).json({
            "message":"JOI: Movie Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"GetCommentsForMovieValidation"
        })
    }

    next()
}

const GetCommentsForUserValidation = async (req,res,next)=>{

    const UserSchema = joi.object({
        userId:joi.string().required().custom((value, helpers)=>{
            if(!mongoose.Types.ObjectId.isValid(value)){
                return helpers.error("any.invalid")
            }
            return value
        })
    })

    const {error} = UserSchema.validate(req.params)

    if(error){
        return res.status(400).json({
            "message":"JOI: Invalid User ID",
            "status":400,
            "ok":false,
            "error":error
        })
    }

    const foundUser = await User.findById(req.params.userId)

    if(!foundUser){
        return res.status(404).json({
            "message":"JOI: User Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"GetCommentsForUserValidation"
        })
    }

    next()
}

const AddCommentValidation = async (req,res,next)=>{

    const AddCommentSchema = joi.object({

        movie:joi.string().required().custom((value, helpers)=>{
            if(!mongoose.Types.ObjectId.isValid(value)){
                return helpers.error("any.invalid")
            }
            return value
        }),

        comment:joi.string().trim().min(1).max(1000).required()

    })

    const {error} = AddCommentSchema.validate(req.body)

    if(error){
        return res.status(400).json({
            "message":"JOI: Invalid Add Comment Schema",
            "status":400,
            "ok":false,
            "error":error
        })
    }

    const foundMovie = await Movie.findById(req.body.movie)

    if(!foundMovie){
        return res.status(404).json({
            "message":"JOI: Movie Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"AddCommentValidation"
        })
    }

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    const foundUser = await User.findById(decodedToken._id)

    if(!foundUser){
        return res.status(404).json({
            "message":"JOI: User Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"AddCommentValidation"
        })
    }

    const foundComment = await Comment.findOne({
        user:decodedToken._id,
        movie:req.body.movie
    })

    if(foundComment){
        return res.status(409).json({
            "message":"JOI: User Already Commented On This Movie",
            "status":409,
            "ok":false,
            "origin":"AddCommentValidation"
        })
    }

    next()

}

const EditCommentValidation = async (req,res,next)=>{

    const EditCommentSchema = joi.object({

        commentId:joi.string().required().custom((value, helpers)=>{
            if(!mongoose.Types.ObjectId.isValid(value)){
                return helpers.error("any.invalid")
            }
            return value
        }),

        comment:joi.string().trim().min(1).max(1000).required()

    })

    const {error} = EditCommentSchema.validate({
        commentId:req.params.commentId,
        comment:req.body.comment
    })

    if(error){
        return res.status(400).json({
            "message":"JOI: Invalid Edit Comment Schema",
            "status":400,
            "ok":false,
            "error":error
        })
    }

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    const foundComment = await Comment.findById(req.params.commentId)

    if(!foundComment){
        return res.status(404).json({
            "message":"JOI: Comment Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"EditCommentValidation"
        })
    }

    if(foundComment.user.toString() !== decodedToken._id){
        return res.status(403).json({
            "message":"JOI: Unauthorized",
            "status":403,
            "ok":false,
            "origin":"EditCommentValidation"
        })
    }

    next()

}

const DeleteCommentValidation = async (req,res,next)=>{

    const DeleteCommentSchema = joi.object({

        commentId:joi.string().required().custom((value, helpers)=>{
            if(!mongoose.Types.ObjectId.isValid(value)){
                return helpers.error("any.invalid")
            }
            return value
        })

    })

    const {error} = DeleteCommentSchema.validate(req.params)

    if(error){
        return res.status(400).json({
            "message":"JOI: Invalid Delete Comment Schema",
            "status":400,
            "ok":false,
            "error":error
        })
    }

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    const foundComment = await Comment.findById(req.params.commentId)

    if(!foundComment){
        return res.status(404).json({
            "message":"JOI: Comment Doesn't Exist",
            "status":404,
            "ok":false,
            "origin":"DeleteCommentValidation"
        })
    }

    if(foundComment.user.toString() !== decodedToken._id){
        return res.status(403).json({
            "message":"JOI: Unauthorized",
            "status":403,
            "ok":false,
            "origin":"DeleteCommentValidation"
        })
    }

    next()

}

// Import Controllers
const { 
    getCommentsForMovie, 
    getCommentsForUser, 
    addComment, 
    editComment,
    deleteComment, 
} = require(path.join(__dirname, '../controllers/commentController'))

// Routes

// Get comments for a movie
router.get('/comments/:movieId', jwtAuthMiddleware, GetCommentsForMovieValidation ,getCommentsForMovie)

// Get comment history for a user
router.get('/user-comments/:userId', jwtAuthMiddleware, GetCommentsForUserValidation, getCommentsForUser)

// Add comment
router.post('/add-comment', jwtAuthMiddleware, AddCommentValidation, addComment)

// Edit comment
router.put('/edit-comment/:commentId', jwtAuthMiddleware, EditCommentValidation, editComment)

// Delete comment
router.delete('/delete-comment/:commentId', jwtAuthMiddleware, DeleteCommentValidation, deleteComment)


// Export the router
module.exports = router
