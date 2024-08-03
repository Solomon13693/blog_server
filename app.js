const express = require('express')
require('dotenv').config()
require('colors')
const morgan = require('morgan')
const routes = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const ErrorResponse = require('./utils/errorResponse')
const connectDB = require('./config/db')
const cors = require('cors');

// Declear express
const app = express()

// CONNECT DATABASE
connectDB()

// Enable CORS for all routes
app.use(cors());

// STATIC FILE
app.use(express.static('public'))

app.use(morgan('dev'))

app.use(express.json())

// Declear route
app.use('/api/v1', routes)

// Catch-all route for handling "Route not found" error
app.use('*', (req, res, next) => {
    return next(new ErrorResponse(`${req.baseUrl} route not found`, 404))
})

// Error Handler
app.use(errorHandler)

module.exports = app;
