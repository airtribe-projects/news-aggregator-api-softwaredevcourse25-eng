const axios = require('axios');
const usersModel = require('../models/usersModel');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';
const SUPPORTED_LANGUAGES = new Set(['ar', 'en', 'es', 'fr']);

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validateArticleId = (articleId) => {
    if (!articleId || typeof articleId !== 'string' || articleId.trim().length === 0) {
        throw createHttpError('Valid article id is required', 400);
    }
    return articleId.trim();
};

const validateKeyword = (keyword) => {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        throw createHttpError('Valid search keyword is required', 400);
    }
    return keyword.trim();
};

const mapArticles = (articles) => {
    return articles.slice(0, 5).map((article) => ({
        source: article.source?.name || null,
        author: article.author || null,
        title: article.title || null,
        description: article.description || null,
        url: article.url || null,
        urlToImage: article.urlToImage || null,
        publishedAt: article.publishedAt || null,
    }));
};

const fetchNewsFromApi = async (params) => {
    try {
        const response = await axios.get(NEWS_API_BASE_URL, { params });
        const articles = Array.isArray(response.data?.articles) ? response.data.articles : [];

        return {
            totalResults: response.data?.totalResults || 0,
            news: mapArticles(articles),
        };
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            const apiMessage = data?.message || 'News API request failed';

            if (status === 401) {
                throw createHttpError(`News API authentication failed: ${apiMessage}`, 401);
            }
            if (status === 429) {
                throw createHttpError(`News API rate limit exceeded: ${apiMessage}`, 429);
            }
            throw createHttpError(`News API failure: ${apiMessage}`, 502);
        }

        throw createHttpError(`Unable to fetch news: ${error.message}`, 502);
    }
};

const buildNewsQuery = (categories) => {
    if (!Array.isArray(categories) || categories.length === 0) {
        return 'news';
    }

    const cleanCategories = categories
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean);

    if (cleanCategories.length === 0) {
        return 'news';
    }

    return cleanCategories.join(' OR ');
};

const pickLanguage = (languages) => {
    if (!Array.isArray(languages) || languages.length === 0) {
        return undefined;
    }

    const firstLanguage = languages.find((value) => typeof value === 'string' && value.trim());
    if (!firstLanguage) {
        return undefined;
    }

    const normalized = firstLanguage.trim().toLowerCase();
    if (!SUPPORTED_LANGUAGES.has(normalized)) {
        return undefined;
    }

    return normalized;
};

const getNewsForUser = async (userId) => {
    if (!NEWS_API_KEY) {
        throw createHttpError('NEWS_API_KEY is not configured', 500);
    }

    const dbUser = await usersModel.findById(userId).select('preferences');
    if (!dbUser) {
        throw createHttpError('User not found', 404);
    }

    const categories = dbUser.preferences?.categories || [];
    const languages = dbUser.preferences?.languages || [];

    const params = {
        q: buildNewsQuery(categories),
        pageSize: 5,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY,
    };

    const language = pickLanguage(languages);
    if (language) {
        params.language = language;
    }

    return fetchNewsFromApi(params);
};

const searchNewsByKeyword = async (userId, keyword) => {
    if (!NEWS_API_KEY) {
        throw createHttpError('NEWS_API_KEY is not configured', 500);
    }

    const dbUser = await usersModel.findById(userId).select('preferences');
    if (!dbUser) {
        throw createHttpError('User not found', 404);
    }

    const validKeyword = validateKeyword(keyword);
    const language = pickLanguage(dbUser.preferences?.languages || []);

    const params = {
        q: validKeyword,
        pageSize: 5,
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY,
    };

    if (language) {
        params.language = language;
    }

    return fetchNewsFromApi(params);
};

const markArticleAsRead = async (userId, articleId) => {
    const validArticleId = validateArticleId(articleId);
    const updatedUser = await usersModel.findByIdAndUpdate(
        userId,
        { $addToSet: { readArticles: validArticleId } },
        { new: true }
    ).select('readArticles');

    if (!updatedUser) {
        throw createHttpError('User not found', 404);
    }

    return {
        message: 'Article marked as read',
        articleId: validArticleId,
        readArticles: updatedUser.readArticles || [],
    };
};

const markArticleAsFavorite = async (userId, articleId) => {
    const validArticleId = validateArticleId(articleId);
    const updatedUser = await usersModel.findByIdAndUpdate(
        userId,
        { $addToSet: { favoriteArticles: validArticleId } },
        { new: true }
    ).select('favoriteArticles');

    if (!updatedUser) {
        throw createHttpError('User not found', 404);
    }

    return {
        message: 'Article marked as favorite',
        articleId: validArticleId,
        favoriteArticles: updatedUser.favoriteArticles || [],
    };
};

const getReadArticles = async (userId) => {
    const dbUser = await usersModel.findById(userId).select('readArticles');
    if (!dbUser) {
        throw createHttpError('User not found', 404);
    }

    return { readArticles: dbUser.readArticles || [] };
};

const getFavoriteArticles = async (userId) => {
    const dbUser = await usersModel.findById(userId).select('favoriteArticles');
    if (!dbUser) {
        throw createHttpError('User not found', 404);
    }

    return { favoriteArticles: dbUser.favoriteArticles || [] };
};

module.exports = {
    getNewsForUser,
    markArticleAsRead,
    markArticleAsFavorite,
    getReadArticles,
    getFavoriteArticles,
    searchNewsByKeyword,
};
