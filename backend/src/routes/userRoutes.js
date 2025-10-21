const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login (新增)
router.post('/login', userController.login);

module.exports = router;