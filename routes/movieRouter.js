const express = require('express')
const path = require('path')
const router = express.Router()
const jwt = require('jsonwebtoken')



const {
    getAllMovies,
    getMovieById,
    searchMovies,
    filterMovies,
    getTopPicks,
    getMoviesByGenre,
    getMoviesByGenres
} = require(path.join(__dirname, '..', 'controllers', 'movieController.js'))


router.get('/movies', getAllMovies)
router.get('/movies/search', searchMovies)
router.get('/movies/filter', filterMovies)
router.get('/movies/top-picks', getTopPicks)
router.get('/movies/genres', getMoviesByGenres)
router.get('/movies/:id', getMovieById)

module.exports = router