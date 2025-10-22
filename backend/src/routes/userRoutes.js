const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');

// 新增：注册验证规则
const registerValidationRules = [
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('用户名长度不能少于3位')
    .isAlphanumeric().withMessage('用户名只能包含字母和数字'),
  body('email')
    .isEmail().withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
];

// 新增：登录验证规则
const loginValidationRules = [
    body('email').isEmail().withMessage('请输入有效的邮箱地址').normalizeEmail(),
    body('password').notEmpty().withMessage('密码不能为空'),
];

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login (新增)
router.post('/login', userController.login);

module.exports = router;