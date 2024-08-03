const express = require('express');
const { RegisterAuthor, Login, AdminLogin, updatePassword, updateProfile, updateProfileImage } = require('../controller/AuthController');
const { Protected } = require('../middleware/auth');

const router = express.Router()

const multer = require('../config/multer')
const path = require('path')

const upload = multer(path.join('public/upload/profile/'));

router
    .route('/register')
    .post(RegisterAuthor);

router
    .route('/login')
    .post(Login)

router
    .route('/admin/login')
    .post(AdminLogin)

router
    .route('/profile/password')
    .patch(Protected, updatePassword)

router
    .route('/profile')
    .patch(Protected, upload.single('image'), updateProfile)

// router
//     .route('/profile/image')
//     .post(Protected, upload.single('image'), updateProfileImage)

module.exports = router