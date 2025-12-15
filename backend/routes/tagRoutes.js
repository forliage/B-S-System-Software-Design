const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [tags] = await db.query('SELECT * FROM Tag ORDER BY name ASC');
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
