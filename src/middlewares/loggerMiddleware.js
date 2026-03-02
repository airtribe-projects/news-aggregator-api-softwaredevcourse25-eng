const logger = (req, res, next) => {
    console.log("Received Request with ", req.method, " on ", req.url); 
    next();
}

module.exports = logger;