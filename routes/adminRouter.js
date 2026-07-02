const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const path = require('path')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

//Models

const Movie = require('../models/movie.model')

//ENVS
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

// JWT

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
                ok:false,
                origin:"JWT AUTH MIddleware - Invalid JWT Token"
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

const allowedRatings = [
    "15+ - Teens 15 or older",
    "13+ - Teens 13 or older",
    "18+ Restricted (violence & profanity)",
    "R - Restricted Screening (nudity & violence)",
    "G - All Age",
    "Not Yet Rated"
];

const AddMovieValidation = async (req, res, next) => {

    const AddMovieSchema = joi.object({
        Name: joi.string().trim().required(),
        Year: joi.number().integer().min(1800).max(new Date().getFullYear() + 10).required(),
        Genre: joi.string().trim().allow(''),
        "Main Cast": joi.string().trim().allow(''),
        Sinopsis: joi.string().trim().allow(''),
        Score: joi.number().min(0).max(10).required(),
        "Content Rating": joi.string().valid(...allowedRatings),
        Tags: joi.string().trim().allow(''),
        Network: joi.string().trim().allow(''),
        "img url": joi.string().uri().allow(''),
        Episode: joi.string().trim().allow(''),
        topPicks: joi.boolean()
    });

    const { error } = AddMovieSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "JOI: Invalid Add Movie Schema",
            status: 400,
            ok: false,
            error: error.details,
            "origin":"JOI Admin Movie Validation"
        });
    }

    const foundMovie = await Movie.findOne({
        Name: req.body.Name.trim(),
        Year: req.body.Year
    });

    if (foundMovie) {
        return res.status(409).json({
            message: "JOI: Movie Already Exists",
            status: 409,
            ok: false,
            "origin":"JOI Admin Movie Validation"
        });
    }

    next();
};

const UpdateMovieValidation = async (req, res, next) => {

    const UpdateMovieSchema = joi.object({
        id: joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }

            return value;
        }),

        Name: joi.string().trim(),
        Year: joi.number().integer().min(1800).max(new Date().getFullYear() + 10),
        Genre: joi.string().trim(),
        "Main Cast": joi.string().trim(),
        Sinopsis: joi.string().trim(),
        Score: joi.number().min(0).max(10),
        "Content Rating": joi.string().valid(...allowedRatings),
        Tags: joi.string().trim(),
        Network: joi.string().trim(),
        "img url": joi.string().uri(),
        Episode: joi.string().trim(),
        topPicks: joi.boolean()

    }).min(2);

    const { error } = UpdateMovieSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "JOI: Invalid Update Movie Schema",
            status: 400,
            ok: false,
            error: error.details,
            "origin":"JOI Admin Update Movie Validation"
        });
    }

    const foundMovie = await Movie.findById(req.body.id);

    if (!foundMovie) {
        return res.status(404).json({
            message: "JOI: Movie Doesnt Exists",
            status: 404,
            ok: false,
            "origin":"JOI Admin Update Movie Validation"
        });
    }

    if (req.body.Name && req.body.Year) {

        const duplicate = await Movie.findOne({
            Name: req.body.Name.trim(),
            Year: req.body.Year,
            _id: { $ne: req.body.id }
        });

        if (duplicate) {
            return res.status(409).json({
                message: "JOI: Another Movie Already Exists",
                status: 409,
                ok: false,
                "origin":"JOI Admin Update Movie Validation"
            });
        }
    }

    next();
};

const DeleteMovieValidation = async (req, res, next) => {

    const DeleteMovieSchema = joi.object({
        id: joi.string().required().custom((value, helpers) => {

            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }

            return value;
        })
    });

    const { error } = DeleteMovieSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "JOI: Invalid Delete Movie Schema",
            status: 400,
            ok: false,
            error: error.details,
            "origin":"JOI Admin Delete Movie Validation"
        });
    }

    const foundMovie = await Movie.findById(req.body.id);

    if (!foundMovie) {
        return res.status(404).json({
            message: "JOI: Movie Doesnt Exists",
            status: 404,
            ok: false,
            "origin":"JOI Admin Movie Validation"
        });
    }

    next();
};




const {
    getAllMovies,
    getMovieById,
    searchMovies,
    filterMovies,
    getTopPicks,
    getMoviesByGenres
} = require(path.join(__dirname, '..', 'controllers', 'movieController.js'))

const {
    addMovie,
    deleteMovie,
    updateMovie
} = require(path.join(__dirname, '..', 'controllers', 'adminController.js'))




router.post('/movies/add', AddMovieValidation, addMovie)
router.put('/movies/update', UpdateMovieValidation,  updateMovie)
router.delete('/movies/delete', DeleteMovieValidation, deleteMovie)

router.get('/movies', getAllMovies)
router.get('/movies/search', searchMovies)
router.get('/movies/filter', filterMovies)
router.get('/movies/top-picks', getTopPicks)
router.get('/movies/genres', getMoviesByGenres)
router.get('/movies/:id', getMovieById)

module.exports = router