const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true }));

// Security Middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Limit requests from same API
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 3. Custom Sanitization Middleware (JSON/UrlEncoded)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
});


// Static files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholders
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Serve Frontend (Production)
if (process.env.NODE_ENV === 'production' || true) { // Always serve static for container simpliciy
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        if (req.url.startsWith('/api')) return res.status(404).json({ error: 'API not found' });
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Create uploads directory if not exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
