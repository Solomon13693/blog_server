const { default: mongoose } = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler')
const Post = require('../model/Post')
const User = require('../model/User')
const ErrorResponse = require('../utils/errorResponse')
const successResponse = require('../utils/successResponse')
const moment = require('moment');


// @desc    Get Posts
// @route   POST /api/v1/admin/posts
// @access  Private
exports.getPosts = asyncHandler(async (req, res) => {

    // Extract filters, sorting options, and search term from the request query
    const { status, startDate, endDate, sort, search } = req.query;

    // Build the query object
    let query = { };

    if (status) {
        query.status = status;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }

    // Add search functionality
    if (search) {
        const searchTerm = new RegExp(search, 'i'); // Case-insensitive search
        query.$or = [
            { title: searchTerm },
            { content: searchTerm },
        ];
    }

    // Build the sort options
    let sortOption = {};
    if (sort === 'latest') {
        sortOption.createdAt = -1; // Sort by latest
    } else if (sort === 'alphabetical') {
        sortOption.title = 1; // Sort by alphabetical order (A-Z)
    }

    // Fetch posts based on the query and sort options
    const posts = await Post.find(query).sort(sortOption);

    successResponse(res, 200, 'Posts retrieved successfully', { posts });
});

exports.getPost = asyncHandler(async (req, res, next) => {

    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId })

    if (!post) {
        return next(new ErrorResponse(`Post ${postId} not found`, 404));
    }

    successResponse(res, 200, 'Post retrieved successfully!', { post });

});

// @desc    Get Post Analytics
// @route   POST /api/v1/admin/post/analytics
// @access  Private
exports.getPostsAnalytics = asyncHandler(async (req, res) => {

    const analytics = await Post.aggregate([
        {
            $group: {
                _id: { $toLower: "$status" },
                count: { $sum: 1 } // Count the number of posts in each group
            }
        }
    ]);

    const author = await User.find({ role: 'author' }).countDocuments();

    // Transform the analytics data to make it more readable
    const analyticsData = {
        authors: author,
        draft: 0,
        published: 0,
        scheduled: 0
    };

    analytics.forEach((item) => {
        analyticsData[item._id] = item.count;
    });

    successResponse(res, 200, 'Post retrieved successfully', { analytics: analyticsData });
    
});

// @desc    Get Post Charts
// @route   POST /api/v1/admin/post/charts
// @access  Private
exports.getPostsChart = asyncHandler(async (req, res) => {

    const { period = 'weekly' } = req.query; // Default to 'weekly' if not provided

    let groupByFormat;
    let dateLabels;

    if (period === 'monthly') {
        groupByFormat = '%Y-%m'; // Group by year-month
        dateLabels = moment.monthsShort(); // Short month names
    } else {
        groupByFormat = '%Y-%m-%d'; // Group by year-month-day
        dateLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; // Weekday labels
    }

    // Define the date range based on the selected period
    const startOfPeriod = period === 'monthly' 
        ? moment().startOf('year').toDate() 
        : moment().startOf('isoWeek').toDate();
    
    const endOfPeriod = period === 'monthly' 
        ? moment().endOf('year').toDate() 
        : moment().endOf('isoWeek').toDate();

    const analytics = await Post.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfPeriod,
                    $lte: endOfPeriod
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Sort by date
        }
    ]);

    // Prepare default labels for the chart with counts set to 0
    const chartData = dateLabels.map(label => ({
        label,
        count: "0"
    }));

    // Populate the chart data with the counts from the aggregation
    analytics.forEach(item => {
        const date = moment(item._id, period === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD');
        
        if (period === 'weekly') {
            const dayOfWeek = date.isoWeekday(); // Get the day of the week
            const labelIndex = dayOfWeek - 1;
            chartData[labelIndex].count = item.count.toString();
        } else {
            const monthIndex = date.month(); // Get the month index
            chartData[monthIndex].count = item.count.toString();
        }
    });

    const totalPosts = analytics.reduce((acc, item) => acc + item.count, 0);

    successResponse(res, 200, 'Chart data retrieved successfully', {
        chart: chartData,
        total: totalPosts
    });
});

// @desc    Get Authors
// @route   POST /api/v1/admin/authors/
// @access  Private
exports.getAuthors = asyncHandler(async (req, res) => {
    const { search } = req.query;

    // Initialize query object
    let query = { role: 'author' };

    // If there's a search term, add it to the query
    if (search) {
        const searchTerm = new RegExp(search, 'i'); // Case-insensitive search
        query.name = searchTerm;
    }

    // Fetch authors and aggregate post counts
    const authors = await User.aggregate([
        { $match: query }, // Match the authors based on query
        {
            $lookup: {
                from: 'posts', // The collection name for posts
                localField: '_id',
                foreignField: 'author',
                as: 'posts'
            }
        },
        {
            $addFields: {
                postCount: { $size: '$posts' } // Add a field to count the number of posts
            }
        },
        {
            $sort: { joined: -1 } // Sort by joined date (descending)
        },
        {
            $project: {
                posts: 0 // Exclude the posts array from the final result
            }
        }
    ]);

    // Send success response with the list of authors and post counts
    successResponse(res, 200, '', authors);
});

// @desc    Get Authors
// @route   POST /api/v1/admin/authors/
// @access  Private
exports.authorActions = asyncHandler(async (req, res, next) => {

    const author = await User.findById(req.params.id)

    const status = req.body.status

    if (!status) {
        return next(new ErrorResponse('Status is required', 422))
    }

    author.status = status
    await author.save()

    successResponse(res, 200, 'Author status updated successfully', author);

});
