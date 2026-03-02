const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserPreferences,
    updateUserPreferences
} = require('../controllers/usersController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/signup', async (req, res) => {
    try {
        const user = req.body;
        const dbUser = await registerUser(user);
        res.status(200).json(dbUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = req.body;
        const dbUser = await loginUser(user);
        res.status(200).json(dbUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// All routes declared after this line are protected.
router.use(authenticateToken);

router.get('/verify-token', (req, res) => {
    res.status(200).json({
        message: 'Token is valid',
        user: req.user
    });
});

router.get('/preferences', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }
        const data = await getUserPreferences(req.user.userId);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.put('/preferences', async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Invalid token payload. Please login again.' });
        }
        const data = await updateUserPreferences(req.user.userId, req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
});

module.exports = router;
