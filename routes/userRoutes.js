const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Update routes to use the imported controller directly
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.get('/profile', userController.getUserProfile);
router.get('/all-users', userController.getAllUsers || ((req, res) => {
    res.status(501).json({ message: 'Not implemented' });
}));

module.exports = router;