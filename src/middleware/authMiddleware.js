// Password for modifying quotes (POST, PUT, DELETE)
// IMPORTANT: Set API_PASSWORD environment variable in production
const API_PASSWORD = process.env.API_PASSWORD;

if (!API_PASSWORD) {
    console.warn('⚠️  WARNING: API_PASSWORD environment variable not set!');
    console.warn('⚠️  Protected endpoints will not work properly.');
}

const authenticate = (req, res, next) => {
    const password = req.headers['api-password'];

    if (!password) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required. Please provide password in api-password header.'
        });
    }

    if (password !== API_PASSWORD) {
        return res.status(403).json({
            success: false,
            error: 'Invalid password. Access denied.'
        });
    }

    next();
};

module.exports = authenticate;
