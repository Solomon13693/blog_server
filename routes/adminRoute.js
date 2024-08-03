const express = require('express');
const { Protected, authorize } = require('../middleware/auth');
const { getPosts, getPostsChart, getPostsAnalytics, getAuthors, authorActions, getPost } = require('../controller/AdminController');
const router = express.Router()

router
    .route('/posts')
    .get(Protected, authorize('admin'), getPosts);

router
    .route('/post/:id')
    .get(Protected, authorize('admin'), getPost);

router
    .route('/posts/chart')
    .get(Protected, authorize('admin'), getPostsChart)

router
    .route('/posts/analytics')
    .get(Protected, authorize('admin'), getPostsAnalytics)

router
    .route('/authors')
    .get(Protected, authorize('admin'), getAuthors)

router
    .route('/author/:id')
    .post(Protected, authorize('admin'), authorActions)


module.exports = router