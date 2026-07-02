const Movie = require("../models/movie.model");

const addMovie = async(req, res) => {
    try {
        const lastMovie=await Movie.findOne().sort({ "Unnamed: 0":-1 });

        const nextNumber=lastMovie? lastMovie.get("Unnamed: 0")+1:1;
        console.log(nextNumber)
        const movie=await Movie.create({
            ...req.body,
            "Unnamed: 0":nextNumber
        });

        res.status(201).json({
            message:"Movie Adding Successfull",
            ok: true,
            status:201,
            data: movie,
            "origin":"AddMovieController"
        });

    } catch(err) {
        res.status(500).json({
            ok: false,
            status:500,
            error: err,
            message:"Movie Adding Unsuccessfull",
            "origin":"AddMovieController"
        });
    }
};


const updateMovie = async(req, res) => {
    try {
        const { id, ...updatedData } = req.body;

        const movie = await Movie.findByIdAndUpdate(
            id,
            updatedData,
            {
                new: true,
                runValidators: true
            }
        );

        if(!movie){
            return res.status(404).json({
                ok:false,
                status:404,
                message:"Movie not found",
                "origin":"UpdateMovieController"
            });
        }

        res.status(200).json({
            message:"Movie Updation Successfull",
            ok: true,
            status:201,
            "origin":"UpdateMovieController"
        });

    } catch(err) {
        res.status(500).json({
            ok: false,
            status:500,
            error: err,
            message:"Movie Updation Unsuccessfull",
            "origin":"UpdateMovieController"
        });
    }
};


const deleteMovie = async(req, res) => {
    try {
        const { id } = req.body;

        const movie = await Movie.findByIdAndDelete(id);

        if(!movie){
            return res.status(404).json({
                ok:false,
                status:404,
                message:"Movie not found",
                "origin":"DeleteMovieController"
            });
        }

        res.status(200).json({
            message:"Movie Deletion Successfull",
            ok: true,
            status:201,
            "origin":"DeleteMovieController"
        });

    } catch(err) {
        res.status(500).json({
            ok: false,
            status:500,
            error: err,
            message:"Movie Deletion Unsuccessfull",
            "origin":"DeleteMovieController"
        });
    }
};


module.exports = {
    addMovie,
    updateMovie,
    deleteMovie
};