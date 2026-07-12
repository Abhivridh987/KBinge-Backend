const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const Comment = require("../models/comment.model.js")

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

const getCommentsForMovie = async (req,res)=>{

    try{

        const comments = await Comment.find({movie:req.params.movieId})
        .populate("user","username profilePic")
        .sort({createdAt:-1})

        return res.status(200).json({
            "message":"Comments Retrieved Successfully",
            "status":200,
            "ok":true,
            "comments":comments,
            "origin":"getCommentsForMovie Controller"
        })

    }catch(err){

        return res.status(500).json({
            "message":"Unable To Retrieve Comments",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"getCommentsForMovie Controller"
        })

    }

}



const getCommentsForUser = async (req,res)=>{

    try{

        const comments = await Comment.find({user:req.params.userId})
        .populate("movie","Name Year img url")
        .sort({createdAt:-1})

        return res.status(200).json({
            "message":"User Comments Retrieved Successfully",
            "status":200,
            "ok":true,
            "comments":comments,
            "origin":"getCommentsForUser Controller"
        })

    }catch(err){

        return res.status(500).json({
            "message":"Unable To Retrieve User Comments",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"getCommentsForUser Controller"
        })

    }

}


const addComment = async (req,res)=>{

    const decodedToken = jwt.verify(req.cookies.token, JWT_SECRET)

    const session = await mongoose.startSession()
    await session.startTransaction()

    try{

        await Comment.create([
            {
                user:decodedToken._id,
                movie:req.body.movie,
                comment:req.body.comment
            }
        ],{session})

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            "message":"Comment Added Successfully",
            "status":201,
            "ok":true,
            "origin":"addComment Controller"
        })

    }catch(err){

        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            "message":"Unable To Add Comment",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"addComment Controller"
        })

    }

}


const editComment = async (req,res)=>{

    const session = await mongoose.startSession()
    await session.startTransaction()

    try{

        const foundComment = await Comment.findById(req.params.commentId).session(session)

        foundComment.comment = req.body.comment

        await foundComment.save({session})

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            "message":"Comment Updated Successfully",
            "status":200,
            "ok":true,
            "origin":"editComment Controller"
        })

    }catch(err){

        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            "message":"Unable To Update Comment",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"editComment Controller"
        })

    }

}

const deleteComment = async (req,res)=>{

    const session = await mongoose.startSession()
    await session.startTransaction()

    try{

        await Comment.deleteOne(
            {_id:req.params.commentId},
            {session}
        )

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            "message":"Comment Deleted Successfully",
            "status":200,
            "ok":true,
            "origin":"deleteComment Controller"
        })

    }catch(err){

        await session.abortTransaction()
        session.endSession()

        return res.status(500).json({
            "message":"Unable To Delete Comment",
            "status":500,
            "ok":false,
            "error":err,
            "origin":"deleteComment Controller"
        })

    }

}



module.exports = {
    getCommentsForMovie,
    getCommentsForUser,
    addComment,
    editComment,
    deleteComment
}