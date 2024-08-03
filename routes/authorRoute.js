const express = require('express');
const { getPosts, getPost, getPostsAnalytics, getPostsChart } = require('../controller/AuthorController')
const { Protected } = require('../middleware/auth')
const router = express.Router()

router
    .route('/posts')
    .get(Protected, getPosts)

router
    .route('/posts/chart')
    .get(Protected, getPostsChart)

router
    .route('/posts/analytics')
    .get(Protected, getPostsAnalytics)

router
    .route('/post/:id')
    .get(Protected, getPost)

module.exports = router