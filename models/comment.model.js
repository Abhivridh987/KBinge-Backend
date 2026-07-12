const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    movie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Movie",
        required:true
    },

    comment:{
        type:String,
        required:[true, "Add a comment is required"],
        trim:true,
        maxlength:[1000,"Comment cannot exceed 1000 characters"]
    }
},
{
    timestamps:true
});

// Indexes
CommentSchema.index({ movie:1, createdAt:-1 });
CommentSchema.index({ user:1 });

// Prevent one user from reviewing the same movie multiple times (optional)
CommentSchema.index({ user:1, movie:1 }, { unique:true });

const Comment = mongoose.model("Comment", CommentSchema, "Comment");

module.exports = Comment;