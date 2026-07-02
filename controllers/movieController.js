const mongoose = require('mongoose')

// Paths
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

// Models
const Movie = require('../models/movie.model')


const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find()
        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Obtained successfully',
            movies,
            origin: 'getAllMovies movieController - Retrieved'
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Server Error in Retrieving Movies',
            origin: 'getAllMovies movieController - Server Error',
            error: err
        })
    }
}

const getMovieById = async (req, res) => {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            ok: false,
            status: 400,
            message: 'Invalid movie id provided',
            origin: 'getMovieById movieController - Validation'
        })
    }

    try {
        const movie = await Movie.findById(id)

        if (!movie) {
            return res.status(404).json({
                ok: false,
                status: 404,
                message: 'Movie not found',
                origin: 'getMovieById movieController - Not Found'
            })
        }

        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Movie retrieved successfully',
            movie,
            origin: 'getMovieById movieController - Retrieved'
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Server Error in Retrieving Movie',
            origin: 'getMovieById movieController - Server Error',
            error: err
        })
    }
}





const buildTextSearchQuery = (searchTerm) => {
    const trimmed = String(searchTerm || '').trim()
    const regex = new RegExp(trimmed, 'i')

    return {
        $or: [
            { Name: regex },
            { Genre: regex },
            { 'Main Cast': regex },
            { Sinopsis: regex },
            { Tags: regex },
            { Network: regex },
            { 'Content Rating': regex },
            { Episode: regex },
            { 'img url': regex }
        ]
    }
}

const searchMovies = async (req, res) => {
    const { q } = req.query

    if (!q || !String(q).trim()) {
        return res.status(400).json({
            ok: false,
            status: 400,
            message: 'Search query is required',
            origin: 'searchMovies movieController - Validation'
        })
    }

    try {
        const movies = await Movie.find(buildTextSearchQuery(q))
        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Search completed successfully',
            query: q,
            movies,
            origin: 'searchMovies movieController - Retrieved'
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Server Error in Searching Movies',
            origin: 'searchMovies movieController - Server Error',
            error: err
        })
    }
}






const buildGenreQuery = (genre)=>{
    if(!genre) return null

    const genres = genre.split(',').map(g=>g.trim())

    return {
        $or: genres.map(g=>({
            Genre:{
                $regex:g,
                $options:'i'
            }
        }))
    }
}

const filterMovies = async (req,res)=>{
    const { genre, year, minScore, maxScore, contentRating, topPicks, network, tags } = req.query

    const filter = {}

    if(genre) Object.assign(filter, buildGenreQuery(genre))
    if(year && !Number.isNaN(Number(year))) filter.Year = Number(year)
    if(contentRating) filter['Content Rating'] = contentRating
    if(network) filter.Network = network
    if(tags) filter.Tags = { $regex: tags.trim(), $options:'i' }

    if(topPicks !== undefined){
        const normalized = String(topPicks).trim().toLowerCase()
        if(normalized === 'true' || normalized === 'false'){
            filter.topPicks = normalized === 'true'
        }
    }

    if(minScore || maxScore){
        filter.Score = {}
        if(minScore && !Number.isNaN(Number(minScore))) filter.Score.$gte = Number(minScore)
        if(maxScore && !Number.isNaN(Number(maxScore))) filter.Score.$lte = Number(maxScore)
        if(Object.keys(filter.Score).length === 0) delete filter.Score
    }

    try{
        const movies = await Movie.find(filter)

        return res.status(200).json({
            ok:true,
            status:200,
            message:'Filter completed successfully',
            filters:filter,
            movies,
            origin:'filterMovies movieController - Retrieved'
        })

    }catch(err){

        return res.status(500).json({
            ok:false,
            status:500,
            message:'Server Error in Filtering Movies',
            error:err,
            origin:'filterMovies movieController - Server Error'
        })

    }
}



const getTopPicks = async (req, res) => {
    try {
        const movies = await Movie.find({ topPicks: true })
        return res.status(200).json({
            ok: true,
            status: 200,
            message: 'Top picks retrieved successfully',
            movies,
            origin: 'getTopPicks movieController - Retrieved'
        })
    } catch (err) {
        return res.status(500).json({
            ok: false,
            status: 500,
            message: 'Server Error in Retrieving Top Picks',
            origin: 'getTopPicks movieController - Server Error',
            error: err
        })
    }
}

const getMoviesByGenres = async (req,res)=>{
    const { genre } = req.query

    if(!genre){
        return res.status(400).json({
            ok:false,
            status:400,
            message:"Genre query required"
        })
    }

    const genres = genre.split(',').map(g=>g.trim())

    try{
        const movies = await Movie.find({
            $or: genres.map(g=>({
                Genre:{
                    $regex:g,
                    $options:'i'
                }
            }))
        })

        return res.status(200).json({
            ok:true,
            status:200,
            genres,
            movies,
            origin:"getMoviesByGenres"
        })

    }catch(err){
        return res.status(500).json({
            ok:false,
            status:500,
            error:err
        })
    }
}




module.exports = {
    getAllMovies,
    getMovieById,
    searchMovies,
    filterMovies,
    getTopPicks,
    getMoviesByGenres
}
