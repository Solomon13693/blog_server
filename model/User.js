const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [8, 'Name must be a least 8 characters above'],
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email address is required"],
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email address'
        }
    },
    phone: {
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                return validator.isMobilePhone(v, 'any', { strictMode: true });
            },
            message: 'Phone number is not valid'
        },
        required: [true, "Phone number is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    },
    desc: {
        type: String,
        required: false,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'author'],
        default: 'author',
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active',
    },
    joined: {
        type: Date,
        default: Date.now()
    }
})

// Hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next
    this.password = await bcrypt.hash(this.password, 12)
})

// Compare password
userSchema.methods.passwordCompare = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// GENERATE JWT TOKEN
userSchema.methods.jwtTokenGenerator = async function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    })
}

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema)

module.exports = User