const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { userId: decoded.userId, username: decoded.username };
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token 无效或已过期' });
        }
    }
    if (!token) {
        res.status(401).json({ error: '未授权，没有 Token' });
    }
};

module.exports = { protect };