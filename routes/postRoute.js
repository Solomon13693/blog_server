const express = require('express');
const { getPosts, createPost, getPostById, updatePost, deletePost, getRecentPosts } = require('../controller/PostController')
const { Protected, authorize } = require('../middleware/auth')
const router = express.Router()
const multer = require('../config/multer')
const path = require('path')

const upload = multer(path.join('public/upload/posts/'));

router
    .route('/')
    .post(Protected, authorize('admin', 'author'), upload.single('image'), createPost);

router
    .route('/')
    .get(getPosts)

router
    .route('/recent')
    .get(getRecentPosts)

router
    .route('/:slug')
    .get(getPostById)

router
    .route('/:id')
    .patch(Protected, authorize('author'), upload.single('image'), updatePost)
    .delete(Protected, authorize('admin', 'author'), deletePost)

module.exports = router