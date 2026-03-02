const usersModel = require('../models/usersModel');
const bcrypt = require('bcrypt');
const SALT_ROUND = 5;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const registerUser = async (user) => {
    if (!user?.name || !user?.email || !user?.password) {
        throw createHttpError('Name, email, and password are required', 400);
    }

    if (!EMAIL_REGEX.test(String(user.email).trim())) {
        throw createHttpError('Invalid email format', 400);
    }

    if (typeof user.password !== 'string' || user.password.length < MIN_PASSWORD_LENGTH) {
        throw createHttpError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`, 400);
    }

    user.email = String(user.email).trim().toLowerCase();
    user.password = await bcrypt.hash(user.password, SALT_ROUND);
    try {
        const dbUser = await usersModel.create(user);
        return {
            id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
        };
    } catch (error) {
        if (error?.code === 11000) {
            throw createHttpError('Email already exists', 409);
        }
        if (error?.name === 'ValidationError') {
            throw createHttpError(error.message, 400);
        }
        throw error;
    }
};


const loginUser = async ({email, password}) => {
    if (!email || !password) {
        throw createHttpError('Email and password are required', 400);
    }

    if (!EMAIL_REGEX.test(String(email).trim())) {
        throw createHttpError('Invalid email format', 400);
    }
    
    const body = {
        email: String(email).trim().toLowerCase()
    };

    const dbUser = await usersModel.findOne(body);

    if (!dbUser) {
        throw createHttpError('Invalid email or password', 401);
    }

    const isSamePassword = await bcrypt.compare(password, dbUser.password)
    
    if (!isSamePassword) {
        throw createHttpError('Invalid email or password', 401);
    }

    if (!JWT_SECRET) {
        throw createHttpError('JWT_SECRET is not configured', 500);
    }

    const token = jwt.sign(
        { userId: dbUser._id, username: dbUser.name, email: dbUser.email, role: dbUser.role },
        JWT_SECRET,
        {expiresIn: '1h'}
    );

    return { token };
};

const getUserPreferences = async (userId) => {
    const dbUser = await usersModel.findById(userId).select('preferences');

    if (!dbUser) {
        throw createHttpError('User not found', 404);
    }

    return {
        preferences: {
            categories: dbUser.preferences?.categories || [],
            languages: dbUser.preferences?.languages || [],
        }
    };
};

const updateUserPreferences = async (userId, preferences) => {
    if (!preferences || typeof preferences !== 'object') {
        throw createHttpError('Preferences payload is required', 400);
    }

    const { categories, languages } = preferences;

    if (categories !== undefined && !Array.isArray(categories)) {
        throw createHttpError('categories must be an array', 400);
    }

    if (languages !== undefined && !Array.isArray(languages)) {
        throw createHttpError('languages must be an array', 400);
    }

    const updates = {};
    if (categories !== undefined) {
        updates['preferences.categories'] = categories.map((value) => value.trim().toLowerCase()).filter(Boolean);
    }
    if (languages !== undefined) {
        updates['preferences.languages'] = languages.map((value) => value.trim().toLowerCase()).filter(Boolean);
    }

    const updatedUser = await usersModel
        .findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
        .select('preferences');

    if (!updatedUser) {
        throw createHttpError('User not found', 404);
    }

    return {
        preferences: {
            categories: updatedUser.preferences?.categories || [],
            languages: updatedUser.preferences?.languages || [],
        }
    };
};

module.exports = {
    registerUser, 
    loginUser,
    getUserPreferences,
    updateUserPreferences
}
