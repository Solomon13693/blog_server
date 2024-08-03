const asyncHandler = require('express-async-handler')
const User = require('../model/User')
const ErrorResponse = require('../utils/errorResponse')
const successResponse = require('../utils/successResponse')

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.RegisterAuthor = asyncHandler(async (req, res, next) => {

    const { email, phone, name, password } = req.body

    // CHECK EMAIL 
    const checkEmail = await User.findOne({ email: email })

    if (checkEmail) {
        return next(new ErrorResponse('Email already exist', 422))
    }

    // CHECK EMAIL 
    const checkPhone = await User.findOne({ phone: phone })

    if (checkPhone) {
        return next(new ErrorResponse('Phone already exist', 422))
    }

    const user = await User.create({
        email,
        phone,
        name,
        password
    })

    return successResponse(res, 201, 'Account created !, You can now login to your account')

})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.Login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Please enter your email address and password', 422));
    }

    const user = await User.findOne({ email: email }).select('+password +status')

    if (!user || !(await user.passwordCompare(password))) {
        return next(new ErrorResponse('Invalid login credientials', 401));
    }

    if (user.role != 'author') {
        return next(new ErrorResponse('Invalid login credientials', 401));
    }

    if (user.status == 'banned') {
        return next(new ErrorResponse('Your account has been banned, Contact the admin', 401));
    }

    const token = await user.jwtTokenGenerator()

    return res.status(200).json({
        success: true,
        token,
        user
    });

})
// @desc    Admin Login user
// @route   POST /api/v1/auth/admin/login
// @access  Public
exports.AdminLogin = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Please enter your email address and password', 422));
    }

    const user = await User.findOne({ email: email }).select('+password +status')

    if (!user || !(await user.passwordCompare(password))) {
        return next(new ErrorResponse('Invalid login credientials', 401));
    }

    if (user.role != 'admin') {
        return next(new ErrorResponse('Invalid login credientials', 401));
    }

    const token = await user.jwtTokenGenerator()

    return res.status(200).json({
        success: true,
        token,
        user
    });

})

// @desc    Update Profile
// @route   PATCH /api/v1/author/profile
// @access  Private
// exports.updateProfile = asyncHandler(async (req, res, next) => {
//     // Find the user by ID
//     const user = await User.findById(req.user.id);

//     if (!user) {
//         return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 404));
//     }

//     // Update user data
//     const data = {
//         name: req.body.name,
//         email: req.body.email,
//         phone: req.body.phone,
//         desc: req.body.about
//     };

//     // Find user by ID and update with new data
//     const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, data, {
//         runValidators: true,
//         new: true
//     });

//     // Return response
//     return res.status(200).json({
//         success: true,
//         message: 'User updated successfully',
//         user: updatedUser
//     });
// });

// @desc    Update Password
// @route   POST /api/v1/author/profile/image
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    // Find the user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 404));
    }

    // Prepare the updated data
    const updatedData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        desc: req.body.about,
    };

    // If the image is passed, add it to the updatedData
    if (req.file && req.file.filename) {
        updatedData.image = req.file.filename;
    }

    // Update the user
    const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, updatedData, {
        runValidators: true,
        new: true
    });

    console.log(req.file);

    // Return response
    return res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        user: updatedUser
    });
});


// @desc    Update Password
// @route   PATCH /api/v1/author/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.passwordCompare(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 400));
    }

    user.password = req.body.password
    await user.save()

    return res.status(200).json({
        status: 'success',
        message: 'Password has been updated successfully',
    })

})

