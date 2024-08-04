const asyncHandler = require('../middleware/asyncHandler')
const Post = require('../model/Post')
const User = require('../model/User')
const Category = require('../model/Category')
const ErrorResponse = require('../utils/errorResponse')
const successResponse = require('../utils/successResponse')
const scheduleReminder = require('../utils/reminderUtils')

// @desc    Create Post
// @route   POST /api/v1/post/:categoryId
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {

    req.body.author = req.user
    req.body.category = req.body.category

    if (req.file) {
        req.body.image = req.file.filename
    }

    const exists = await Post.findOne({ title: req.body.title });

    if (exists) {
        return next(
            new ErrorResponse('Post title already exist', 402)
        );
    }

    if (req.body.status === 'published') {
        req.body.published = true;
    }

    const post = await Post.create(req.body)

    if (post.status == 'scheduled') {
        scheduleReminder(post, post?.scheduleDate)
    }

    successResponse(res, 201, 'Post Created !', post);

})

// @desc    Get Post
// @route   POST /api/v1/post
// @access  Public
exports.getPosts = asyncHandler(async (req, res) => {
    let query;

    const queryObj = { ...req.query };
    const removeField = ['select', 'sort', 'page', 'limit', 'search'];
    removeField.forEach(param => delete queryObj[param]);

    // Initialize the query
    query = Post.find(queryObj);

    const { select, sort, page, limit, search } = req.query;

    // Handle field selection
    if (select) {
        const fields = select.split(',').join(' ');
        query = query.select(fields);
    }

    // Handle sorting
    if (sort) {
        const fields = sort.split(',').join(' ');
        query = query.sort(fields);
    } else {
        query = query.sort('-createdAt');
    }

    // Handle search functionality
    if (search) {
        const searchTerm = search.toLowerCase(); // Convert search term to lowercase
        const searchTermRegex = new RegExp(searchTerm, 'i'); // Case-insensitive regex

        query.or([
            { title: searchTermRegex },
            { content: searchTermRegex },
            { tags: searchTermRegex }
        ]);
    }

    // Handle author filter
    if (queryObj.author) {
        const author = queryObj.author.toLowerCase();
        const user = await User.findOne({ name: new RegExp(author, 'i') }); // Case-insensitive regex
        if (user) {
            query = query.where('author').equals(user._id);
        }
    }

    // Handle category filter
    if (queryObj.category) {
        const category = queryObj.category.toLowerCase();
        const categoryDoc = await Category.findOne({ name: new RegExp(category, 'i') }); // Case-insensitive regex
        if (categoryDoc) {
            query = query.where('category').equals(categoryDoc._id);
        }
    }

    // Handle tags filter
    if (queryObj.tags) {
        const fields = queryObj.tags.split(',');
        query = query.where('tags').in(fields);
    }

    // Handle pagination
    const pages = parseInt(page, 10) || 1;
    const limits = parseInt(limit, 10) || 10;
    const startIndex = (pages - 1) * limits;
    const endIndex = pages * limits;
    const total = await Post.countDocuments();

    query = query.skip(startIndex).limit(limits);

    // Execute the query
    const posts = await query;

    // Prepare pagination result
    let pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: pages + 1,
            limit: limits
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: pages - 1,
            limit: limits
        };
    }

    // Send the response
    successResponse(res, 200, 'Posts retrieved successfully!', { posts, pagination });
});

exports.getRecentPosts = asyncHandler(async (req, res) => {

    const limit = parseInt(req.query.limit, 5) || 5;

    const recentPosts = await Post.find()
        .sort('-createdAt')
        .limit(limit)

    successResponse(res, 200, 'Recent posts retrieved successfully', recentPosts)

})

// @desc    Get Post by Id
// @route   POST /api/v1/post/:id
// @access  Public
exports.getPostBySlug = asyncHandler(async (req, res, next) => {

    const post = await Post.findOne({ slug: req.params.slug })

    if (!post) {
        return next(new ErrorResponse(`Post with ${req.params.slug} not found`, 404))
    }

    successResponse(res, 200, 'Post retrieved successfully !', { post });

})

// @desc    Update Post
// @route   PATCH /api/v1/post/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {

    const id = req.params.id

    const post = await Post.findById(id)
    const oldImage = post?.image;

    if (req.file) {
        req.body.image = req.file.filename
        if (oldImage && oldImage !== req.body.image) {
            deleteImage(oldImage);
        }
    }

    if (!post) {
        return next(new ErrorResponse(`Post with ${id} not found`, 404))
    }

    await Post.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    successResponse(res, 200, 'Post updated successfully !', { post });

})

// @desc    Delete Post
// @route   DELETE /api/v1/post/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {

    const { id } = req.params

    const post = await Post.findById(id)

    if (post?.image) {
        deleteImage(post.image);
    }

    if (!post) {
        return next(new ErrorResponse(`Post with ${id} not found`, 404))
    }

    await Post.findByIdAndDelete(id)

    successResponse(res, 200, 'Post deleted successfully !');

})

function deleteImage(filename) {

    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join('public/upload/posts/', filename);

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error(`Error deleting former image: ${err}`);
        }
    });

}
