const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken');
const User = require('../model/User');

exports.Protected = asyncHandler(async (req, res, next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('You are not logged in, Please Login to access this route', 401))
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById({ _id: decode.id })

    if (!user) {
        return next(new ErrorResponse('User Belonging to this token does not exist', 404))
    }

    req.user = user

    next()

})

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this role`, 401))
        }
        next()
    }
}