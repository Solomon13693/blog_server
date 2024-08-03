const asyncHandler = require('../middleware/asyncHandler')
const Category = require('../model/Category')
const ErrorResponse = require('../utils/errorResponse')

// Create Category
// Protected Route
exports.CreateCategory = asyncHandler(async (req, res, next) => {

    const { name } = req.body

    const exist = await Category.findOne({ name: name })

    if (exist) {
        return next(new ErrorResponse('Category name already exist', 422))
    }

    if (req.file) {
        req.body.image = req.file.filename
    }

    const category = new Category()
    category.name = name
    category.image = req.body.image
    await category.save()

    return res.status(201).json({
        status: 'success',
        message: 'Category created !',
    })

})

// update Category
// Protected Route
exports.updateCategory = asyncHandler(async (req, res, next) => {

    const { name } = req.body;
    const id = req.params.id;

    const category = await Category.findById(id);

    if (!category) {
        return next(new ErrorResponse('Category not found', 422));
    }

    category.name = name;
    await category.save();

    return res.status(200).json({
        status: 'success',
        message: 'Category updated!',
    });

});

// Delete Category
// Protected Route
exports.deleteCategory = asyncHandler(async (req, res, next) => {

    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorResponse('Category not found', 422))
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        status: 'success',
        message: 'Category deleted !',
    })

})

// Get Category
// Public Route
exports.getCategories = asyncHandler(async (req, res, next) => {

    const categoriesWithPostCount = await Category.aggregate([
        {
            $lookup: {
                from: 'posts', // The collection name for posts
                localField: '_id',
                foreignField: 'category',
                as: 'posts'
            }
        },
        {
            $addFields: {
                postCount: { $size: '$posts' }
            }
        },
        {
            $project: {
                posts: 0 // Exclude posts array from the result
            }
        }
    ]);

    return res.status(200).json({
        status: 'success',
        category: categoriesWithPostCount
    })

})

// Get Single Category
// Public Route
exports.getCategory = asyncHandler(async (req, res, next) => {

    const category = await Category.findById(req.params.id)
    return res.status(200).json({
        status: 'success',
        category
    })

})

function deleteImage(filename) {

    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join('public/upload/categories/', filename);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(`Error deleting former image: ${err}`);
        }
    });
    
}