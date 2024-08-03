const mongooes = require('mongoose')

const categorySchema = new mongooes.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: [true]
    },
    image: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const Category = mongooes.model('Category', categorySchema)

module.exports = Category