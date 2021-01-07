// ANCHOR -- Require Modules --
const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

// ANCHOR -- Initialize View Router --
const router = express.Router();

// ANCHOR -- View Routes --
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// ANCHOR -- Export Router --
module.exports = router;
