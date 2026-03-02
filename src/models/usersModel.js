const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true,
        trim: true,
    },
    email: {
        type: "String",
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: "String",
        required: true,
    },
    role: {
        type: "String",
        enum: ["admin", "user"],
        default: "user",
    },
    preferences: {
        categories: {
            type: ["String"],
            default: [],
        },
        languages: {
            type: ["String"],
            default: [],
        },
    },
    readArticles: {
        type: ["String"],
        default: [],
    },
    favoriteArticles: {
        type: ["String"],
        default: [],
    }
});

module.exports = mongoose.model('User', userSchema);
