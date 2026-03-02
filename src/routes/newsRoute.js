const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const {
    getNewsForUser,
    markArticleAsRead,
    markArticleAsFavorite,
    getReadArticles,
    getFavoriteArticles,
    searchNewsByKeyword,
} = require('../controllers/newsController');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await getNewsForUser(req.user.userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/search/:keyword', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await searchNewsByKeyword(req.user.userId, req.params.keyword);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.post('/:id/read', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await markArticleAsRead(req.user.userId, req.params.id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.post('/:id/favorite', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await markArticleAsFavorite(req.user.userId, req.params.id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/read', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await getReadArticles(req.user.userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/favorites', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }

        const data = await getFavoriteArticles(req.user.userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

module.exports = router;
