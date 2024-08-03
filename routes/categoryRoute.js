const express = require('express');
const { CreateCategory, updateCategory, deleteCategory, getCategories, getCategory } = require('../controller/CategoryController');
const { Protected, authorize } = require('../middleware/auth');

const multer = require('../config/multer')
const path = require('path')

const upload = multer(path.join('public/upload/categories/'));

const router = express.Router()

router
    .route('/')
    .get(getCategories)
    .post(Protected, authorize('admin'), upload.single('image'), CreateCategory)

router
    .route('/:id')
    .get(getCategory)
    .patch(Protected, authorize('admin'), updateCategory)
    .delete(Protected, authorize('admin'), deleteCategory)


module.exports = router