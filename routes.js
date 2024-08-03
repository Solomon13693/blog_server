const express = require('express');
const router = express.Router();
const authRoute = require('./routes/authRoute')
const categoryRoute = require('./routes/categoryRoute')
const authorRoute = require('./routes/authorRoute')
const postRoute = require('./routes/postRoute')
const adminRoute = require('./routes/adminRoute')

router.use('/auth', authRoute)
router.use('/category', categoryRoute)
router.use('/post', postRoute)
router.use('/author', authorRoute)
router.use('/admin', adminRoute)

module.exports = router