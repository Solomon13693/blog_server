const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Post title is required'],
            unique: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
        },
        image: {
            type: String,
            required: [true, 'Post Image is required'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        slug: {
            type: String,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'scheduled'],
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        scheduleDate: {
            type: Date,
            validate: {
                validator: function (value) {
                    if (this.status === 'scheduled' && !value) {
                        return false;
                    }
                    return true;
                },
                message: 'Schedule date is required when status is scheduled',
            },
        },
    },
    { timestamps: true }
);

postSchema.pre('save', function (next) {
    if (this.status === 'scheduled' && !this.scheduleDate) {
        next(new Error('Schedule date is required when status is scheduled'));
    } else {
        this.slug = slugify(this.title, {
            remove: undefined,
            strict: false,
            lower: true,
            locale: 'vi',
            trim: true,
        });
        next();
    }
});

postSchema.pre(/^find/, function (next) {
    this.populate({ path: 'author', select: 'name email' }).populate({
        path: 'category',
        select: 'name',
    });
    next();
});

// postSchema.pre(/^find/, function (next) {
//     this.where({ published: true });
//     next();
// });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
