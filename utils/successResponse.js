const successResponse = (res, statusCode, message, data) => {
    if (data) {
        return res.status(statusCode).json({
            success: true,
            message: message,
            data,
        });
    } else {
        return res.status(statusCode).json({
            success: true,
            message: message,
        });
    }
};


module.exports = successResponse