const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const logger = require('./src/middlewares/loggerMiddleware')
const userRoute = require('./src/routes/userRoute')
const newsRoute = require('./src/routes/newsRoute')
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger)

app.use('/users', userRoute);
app.use('/news', newsRoute);

const startServer = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');

        app.listen(port, (err) => {
            if (err) {
                return console.log('Something bad happened', err);
            }
            console.log(`Server is listening on ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect MongoDB:', error.message);
        process.exit(1);
    }
};

startServer();



module.exports = app;
